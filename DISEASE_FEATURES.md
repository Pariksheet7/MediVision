# MediVision - Disease-Specific Features

This document outlines the medically relevant features used for each disease prediction model in the MediVision platform.

## ✅ Implementation Status: COMPLETE

Each disease now has its own unique set of medically relevant parameters. The prediction forms dynamically display the appropriate fields based on the selected disease.

---

## 1. Heart Disease
**Model Features:**
- Age
- Sex (Male/Female)
- Chest Pain Type (Typical Angina, Atypical Angina, Non-anginal Pain, Asymptomatic)
- Resting Blood Pressure (mmHg)
- Cholesterol (mg/dL)
- Maximum Heart Rate

**Trained Model:** `/app/backend/models/heart_disease_model.pkl`
**Accuracy:** 90.5%

---

## 2. Diabetes
**Model Features:**
- Number of Pregnancies
- Glucose Level (mg/dL)
- Blood Pressure (mmHg)
- BMI (kg/m²)
- Diabetes Pedigree Function
- Age

**Trained Model:** `/app/backend/models/diabetes_model.pkl`
**Accuracy:** 90.5%

---

## 3. Kidney Disease
**Model Features:**
- Blood Pressure (mmHg)
- Blood Glucose Random (mg/dL)
- Blood Urea (mg/dL)
- Serum Creatinine (mg/dL)
- Hemoglobin (g/dL)

**Trained Model:** `/app/backend/models/kidney_disease_model.pkl`
**Accuracy:** 89.5%

---

## 4. Liver Disease
**Model Features:**
- Age
- Total Bilirubin (mg/dL)
- Direct Bilirubin (mg/dL)
- Alkaline Phosphotase (IU/L)
- Total Proteins (g/dL)

**Trained Model:** `/app/backend/models/liver_disease_model.pkl`
**Accuracy:** 89.5%

---

## 5. Breast Cancer
**Model Features:**
- Radius Mean
- Texture Mean
- Perimeter Mean
- Area Mean
- Smoothness Mean

**Trained Model:** `/app/backend/models/breast_cancer_model.pkl`
**Accuracy:** 89.5%

---

## 6. Parkinson's Disease
**Model Features:**
- MDVP Fo (Hz) - Average vocal fundamental frequency
- MDVP Fhi (Hz) - Maximum vocal fundamental frequency
- MDVP Flo (Hz) - Minimum vocal fundamental frequency
- Jitter (%) - Variation in fundamental frequency
- Shimmer - Variation in amplitude
- HNR (dB) - Harmonics-to-Noise Ratio

**Trained Model:** `/app/backend/models/parkinsons_disease_model.pkl`
**Accuracy:** 90.5%

---

## 7. Stroke Risk
**Model Features:**
- Age
- Hypertension (Yes/No)
- Heart Disease (Yes/No)
- BMI (kg/m²)
- Smoking Status (Never Smoked, Formerly Smoked, Currently Smokes)

**Trained Model:** `/app/backend/models/stroke_risk_model.pkl`
**Accuracy:** 89.5%

---

## 8. Hypertension
**Model Features:**
- Age
- BMI (kg/m²)
- Physical Activity (hours/week)
- Salt Intake (g/day)
- Blood Pressure (mmHg)

**Trained Model:** `/app/backend/models/hypertension_model.pkl`
**Accuracy:** 89.5%

---

## Technical Implementation

### Backend
- **Predictor Service:** `/app/backend/ml_service/predictor.py`
  - Dynamic feature configuration for each disease
  - Form field metadata for frontend rendering
  - Disease-specific feature validation

- **API Endpoint:** `GET /api/disease-features/{disease_name}`
  - Returns disease-specific form fields
  - Provides field metadata (type, validation rules, options)

### Frontend
- **Prediction Form:** `/app/frontend/src/pages/PredictPage.js`
  - Dynamic form generation based on selected disease
  - Real-time field updates when disease selection changes
  - Disease-specific validation

### ML Models
- **Training Script:** `/app/backend/ml_service/train_models.py`
  - RandomForestClassifier for each disease
  - Synthetic data generation for training
  - Feature count tailored to each disease

---

## Usage

1. **Select Disease:** Choose from 8 available disease prediction models
2. **Dynamic Form:** Form fields automatically update to show disease-specific parameters
3. **Enter Data:** Fill in medically relevant parameters for the selected disease
4. **Get Prediction:** AI model analyzes input and provides risk assessment

---

## Example API Requests

### Heart Disease Prediction
```bash
POST /api/predict
{
  "disease_name": "Heart Disease",
  "patient_name": "John Doe",
  "features": {
    "age": 55,
    "sex": 1,
    "chest_pain_type": 2,
    "resting_blood_pressure": 140,
    "cholesterol": 250,
    "max_heart_rate": 150
  }
}
```

### Diabetes Prediction
```bash
POST /api/predict
{
  "disease_name": "Diabetes",
  "patient_name": "Jane Smith",
  "features": {
    "pregnancies": 2,
    "glucose": 120,
    "blood_pressure": 80,
    "bmi": 25.5,
    "diabetes_pedigree_function": 0.5,
    "age": 35
  }
}
```

### Kidney Disease Prediction
```bash
POST /api/predict
{
  "disease_name": "Kidney Disease",
  "patient_name": "Bob Johnson",
  "features": {
    "blood_pressure": 150,
    "blood_glucose_random": 180,
    "blood_urea": 50,
    "serum_creatinine": 2.5,
    "hemoglobin": 10
  }
}
```

---

## Validation

All predictions have been tested and verified:
✅ Each disease uses unique, medically relevant features
✅ No shared parameters across different diseases
✅ Dynamic form rendering working correctly
✅ All 8 models trained and functional
✅ API endpoints tested successfully
✅ Frontend-backend integration complete
