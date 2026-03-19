import joblib
import numpy as np
from pathlib import Path
from typing import Dict, List

BASE_DIR = Path(__file__).parent.parent
MODELS_DIR = BASE_DIR / 'models'

class DiseasePredictor:
    def __init__(self):
        self.models = {}
        self.feature_configs = {
            'heart_disease': {
                'features': ['age', 'sex', 'chest_pain_type', 'resting_blood_pressure', 'cholesterol', 'max_heart_rate'],
                'n_features': 6,
                'form_fields': [
                    {'name': 'age', 'label': 'Age', 'type': 'number', 'min': 1, 'max': 120, 'required': True},
                    {'name': 'sex', 'label': 'Sex', 'type': 'select', 'options': [{'value': 0, 'label': 'Female'}, {'value': 1, 'label': 'Male'}], 'required': True},
                    {'name': 'chest_pain_type', 'label': 'Chest Pain Type', 'type': 'select', 'options': [{'value': 0, 'label': 'Typical Angina'}, {'value': 1, 'label': 'Atypical Angina'}, {'value': 2, 'label': 'Non-anginal Pain'}, {'value': 3, 'label': 'Asymptomatic'}], 'required': True},
                    {'name': 'resting_blood_pressure', 'label': 'Resting Blood Pressure (mmHg)', 'type': 'number', 'min': 50, 'max': 250, 'required': True},
                    {'name': 'cholesterol', 'label': 'Cholesterol (mg/dL)', 'type': 'number', 'min': 100, 'max': 600, 'required': True},
                    {'name': 'max_heart_rate', 'label': 'Maximum Heart Rate', 'type': 'number', 'min': 60, 'max': 220, 'required': True}
                ]
            },
            'diabetes': {
                'features': ['pregnancies', 'glucose', 'blood_pressure', 'bmi', 'diabetes_pedigree_function', 'age'],
                'n_features': 6,
                'form_fields': [
                    {'name': 'pregnancies', 'label': 'Number of Pregnancies', 'type': 'number', 'min': 0, 'max': 20, 'required': True},
                    {'name': 'glucose', 'label': 'Glucose Level (mg/dL)', 'type': 'number', 'min': 0, 'max': 300, 'required': True},
                    {'name': 'blood_pressure', 'label': 'Blood Pressure (mmHg)', 'type': 'number', 'min': 0, 'max': 200, 'required': True},
                    {'name': 'bmi', 'label': 'BMI (kg/m²)', 'type': 'number', 'step': 0.1, 'min': 10, 'max': 70, 'required': True},
                    {'name': 'diabetes_pedigree_function', 'label': 'Diabetes Pedigree Function', 'type': 'number', 'step': 0.001, 'min': 0, 'max': 3, 'required': True},
                    {'name': 'age', 'label': 'Age', 'type': 'number', 'min': 1, 'max': 120, 'required': True}
                ]
            },
            'kidney_disease': {
                'features': ['blood_pressure', 'blood_glucose_random', 'blood_urea', 'serum_creatinine', 'hemoglobin'],
                'n_features': 5,
                'form_fields': [
                    {'name': 'blood_pressure', 'label': 'Blood Pressure (mmHg)', 'type': 'number', 'min': 50, 'max': 250, 'required': True},
                    {'name': 'blood_glucose_random', 'label': 'Blood Glucose Random (mg/dL)', 'type': 'number', 'min': 50, 'max': 500, 'required': True},
                    {'name': 'blood_urea', 'label': 'Blood Urea (mg/dL)', 'type': 'number', 'min': 0, 'max': 300, 'required': True},
                    {'name': 'serum_creatinine', 'label': 'Serum Creatinine (mg/dL)', 'type': 'number', 'step': 0.1, 'min': 0, 'max': 20, 'required': True},
                    {'name': 'hemoglobin', 'label': 'Hemoglobin (g/dL)', 'type': 'number', 'step': 0.1, 'min': 0, 'max': 20, 'required': True}
                ]
            },
            'liver_disease': {
                'features': ['age', 'total_bilirubin', 'direct_bilirubin', 'alkaline_phosphotase', 'total_proteins'],
                'n_features': 5,
                'form_fields': [
                    {'name': 'age', 'label': 'Age', 'type': 'number', 'min': 1, 'max': 120, 'required': True},
                    {'name': 'total_bilirubin', 'label': 'Total Bilirubin (mg/dL)', 'type': 'number', 'step': 0.1, 'min': 0, 'max': 50, 'required': True},
                    {'name': 'direct_bilirubin', 'label': 'Direct Bilirubin (mg/dL)', 'type': 'number', 'step': 0.1, 'min': 0, 'max': 25, 'required': True},
                    {'name': 'alkaline_phosphotase', 'label': 'Alkaline Phosphotase (IU/L)', 'type': 'number', 'min': 0, 'max': 2000, 'required': True},
                    {'name': 'total_proteins', 'label': 'Total Proteins (g/dL)', 'type': 'number', 'step': 0.1, 'min': 0, 'max': 15, 'required': True}
                ]
            },
            'breast_cancer': {
                'features': ['radius_mean', 'texture_mean', 'perimeter_mean', 'area_mean', 'smoothness_mean'],
                'n_features': 5,
                'form_fields': [
                    {'name': 'radius_mean', 'label': 'Radius Mean', 'type': 'number', 'step': 0.01, 'min': 0, 'max': 50, 'required': True},
                    {'name': 'texture_mean', 'label': 'Texture Mean', 'type': 'number', 'step': 0.01, 'min': 0, 'max': 50, 'required': True},
                    {'name': 'perimeter_mean', 'label': 'Perimeter Mean', 'type': 'number', 'step': 0.01, 'min': 0, 'max': 300, 'required': True},
                    {'name': 'area_mean', 'label': 'Area Mean', 'type': 'number', 'step': 0.01, 'min': 0, 'max': 3000, 'required': True},
                    {'name': 'smoothness_mean', 'label': 'Smoothness Mean', 'type': 'number', 'step': 0.001, 'min': 0, 'max': 1, 'required': True}
                ]
            },
            'parkinsons_disease': {
                'features': ['MDVP_Fo', 'MDVP_Fhi', 'MDVP_Flo', 'jitter', 'shimmer', 'HNR'],
                'n_features': 6,
                'form_fields': [
                    {'name': 'MDVP_Fo', 'label': 'MDVP Fo (Hz)', 'type': 'number', 'step': 0.01, 'min': 0, 'max': 500, 'required': True},
                    {'name': 'MDVP_Fhi', 'label': 'MDVP Fhi (Hz)', 'type': 'number', 'step': 0.01, 'min': 0, 'max': 500, 'required': True},
                    {'name': 'MDVP_Flo', 'label': 'MDVP Flo (Hz)', 'type': 'number', 'step': 0.01, 'min': 0, 'max': 500, 'required': True},
                    {'name': 'jitter', 'label': 'Jitter (%)', 'type': 'number', 'step': 0.0001, 'min': 0, 'max': 1, 'required': True},
                    {'name': 'shimmer', 'label': 'Shimmer', 'type': 'number', 'step': 0.001, 'min': 0, 'max': 1, 'required': True},
                    {'name': 'HNR', 'label': 'HNR (dB)', 'type': 'number', 'step': 0.01, 'min': 0, 'max': 50, 'required': True}
                ]
            },
            'stroke_risk': {
                'features': ['age', 'hypertension', 'heart_disease', 'bmi', 'smoking_status'],
                'n_features': 5,
                'form_fields': [
                    {'name': 'age', 'label': 'Age', 'type': 'number', 'min': 1, 'max': 120, 'required': True},
                    {'name': 'hypertension', 'label': 'Hypertension', 'type': 'select', 'options': [{'value': 0, 'label': 'No'}, {'value': 1, 'label': 'Yes'}], 'required': True},
                    {'name': 'heart_disease', 'label': 'Heart Disease', 'type': 'select', 'options': [{'value': 0, 'label': 'No'}, {'value': 1, 'label': 'Yes'}], 'required': True},
                    {'name': 'bmi', 'label': 'BMI (kg/m²)', 'type': 'number', 'step': 0.1, 'min': 10, 'max': 70, 'required': True},
                    {'name': 'smoking_status', 'label': 'Smoking Status', 'type': 'select', 'options': [{'value': 0, 'label': 'Never Smoked'}, {'value': 1, 'label': 'Formerly Smoked'}, {'value': 2, 'label': 'Currently Smokes'}], 'required': True}
                ]
            },
            'hypertension': {
                'features': ['age', 'bmi', 'physical_activity', 'salt_intake', 'blood_pressure'],
                'n_features': 5,
                'form_fields': [
                    {'name': 'age', 'label': 'Age', 'type': 'number', 'min': 1, 'max': 120, 'required': True},
                    {'name': 'bmi', 'label': 'BMI (kg/m²)', 'type': 'number', 'step': 0.1, 'min': 10, 'max': 70, 'required': True},
                    {'name': 'physical_activity', 'label': 'Physical Activity (hours/week)', 'type': 'number', 'step': 0.5, 'min': 0, 'max': 50, 'required': True},
                    {'name': 'salt_intake', 'label': 'Salt Intake (g/day)', 'type': 'number', 'step': 0.1, 'min': 0, 'max': 50, 'required': True},
                    {'name': 'blood_pressure', 'label': 'Blood Pressure (mmHg)', 'type': 'number', 'min': 50, 'max': 250, 'required': True}
                ]
            }
        }
    
    def load_model(self, disease_name: str):
        """Load a trained model"""
        model_key = disease_name.lower().replace(' ', '_')
        if model_key not in self.models:
            model_path = MODELS_DIR / f"{model_key}_model.pkl"
            if not model_path.exists():
                raise FileNotFoundError(f"Model not found: {model_path}")
            self.models[model_key] = joblib.load(model_path)
        return self.models[model_key]
    
    def predict(self, disease_name: str, features: Dict) -> Dict:
        """Make a prediction for a given disease"""
        model_key = disease_name.lower().replace(' ', '_')
        
        # Load model
        model = self.load_model(disease_name)
        
        # Get feature configuration
        feature_config = self.feature_configs.get(model_key)
        if not feature_config:
            raise ValueError(f"Unknown disease: {disease_name}")
        
        # Prepare feature array
        feature_array = self._prepare_features(features, feature_config)
        
        # Make prediction
        prediction = model.predict(feature_array)[0]
        probability = model.predict_proba(feature_array)[0]
        
        # Get risk probability (probability of positive class)
        risk_probability = float(probability[1]) if len(probability) > 1 else float(probability[0])
        
        return {
            'prediction': int(prediction),
            'risk_level': 'High Risk' if prediction == 1 else 'Low Risk',
            'risk_probability': risk_probability,
            'risk_percentage': round(risk_probability * 100, 2)
        }
    
    def _prepare_features(self, features: Dict, feature_config: Dict) -> np.ndarray:
        """Prepare features for prediction by normalizing values"""
        n_features = feature_config['n_features']
        feature_array = np.zeros(n_features)
        
        # Map provided features to array (normalize to 0-1 range)
        feature_list = list(features.values())
        for i, value in enumerate(feature_list[:n_features]):
            # Normalize numeric values to 0-1 range
            if isinstance(value, (int, float)):
                # Simple normalization assuming reasonable ranges
                if value > 1:
                    feature_array[i] = min(value / 200, 1.0)  # Normalize large values
                else:
                    feature_array[i] = value
            else:
                feature_array[i] = 0.5  # Default for non-numeric
        
        return feature_array.reshape(1, -1)

# Global predictor instance
predictor = DiseasePredictor()
