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
from bson import ObjectId

# ---------- SETUP ----------
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI(title="MediVision API")

# ---------- DATABASE ----------
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.getenv('DB_NAME', 'medivision')

mongo_client = AsyncIOMotorClient(MONGO_URL)
db = mongo_client[DB_NAME]

# ---------- AI ----------
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# ---------- SECURITY ----------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'medivision-secret')
ALGORITHM = "HS256"

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- DISEASES ----------
DISEASE_METADATA = {

    "Diabetes": [
        {"name": "glucose", "type": "number"},
        {"name": "blood_pressure", "type": "number"},
        {"name": "skin_thickness", "type": "number"},
        {"name": "insulin", "type": "number"},
        {"name": "bmi", "type": "number"},
        {"name": "diabetes_pedigree_function", "type": "number"},
        {"name": "age", "type": "number"},
        {"name": "pregnancies", "type": "number"},
        {"name": "cholesterol", "type": "number"},
        {"name": "weight", "type": "number"},
    ],

    "Heart Disease": [
        {"name": "age", "type": "number"},
        {"name": "sex", "type": "select", "options": ["Male", "Female"]},
        {"name": "chest_pain_type", "type": "select", "options": ["Typical", "Atypical", "Non-anginal", "Asymptomatic"]},
        {"name": "resting_blood_pressure", "type": "number"},
        {"name": "cholesterol", "type": "number"},
        {"name": "fasting_blood_sugar", "type": "select", "options": ["True", "False"]},
        {"name": "rest_ecg", "type": "select", "options": ["Normal", "Abnormal"]},
        {"name": "max_heart_rate", "type": "number"},
        {"name": "exercise_induced_angina", "type": "select", "options": ["Yes", "No"]},
        {"name": "oldpeak", "type": "number"},
        {"name": "slope", "type": "select", "options": ["Up", "Flat", "Down"]},
        {"name": "ca", "type": "number"},
        {"name": "thal", "type": "select", "options": ["Normal", "Defect"]},
    ],

    "Kidney Disease": [
        {"name": "age", "type": "number"},
        {"name": "blood_pressure", "type": "number"},
        {"name": "specific_gravity", "type": "number"},
        {"name": "albumin", "type": "number"},
        {"name": "sugar", "type": "number"},
        {"name": "red_blood_cells", "type": "select", "options": ["Normal", "Abnormal"]},
        {"name": "pus_cell", "type": "select", "options": ["Normal", "Abnormal"]},
        {"name": "blood_glucose_random", "type": "number"},
        {"name": "blood_urea", "type": "number"},
        {"name": "serum_creatinine", "type": "number"},
        {"name": "sodium", "type": "number"},
        {"name": "potassium", "type": "number"},
        {"name": "hemoglobin", "type": "number"},
        {"name": "packed_cell_volume", "type": "number"},
    ],

    "Breast Cancer": [
        {"name": "radius_mean", "type": "number"},
        {"name": "texture_mean", "type": "number"},
        {"name": "perimeter_mean", "type": "number"},
        {"name": "area_mean", "type": "number"},
        {"name": "smoothness_mean", "type": "number"},
        {"name": "compactness_mean", "type": "number"},
        {"name": "concavity_mean", "type": "number"},
        {"name": "concave_points_mean", "type": "number"},
        {"name": "symmetry_mean", "type": "number"},
        {"name": "fractal_dimension_mean", "type": "number"},
        {"name": "radius_se", "type": "number"},
        {"name": "texture_se", "type": "number"},
        {"name": "perimeter_se", "type": "number"},
        {"name": "area_se", "type": "number"},
    ]
}

# ---------- SCHEMAS ----------
class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class PredictionInput(BaseModel):
    disease_name: str
    patient_name: str
    features: Dict[str, Any]

class ChatRequest(BaseModel):
    message: str

# ---------- HELPERS ----------
def verify_password(p, h):
    return pwd_context.verify(p, h)

def hash_password(p):
    return pwd_context.hash(p)

