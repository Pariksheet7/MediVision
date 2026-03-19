import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib
import os
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
MODELS_DIR = BASE_DIR / 'models'

# Create models directory if it doesn't exist
MODELS_DIR.mkdir(exist_ok=True)

def generate_synthetic_data(n_samples=1000, n_features=10, disease_name=''):
    """Generate synthetic medical data for training"""
    np.random.seed(42)
    
    # Generate random features
    X = np.random.rand(n_samples, n_features)
    
    # Generate labels with some correlation to features
    risk_score = X.sum(axis=1) / n_features
    y = (risk_score > 0.5).astype(int)
    
    return X, y

def train_model(disease_name, n_features=10):
    """Train a RandomForest model for a specific disease"""
    print(f"Training model for {disease_name}...")
    
    # Generate synthetic data
    X, y = generate_synthetic_data(n_samples=1000, n_features=n_features, disease_name=disease_name)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    accuracy = model.score(X_test, y_test)
    print(f"  - Accuracy: {accuracy:.2f}")
    
    # Save model
    model_path = MODELS_DIR / f"{disease_name.lower().replace(' ', '_')}_model.pkl"
    joblib.dump(model, model_path)
    print(f"  - Model saved to {model_path}")
    
    return model, accuracy

def train_all_models():
    """Train all disease prediction models"""
    diseases = [
        ('Heart Disease', 6),
        ('Diabetes', 6),
        ('Kidney Disease', 5),
        ('Liver Disease', 5),
        ('Breast Cancer', 5),
        ('Parkinsons Disease', 6),
        ('Stroke Risk', 5),
        ('Hypertension', 5)
    ]
    
    results = {}
    print("\n=== Training MediVision AI Models ===")
    print("="*50)
    
    for disease_name, n_features in diseases:
        model, accuracy = train_model(disease_name, n_features)
        results[disease_name] = accuracy
        print()
    
    print("=== Training Complete ===")
    print("\nModel Accuracies:")
    for disease, acc in results.items():
        print(f"  {disease}: {acc:.2%}")
    
    return results

if __name__ == "__main__":
    train_all_models()
