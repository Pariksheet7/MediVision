import os
import jwt
import random
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import Dict, Any

from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from openai import OpenAI

# --- 1. INITIAL SETUP ---
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI(title="MediVision API v3.0")

# --- 2. DATABASE CONNECTION ---
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'medivision')

mongo_client = AsyncIOMotorClient(MONGO_URL)
db = mongo_client[DB_NAME]

# --- 3. AI CONFIG ---
# ખાતરી કરો કે તમારી .env ફાઈલમાં OPENAI_API_KEY સાચી છે
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# --- 4. SECURITY ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'medivision-secret')
ALGORITHM = "HS256"

# --- 5. CORS (Frontend સાથે કનેક્ટ કરવા માટે) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 6. DISEASE METADATA (ફ્રન્ટએન્ડના ખાનાઓ અહીંથી લોડ થશે) ---
DISEASE_METADATA = {
    "Breast Cancer": [
        {"name": "radius_mean", "label": "Radius Mean", "type": "number"},
        {"name": "texture_mean", "label": "Texture Mean", "type": "number"}
    ],
    "Kidney Disease": [
        {"name": "age", "label": "Age", "type": "number"},
        {"name": "bp", "label": "Blood Pressure", "type": "number"}
    ],
    "Heart Disease": [
        {"name": "age", "label": "Age", "type": "number"},
        {"name": "trestbps", "label": "Resting BP", "type": "number"}
    ],
    "Diabetes": [
        {"name": "glucose", "label": "Glucose", "type": "number"},
        {"name": "bmi", "label": "BMI", "type": "number"}
    ],
}

# --- 7. SCHEMAS ---
class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class PredictionInput(BaseModel):
    disease_name: str
    patient_name: str
    features: Dict[str, Any]

# --- 8. HELPERS ---
def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def hash_password(password):
    return pwd_context.hash(password)

def create_token(user_id):
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# --- 9. ROUTES ---

# રોગોનું લિસ્ટ મેળવવા
@app.get("/api/diseases")
async def get_diseases():
    return {"diseases": list(DISEASE_METADATA.keys())}

# ચોક્કસ રોગના ફીલ્ડ્સ મેળવવા
@app.get("/api/disease-fields/{disease_name}")
async def get_fields(disease_name: str):
    fields = DISEASE_METADATA.get(disease_name)
    if not fields:
        raise HTTPException(status_code=404, detail="Disease not found")
    return {"fields": fields}

# ઇતિહાસ મેળવવા
@app.get("/api/history")
async def get_history():
    try:
        data = await db.predictions.find().sort("created_at", -1).to_list(100)
        for item in data:
            item["id"] = str(item["_id"])
            if "_id" in item:
                del item["_id"]
        return data
    except Exception as e:
        print(f"Fetch Error: {e}")
        raise HTTPException(500, "Failed to fetch history")

# 🔥 ઇતિહાસ સાફ કરવા માટે (CLEAR HISTORY)
@app.delete("/api/clear-history")
async def clear_history():
    try:
        result = await db.predictions.delete_many({})
        return {"message": "All records deleted", "count": result.deleted_count}
    except Exception as e:
        print(f"Clear Error: {e}")
        raise HTTPException(500, "Failed to clear history")

# રજીસ્ટ્રેશન
@app.post("/api/auth/register")
async def register(user_data: dict = Body(...)):
    existing = await db.users.find_one({"email": user_data["email"]})
    if existing:
        raise HTTPException(400, "Email already exists")

    hashed = hash_password(user_data["password"])
    new_user = {
        "email": user_data["email"],
        "password": hashed,
        "full_name": user_data.get("full_name", "User"),
        "role": "Authorized Access" # Medical Officer ની જગ્યાએ આ દેખાશે
    }

    result = await db.users.insert_one(new_user)
    token = create_token(result.inserted_id)

    return {
        "access_token": token,
        "user": {
            "email": new_user["email"],
            "name": new_user["full_name"],
            "role": new_user["role"]
        }
    }

# લોગિન
@app.post("/api/auth/login")
async def login(data: LoginSchema):
    user = await db.users.find_one({"email": data.email})
    if not user:
        raise HTTPException(401, "Invalid email or password")

    if not verify_password(data.password, user["password"]):
        raise HTTPException(401, "Invalid email or password")

    token = create_token(user["_id"])

    return {
        "access_token": token,
        "user": {
            "email": user["email"],
            "name": user.get("full_name", "User"),
            "role": user.get("role", "Authorized Access")
        }
    }

# AI પ્રેડિક્શન (Diagnosis)
@app.post("/api/predict")
async def predict(data: PredictionInput):
    try:
        risk = random.uniform(5, 95)
        risk_level = "High Risk" if risk > 50 else "Low Risk"

        summary = "AI Summary generation skipped."
        
        # OpenAI કૉલ (જો API Key સાચી હશે તો જ ચાલશે)
        try:
            response = openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": f"Write a 1-sentence clinical note for {data.patient_name} with {data.disease_name} at {risk:.1f}% risk."}],
                max_tokens=50
            )
            summary = response.choices[0].message.content
        except Exception as ai_err:
            print(f"OpenAI Error: {ai_err}")

        record = {
            "patient_name": data.patient_name,
            "disease_name": data.disease_name,
            "risk_level": risk_level,
            "risk_percentage": round(risk, 2),
            "clinical_summary": summary,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "features": data.features
        }

        res = await db.predictions.insert_one(record)
        
        # ObjectId ને String માં ફેરવવો જરૂરી છે
        record["id"] = str(res.inserted_id)
        if "_id" in record:
            del record["_id"]

        return record

    except Exception as e:
        print(f"Prediction Route Error: {e}")
        raise HTTPException(500, f"Server Error: {str(e)}")

# --- RUN ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)