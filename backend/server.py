from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
from ml_service.predictor import predictor

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'medivision-secret-key-change-in-production')
ALGORITHM = "HS256"

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Pydantic Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

class PredictionInput(BaseModel):
    disease_name: str
    patient_name: str
    features: Dict[str, Any]

class PredictionResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    disease_name: str
    patient_name: str
    features: Dict[str, Any]
    prediction: int
    risk_level: str
    risk_percentage: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DashboardStats(BaseModel):
    total_predictions: int
    high_risk_count: int
    low_risk_count: int
    recent_predictions: int

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = timedelta(days=7)):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

# Routes
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        full_name=user_data.full_name
    )
    
    user_doc = user.model_dump()
    user_doc['password'] = hash_password(user_data.password)
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    
    await db.users.insert_one(user_doc)
    
    # Create token
    access_token = create_access_token(data={"sub": user.id})
    
    return TokenResponse(access_token=access_token, user=user)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(credentials.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Remove password from response
    del user_doc['password']
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user = User(**user_doc)
    access_token = create_access_token(data={"sub": user.id})
    
    return TokenResponse(access_token=access_token, user=user)

@api_router.post("/predict", response_model=PredictionResult)
async def predict_disease(input_data: PredictionInput, current_user: User = Depends(get_current_user)):
    try:
        # Make prediction
        result = predictor.predict(input_data.disease_name, input_data.features)
        
        # Create prediction record
        prediction = PredictionResult(
            user_id=current_user.id,
            disease_name=input_data.disease_name,
            patient_name=input_data.patient_name,
            features=input_data.features,
            prediction=result['prediction'],
            risk_level=result['risk_level'],
            risk_percentage=result['risk_percentage']
        )
        
        # Save to database
        pred_doc = prediction.model_dump()
        pred_doc['created_at'] = pred_doc['created_at'].isoformat()
        await db.predictions.insert_one(pred_doc)
        
        return prediction
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Model not trained. Please train models first.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@api_router.get("/history", response_model=List[PredictionResult])
async def get_prediction_history(current_user: User = Depends(get_current_user)):
    predictions = await db.predictions.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(50)
    
    for pred in predictions:
        if isinstance(pred['created_at'], str):
            pred['created_at'] = datetime.fromisoformat(pred['created_at'])
    
    return predictions

@api_router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    # Get all predictions for user
    predictions = await db.predictions.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).to_list(1000)
    
    total = len(predictions)
    high_risk = sum(1 for p in predictions if p.get('risk_level') == 'High Risk')
    low_risk = total - high_risk
    
    # Recent predictions (last 7 days)
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent = sum(
        1 for p in predictions 
        if datetime.fromisoformat(p['created_at']) > seven_days_ago
    )
    
    return DashboardStats(
        total_predictions=total,
        high_risk_count=high_risk,
        low_risk_count=low_risk,
        recent_predictions=recent
    )

@api_router.get("/diseases")
async def get_diseases():
    return {
        "diseases": [
            "Heart Disease",
            "Diabetes",
            "Kidney Disease",
            "Liver Disease",
            "Breast Cancer",
            "Parkinsons Disease",
            "Stroke Risk",
            "Hypertension"
        ]
    }

@api_router.get("/disease-features/{disease_name}")
async def get_disease_features(disease_name: str):
    model_key = disease_name.lower().replace(' ', '_')
    feature_config = predictor.feature_configs.get(model_key)
    
    if not feature_config:
        raise HTTPException(status_code=404, detail="Disease not found")
    
    return {
        "disease_name": disease_name,
        "features": feature_config['features'],
        "form_fields": feature_config['form_fields']
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
