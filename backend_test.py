import requests
import sys
import json
from datetime import datetime

class MediVisionAPITester:
    def __init__(self, base_url="https://medai-analytics-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None
        
    def log_result(self, test_name, passed, details=""):
        """Log test result"""
        self.tests_run += 1
        if passed:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            print(f"❌ {test_name} - FAILED: {details}")

    def test_api_endpoint(self, method, endpoint, expected_status, data=None, headers=None, test_name=None):
        """Generic API testing method"""
        url = f"{self.base_url}{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            default_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            default_headers.update(headers)
            
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers)
            
            success = response.status_code == expected_status
            response_data = {}
            
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text[:200]}
            
            if success:
                self.log_result(test_name or f"{method} {endpoint}", True)
                return True, response_data
            else:
                self.log_result(
                    test_name or f"{method} {endpoint}", 
                    False, 
                    f"Expected {expected_status}, got {response.status_code}. Response: {response_data}"
                )
                return False, response_data
                
        except Exception as e:
            self.log_result(test_name or f"{method} {endpoint}", False, str(e))
            return False, {}

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            "email": f"testuser{timestamp}@medivision.com",
            "password": "TestPassword123!",
            "full_name": f"Test User {timestamp}"
        }
        
        success, response = self.test_api_endpoint(
            'POST', '/api/auth/register', 200, user_data, 
            test_name="User Registration"
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response.get('user', {}).get('id')
            print(f"   Token obtained: {self.token[:20]}...")
            return True, user_data
        
        return False, {}

    def test_user_login(self, credentials):
        """Test user login"""
        login_data = {
            "email": credentials.get("email"),
            "password": credentials.get("password")
        }
        
        success, response = self.test_api_endpoint(
            'POST', '/api/auth/login', 200, login_data,
            test_name="User Login"
        )
        
        if success and 'access_token' in response:
            # Verify token is updated
            self.token = response['access_token']
            print(f"   Login token: {self.token[:20]}...")
            return True
        
        return False

    def test_get_diseases(self):
        """Test diseases list endpoint"""
        success, response = self.test_api_endpoint(
            'GET', '/api/diseases', 200,
            test_name="Get Available Diseases"
        )
        
        if success and 'diseases' in response:
            diseases = response['diseases']
            expected_count = 8
            if len(diseases) == expected_count:
                print(f"   Found {len(diseases)} diseases as expected")
                return True, diseases
            else:
                print(f"   Expected {expected_count} diseases, found {len(diseases)}")
        
        return False, []

    def test_disease_prediction(self, disease_name):
        """Test disease prediction for a specific disease"""
        # Sample patient data for prediction
        prediction_data = {
            "disease_name": disease_name,
            "patient_name": "John Test Patient",
            "features": {
                "age": 45,
                "gender": 1,
                "blood_pressure": 120,
                "cholesterol": 200,
                "glucose": 100,
                "bmi": 24.5,
                "feature_6": 0.5,
                "feature_7": 0.3
            }
        }
        
        success, response = self.test_api_endpoint(
            'POST', '/api/predict', 200, prediction_data,
            test_name=f"Predict {disease_name}"
        )
        
        if success:
            required_fields = ['id', 'disease_name', 'risk_level', 'risk_percentage', 'prediction']
            for field in required_fields:
                if field not in response:
                    print(f"   Missing field: {field}")
                    return False, {}
            
            print(f"   Risk Level: {response['risk_level']}, Risk %: {response['risk_percentage']}%")
            return True, response
        
        return False, {}

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        success, response = self.test_api_endpoint(
            'GET', '/api/stats', 200,
            test_name="Dashboard Statistics"
        )
        
        if success:
            required_fields = ['total_predictions', 'high_risk_count', 'low_risk_count', 'recent_predictions']
            for field in required_fields:
                if field not in response:
                    print(f"   Missing field: {field}")
                    return False
            
            print(f"   Stats - Total: {response['total_predictions']}, High Risk: {response['high_risk_count']}, Low Risk: {response['low_risk_count']}")
            return True
        
        return False

    def test_prediction_history(self):
        """Test prediction history"""
        success, response = self.test_api_endpoint(
            'GET', '/api/history', 200,
            test_name="Prediction History"
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} prediction records")
            if len(response) > 0:
                # Check first record structure
                record = response[0]
                required_fields = ['id', 'disease_name', 'patient_name', 'risk_level', 'risk_percentage']
                for field in required_fields:
                    if field not in record:
                        print(f"   Missing field in history record: {field}")
                        return False
            return True
        
        return False

    def run_comprehensive_test(self):
        """Run all tests"""
        print("=" * 60)
        print("🏥 MEDIVISION AI HEALTHCARE PLATFORM - API TESTING")
        print("=" * 60)
        
        # Test 1: User Registration
        print("\n📋 Testing User Authentication...")
        registration_success, user_creds = self.test_user_registration()
        if not registration_success:
            print("❌ Registration failed - cannot continue with authenticated tests")
            return False
        
        # Test 2: User Login  
        login_success = self.test_user_login(user_creds)
        if not login_success:
            print("❌ Login failed")
            
        # Test 3: Get Diseases List
        print("\n🔬 Testing Disease Models...")
        diseases_success, diseases = self.test_get_diseases()
        
        # Test 4: Test predictions for all 8 diseases
        if diseases_success and diseases:
            print(f"\n🤖 Testing AI Predictions for {len(diseases)} diseases...")
            prediction_results = []
            for disease in diseases:
                pred_success, pred_result = self.test_disease_prediction(disease)
                if pred_success:
                    prediction_results.append(pred_result)
        
        # Test 5: Dashboard Statistics
        print("\n📊 Testing Dashboard Features...")
        self.test_dashboard_stats()
        
        # Test 6: Prediction History
        self.test_prediction_history()
        
        # Final Results
        print("\n" + "=" * 60)
        print(f"📊 FINAL TEST RESULTS")
        print("=" * 60)
        print(f"✅ Tests Passed: {self.tests_passed}")
        print(f"❌ Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"📈 Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        success_rate = (self.tests_passed / self.tests_run) * 100
        return success_rate >= 80  # 80% success rate threshold

def main():
    """Main test execution"""
    tester = MediVisionAPITester()
    success = tester.run_comprehensive_test()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())