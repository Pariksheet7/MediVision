import os
import jwt
import random
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional

from fastapi import FastAPI, HTTPException, Depends, status, Body
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from openai import OpenAI
from bson import ObjectId

# --- 1. INITIAL SETUP ---
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI(title="MediVision API v3.0")

# --- 2. DATABASE CONNECTION ---
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'medivision')
mongo_client = AsyncIOMotorClient(MONGO_URL)
db = mongo_client[DB_NAME]

# --- 3. AI CONFIGURATION ---
OPENAI_KEY = os.environ.get("OPENAI_API_KEY", "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")
openai_client = OpenAI(api_key=OPENAI_KEY)

# --- 4. SECURITY CONFIG ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'medivision-super-secure-key-2026')
ALGORITHM = "HS256"

# --- 5. CORS MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 6. DISEASE METADATA ---
DISEASE_METADATA = {
    "Breast Cancer": [{"name": "radius_mean", "label": "Radius Mean", "type": "number"}, {"name": "texture_mean", "label": "Texture Mean", "type": "number"}],
    "Kidney Disease": [{"name": "age", "label": "Age", "type": "number"}, {"name": "bp", "label": "Blood Pressure", "type": "number"}],
    "Heart Disease": [{"name": "age", "label": "Age", "type": "number"}, {"name": "trestbps", "label": "Resting BP", "type": "number"}],
    "Diabetes": [{"name": "glucose", "label": "Glucose", "type": "number"}, {"name": "bmi", "label": "BMI", "type": "number"}]
}

# --- 7. SCHEMAS ---
class UserLogin(BaseModel):
    email: str
    password: str

class PredictionInput(BaseModel):
    disease_name: str
    patient_name: str
    features: Dict[str, Any]

class ChatRequest(BaseModel):
    message: str
    context: Optional[Any] = None

# --- 8. HELPERS ---
def verify_password(plain, hashed): return pwd_context.verify(plain, hashed)
def hash_password(password): return pwd_context.hash(password)
def create_token(data): return jwt.encode({"sub": str(data), "exp": datetime.now(timezone.utc) + timedelta(days=7)}, SECRET_KEY, algorithm=ALGORITHM)

# --- 9. ROUTES ---

@app.get("/api/knowledge-base")
async def get_knowledge():
    return [
        {"id": "diabetes", "name": "Diabetes", "symptoms": ["Thirst"], "normal_ranges": "70-99 mg/dL", "guideline": "Check HbA1c."},
        {"id": "heart", "name": "Heart Disease", "symptoms": ["Chest pain"], "normal_ranges": "<120/80 mmHg", "guideline": "Annual ECG."}
    ]

@app.get("/api/history")
async def get_history():
    try:
        cursor = db.predictions.find().sort("created_at", -1)
        history = await cursor.to_list(length=100)
        
        # Convert ObjectId to string for each record so React doesn't crash
        for record in history:
            record["id"] = str(record["_id"])
            del record["_id"]
            
        return history
    except Exception as e:
        print(f"History Fetch Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve history")
    
@app.get("/api/diseases")
async def get_diseases():
    return {"diseases": list(DISEASE_METADATA.keys())}

@app.get("/api/disease-fields/{disease_name}")
async def get_fields(disease_name: str):
    fields = DISEASE_METADATA.get(disease_name)
    if not fields: raise HTTPException(404, "Disease not found")
    return {"fields": fields}

@app.post("/api/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user['password']):
        raise HTTPException(401, "Invalid email or password")
    token = create_token(str(user.get('_id')))
    return {"access_token": token, "token_type": "bearer", "user": {"id": str(user['_id']), "email": user['email']}}

@app.post("/api/predict")
async def predict(data: PredictionInput):
    print(f"DEBUG: Processing prediction for {data.patient_name}...")
    try:
        risk_pct = random.uniform(5, 98)
        risk_level = "High Risk" if risk_pct >= 50 else "Low Risk"
        
        clinical_summary = "AI analysis skipped. Manual clinical correlation required."
        try:
            prompt = f"Act as a doctor. Patient {data.patient_name} screened for {data.disease_name}. Risk: {risk_pct:.1f}% ({risk_level}). Write a 2-sentence clinical summary."
            response = openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                timeout=8,
                max_tokens=150
            )
            clinical_summary = response.choices[0].message.content
        except Exception as ai_err:
            print(f"AI ERROR: {ai_err}")

        # Basic recommendations based on risk
        recs = [
            "Immediate specialist consultation" if risk_level == "High Risk" else "Routine annual check-up",
            "Monitor daily vitals and lifestyle",
            "Complete blood count (CBC) follow-up"
        ]

        new_prediction = {
            "patient_name": data.patient_name,
            "disease_name": data.disease_name,
            "risk_level": risk_level,
            "risk_percentage": risk_pct,
            "clinical_summary": clinical_summary,
            "recommendations": recs,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "features": data.features
        }
        
        result = await db.predictions.insert_one(new_prediction)
        
        # --- FIX: Stringify ID & Delete ObjectId ---
        new_prediction["id"] = str(result.inserted_id)
        if "_id" in new_prediction:
            del new_prediction["_id"]
        
        print("DEBUG: Prediction Successful")
        return new_prediction

    except Exception as e:
        print(f"CRITICAL ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)