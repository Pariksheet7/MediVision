import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Stethoscope, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PredictPage = () => {
  const navigate = useNavigate();
  const { getAuthHeader } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState('');
  const [patientName, setPatientName] = useState('');
  const [diseaseFields, setDiseaseFields] = useState([]);
  const [formData, setFormData] = useState({});

  const diseases = [
    'Heart Disease',
    'Diabetes',
    'Kidney Disease',
    'Liver Disease',
    'Breast Cancer',
    'Parkinsons Disease',
    'Stroke Risk',
    'Hypertension',
  ];

  useEffect(() => {
    if (selectedDisease) {
      fetchDiseaseFields(selectedDisease);
    }
  }, [selectedDisease]);

  const fetchDiseaseFields = async (disease) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/disease-features/${disease}`,
        { headers: getAuthHeader() }
      );
      setDiseaseFields(response.data.form_fields);
      // Initialize form data
      const initialData = {};
      response.data.form_fields.forEach((field) => {
        initialData[field.name] = '';
      });
      setFormData(initialData);
    } catch (error) {
      toast.error('Failed to load disease fields');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDisease) {
      toast.error('Please select a disease to predict');
      return;
    }

    if (!patientName) {
      toast.error('Please enter patient name');
      return;
    }

    setLoading(true);

    try {
      // Convert form data to numbers where needed
      const features = {};
      Object.keys(formData).forEach((key) => {
        const value = formData[key];
        features[key] = parseFloat(value) || 0;
      });

      const response = await axios.post(
        `${API_URL}/api/predict`,
        {
          disease_name: selectedDisease,
          patient_name: patientName,
          features: features,
        },
        { headers: getAuthHeader() }
      );

      toast.success('Prediction completed successfully!');
      navigate('/result', { state: { prediction: response.data } });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldName, value) => {
    setFormData({
      ...formData,
      [fieldName]: value,
    });
  };

  const renderFormField = (field, index) => {
    if (field.type === 'select') {
      return (
        <div key={index} className="space-y-2">
          <Label htmlFor={field.name} className="text-sm font-medium">
            {field.label}
          </Label>
          <Select
            value={formData[field.name]?.toString() || ''}
            onValueChange={(value) => handleFieldChange(field.name, value)}
          >
            <SelectTrigger
              className="h-12 bg-white border-slate-200"
              data-testid={`field-${field.name}`}
            >
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option, idx) => (
                <SelectItem key={idx} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    return (
      <div key={index} className="space-y-2">
        <Label htmlFor={field.name} className="text-sm font-medium">
          {field.label}
        </Label>
        <Input
          id={field.name}
          type={field.type}
          step={field.step}
          min={field.min}
          max={field.max}
          placeholder={`Enter ${field.label}`}
          value={formData[field.name] || ''}
          onChange={(e) => handleFieldChange(field.name, e.target.value)}
          className="h-12 bg-white border-slate-200"
          data-testid={`field-${field.name}`}
          required={field.required}
        />
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto" data-testid="predict-page">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-accent mb-2">
            Disease Prediction
          </h1>
          <p className="text-lg text-muted-foreground">
            Enter patient information to get AI-powered health risk assessment
          </p>
        </div>

        {/* Prediction Form */}
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Disease Selection */}
            <div className="space-y-2">
              <Label htmlFor="disease" className="text-sm font-semibold uppercase tracking-wider">
                Select Disease
              </Label>
              <Select value={selectedDisease} onValueChange={setSelectedDisease}>
                <SelectTrigger
                  className="h-12 bg-white border-slate-200 focus:border-primary"
                  data-testid="disease-select"
                >
                  <SelectValue placeholder="Choose a disease to predict" />
                </SelectTrigger>
                <SelectContent>
                  {diseases.map((disease, index) => (
                    <SelectItem key={index} value={disease} data-testid={`disease-option-${index}`}>
                      {disease}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Patient Name */}
            {selectedDisease && (
              <>
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-semibold text-accent mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-primary" />
                    Patient Information
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="patient_name" className="text-sm font-medium">
                      Patient Name
                    </Label>
                    <Input
                      id="patient_name"
                      type="text"
                      placeholder="John Doe"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="h-12 bg-white border-slate-200"
                      data-testid="patient-name-input"
                      required
                    />
                  </div>
                </div>

                {/* Disease-Specific Fields */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-semibold text-accent mb-4 flex items-center">
                    <Stethoscope className="h-5 w-5 mr-2 text-primary" />
                    Medical Parameters for {selectedDisease}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {diseaseFields.map((field, index) => renderFormField(field, index))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="border-t border-slate-200 pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full md:w-auto h-14 px-12 text-base font-medium"
                    disabled={loading}
                    data-testid="predict-submit-btn"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Stethoscope className="h-5 w-5 mr-2" />
                        Get Prediction
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}

            {/* Help Text */}
            {!selectedDisease && (
              <div className="text-center py-12 text-muted-foreground">
                Select a disease from the dropdown above to see the specific medical parameters
                required for prediction.
              </div>
            )}
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PredictPage;