def create_token(uid):
    payload = {
        "sub": str(uid),
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# ---------- ROUTES ----------

@app.get("/api/diseases")
async def get_diseases():
    return {"diseases": list(DISEASE_METADATA.keys())}

@app.get("/api/disease-fields/{disease_name}")
async def get_fields(disease_name: str):
    return {"fields": DISEASE_METADATA.get(disease_name, [])}

# ---------- HISTORY ----------
@app.get("/api/history")
async def get_history():
    data = await db.predictions.find().sort("created_at", -1).to_list(100)
    for item in data:
        item["_id"] = str(item["_id"])
    return data

@app.delete("/api/delete-history/{prediction_id}")
async def delete_prediction(prediction_id: str):
    result = await db.predictions.delete_one({"_id": ObjectId(prediction_id)})
    if result.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

@app.delete("/api/clear-history")
async def clear_history():
    result = await db.predictions.delete_many({})
    return {"message": "Cleared", "count": result.deleted_count}

# ---------- AUTH ----------
@app.post("/api/auth/register")
async def register(user_data: dict = Body(...)):
    user_data["password"] = hash_password(user_data["password"])
    user_data["full_name"] = user_data.get("full_name")

    res = await db.users.insert_one(user_data)
    token = create_token(res.inserted_id)

    return {
        "access_token": token,
        "user": {
            "email": user_data["email"],
            "name": user_data["full_name"]
        }
    }

@app.post("/api/auth/login")
async def login(data: LoginSchema):
    user = await db.users.find_one({"email": data.email})

    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(401, "Invalid login")

    token = create_token(user["_id"])

    return {
        "access_token": token,
        "user": {
            "email": user["email"],
            "name": user.get("full_name", "User")
        }
    }

# ---------- UPDATE PROFILE ----------
@app.put("/api/auth/update-profile")
async def update_profile(data: dict = Body(...)):
    result = await db.users.update_one(
        {"email": data.get("email")},
        {"$set": {"full_name": data.get("full_name")}}
    )

    if result.modified_count == 0:
        raise HTTPException(404, "User not found")

    return {"message": "Profile updated"}

# ---------- PREDICTION ----------
# ---------- PREDICTION ----------
# ---------- PREDICTION ----------
@app.post("/api/predict")
async def predict(data: PredictionInput):

    # 🔥 STRICT VALIDATION
    required_fields = DISEASE_METADATA.get(data.disease_name, [])
    missing_fields = []

    mapping = {
        "Male": 1, "Female": 0,
        "Yes": 1, "No": 0,
        "True": 1, "False": 0,
        "Normal": 1, "Abnormal": 0
    }

    features = {}

    for field in required_fields:
        name = field.get("name")
        value = data.features.get(name)

        if isinstance(value, str):
            value = mapping.get(value, value)

        if value is None or value == "" or str(value).strip() == "":
            missing_fields.append(name)
        else:
            try:
                features[name] = float(value)
            except:
                features[name] = 0

    if missing_fields:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required parameters: {', '.join(missing_fields)}"
        )

    try:
        # 🔥 EXPLAINABLE RISK LOGIC
        risk = 0
        impact_details = []

        for key, val in features.items():
            contribution = 0
            reason = ""

            if data.disease_name == "Diabetes":
                if key == "glucose":
                    contribution = val * 0.2
                    reason = "High glucose level"
                elif key == "bmi":
                    contribution = val * 0.1
                    reason = "High BMI"
                elif key == "age":
                    contribution = val * 0.05
                    reason = "Age factor"

            elif data.disease_name == "Heart Disease":
                if key == "cholesterol":
                    contribution = val * 0.15
                    reason = "High cholesterol"
                elif key == "max_heart_rate":
                    contribution = val * 0.1
                    reason = "Heart rate impact"
                elif key == "age":
                    contribution = val * 0.08
                    reason = "Age factor"

            elif data.disease_name == "Kidney Disease":
                if key == "serum_creatinine":
                    contribution = val * 0.2
                    reason = "Creatinine level"
                elif key == "blood_urea":
                    contribution = val * 0.15
                    reason = "Urea level"

            elif data.disease_name == "Breast Cancer":
                if key == "radius_mean":
                    contribution = val * 0.1
                    reason = "Tumor radius"
                elif key == "area_mean":
                    contribution = val * 0.1
                    reason = "Tumor area"

            if contribution > 0:
                risk += contribution
                impact_details.append({
                    "feature": key,
                    "value": val,
                    "impact": round(contribution, 2),
                    "reason": reason
                })

        risk = min(max(risk, 5), 100)
        risk_level = "High Risk" if risk >= 50 else "Low Risk"

        impact_details = sorted(impact_details, key=lambda x: x["impact"], reverse=True)
        top_factors = impact_details[:3]

        # 🔥 AI SUMMARY (UNCHANGED)
        content = f"""
You are an expert medical assistant.

Patient Name: {data.patient_name}
Disease: {data.disease_name}
Risk Level: {risk_level}
Risk Percentage: {round(risk, 2)}%

Clinical Inputs:
{features}

Provide a short explanation including:
- What this risk means
- Possible causes
- Recommended next steps
- Preventive advice
"""

        if risk_level == "High Risk":
            summary = f"{data.patient_name} shows a high risk for {data.disease_name}. Immediate consultation is recommended."
        else:
            summary = f"{data.patient_name} shows a low risk for {data.disease_name}. Maintain healthy habits."

        try:
            response = openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": content}],
                max_tokens=150
            )
            summary = response.choices[0].message.content
        except Exception as e:
            print("AI Error:", e)

        # 🔥 OLD IMPACT (UNCHANGED)
        sorted_features = sorted(features.items(), key=lambda x: x[1], reverse=True)
        top_features = [f"{k} ({v})" for k, v in sorted_features[:3]]
        impact_text = f"The main contributing factors are: {', '.join(top_features)}."

        # 🔥 NEW: RECOMMENDATIONS
        recommendations = []
        for f in top_factors:
            if "glucose" in f["feature"]:
                recommendations.append("Maintain blood sugar through proper diet and medication.")
            elif "bmi" in f["feature"]:
                recommendations.append("Engage in regular physical activity and weight control.")
            elif "cholesterol" in f["feature"]:
                recommendations.append("Reduce intake of fatty foods and monitor cholesterol levels.")
            elif "age" in f["feature"]:
                recommendations.append("Regular medical checkups are strongly recommended.")
            elif "creatinine" in f["feature"]:
                recommendations.append("Monitor kidney function and stay hydrated.")
            else:
                recommendations.append(f"Control {f['feature']} within normal range.")

        # 🔥 NEW: THEORY
        theory = f"""
The predicted risk is classified as {risk_level} based on clinical parameters provided.

Key contributing factors such as {', '.join([f['feature'] for f in top_factors])}
have significant medical correlation with {data.disease_name}.

Elevated values in these parameters increase the likelihood of disease progression.
Maintaining these values within clinically accepted ranges can help reduce the overall risk.
"""

        # 🔥 FINAL RECORD
        record = {
            "patient_name": data.patient_name,
            "disease_name": data.disease_name,
            "risk_level": risk_level,
            "risk_percentage": round(risk, 2),

            "clinical_summary": summary + " " + impact_text,

            "top_factors": top_factors,
            "impact_factors": top_features,

            # 🔥 NEW
            "recommendations": recommendations,
            "theory": theory,

            "created_at": datetime.now(timezone.utc).isoformat(),
            "features": features
        }

        res = await db.predictions.insert_one(record)
        record["_id"] = str(res.inserted_id)

        return record

    except Exception as e:
        print("Prediction Error:", e)
        raise HTTPException(500, "Prediction failed")

# ---------- CHATBOT ----------
@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a medical assistant."},
                {"role": "user", "content": request.message}
            ],
            max_tokens=100
        )

        return {"reply": response.choices[0].message.content}

    except Exception as e:
        print("Chat Error:", e)
        return {"reply": "⚠️ AI temporarily unavailable."}

# ---------- RUN ----------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)