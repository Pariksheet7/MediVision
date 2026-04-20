import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Activity, ClipboardList } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formatLabel = (text) =>
  text.replaceAll("_", " ").replace(/\b\w/g, l => l.toUpperCase());

const PredictPage = () => {
  const { api, token } = useAuth();
  const navigate = useNavigate();

  const [diseases, setDiseases] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState('');
  const [patientName, setPatientName] = useState('');
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  // 🔥 LOAD DISEASES
  useEffect(() => {
    if (token) {
      api.get('/api/diseases')
        .then(res => setDiseases(res.data.diseases || []))
        .catch(() => toast.error("Could not load disease list"));
    }
  }, [api, token]);

  // 🔥 LOAD FIELDS
  useEffect(() => {
    if (selectedDisease && token) {
      setLoading(true);

      api.get(`/api/disease-fields/${selectedDisease}`)
        .then(res => {
          const fetchedFields = res.data.fields || [];
          setFields(fetchedFields);

          const initial = {};
          fetchedFields.forEach(f => {
            initial[f.name] = "";
          });
          setFormData(initial);
        })
        .catch(() => toast.error("Error loading clinical parameters"))
        .finally(() => setLoading(false));
    }
  }, [selectedDisease, api, token]);

  // 🔥 CHECK ALL FILLED
  const allFilled = fields.length > 0 && fields.every(f => {
    const val = formData[f.name];
    return val !== "" && val !== null && val !== undefined;
  });

  // 🔥 FIXED SUBMIT (NO MORE SEX ERROR 🚀)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDisease || !patientName) {
      return toast.error("Please fill in patient details");
    }

    if (!allFilled) {
      window.scrollTo({ top: 200, behavior: "smooth" });
      return toast.error("Please fill all required fields");
    }

    setLoading(true);

    try {
      const processedFeatures = {};

      fields.forEach(field => {
        let val = formData[field.name];

        if (val === "" || val === null || val === undefined) {
          throw new Error(`Please fill ${field.name}`);
        }

        // 🔥 IMPORTANT FIX
        if (field.type === "select") {
          processedFeatures[field.name] = val; // keep string
        } else {
          const num = Number(val);
          if (isNaN(num)) {
            throw new Error(`Invalid value for ${field.name}`);
          }
          processedFeatures[field.name] = num;
        }
      });

      const payload = {
        disease_name: selectedDisease,
        patient_name: patientName.trim(),
        features: processedFeatures
      };

      console.log("🚀 PAYLOAD:", payload);

      const res = await api.post('/api/predict', payload);

      console.log("✅ RESPONSE:", res.data);

      toast.success("Diagnosis Complete!");
      navigate('/result', { state: { prediction: res.data } });

    } catch (err) {
      console.error("Prediction Error:", err);

      const errorMsg =
        err.message ||
        err.response?.data?.detail ||
        "Prediction failed";

      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-4 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">New Assessment</h1>
            <p className="text-slate-500 text-sm">Input patient data for AI-driven risk analysis.</p>
          </div>
          <div className="bg-blue-50 p-2 rounded-lg">
            <Activity className="text-blue-600 h-6 w-6" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border space-y-8">

          {/* TOP */}
          <div className="grid md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-xl border">

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-500">
                Target Medical Model
              </Label>

              <Select onValueChange={setSelectedDisease} value={selectedDisease}>
                <SelectTrigger className="h-12 bg-white">
                  <SelectValue placeholder="Choose Disease..." />
                </SelectTrigger>

                <SelectContent>
                  {diseases.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-500">
                Patient Full Name
              </Label>

              <Input
                className="h-12"
                placeholder="e.g. John Doe"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              />
            </div>

          </div>

          {/* LOADING UI */}
          {loading && (
            <div className="space-y-4">
              <p className="text-sm font-bold text-blue-600 animate-pulse">
                🧠 Analyzing patient data...
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-xl bg-white space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FIELDS */}
          {!loading && selectedDisease && fields.length > 0 ? (
            <div className="pt-4">

              <div className="flex items-center gap-2 mb-6 text-blue-600 font-bold text-xs uppercase">
                <ClipboardList className="h-4 w-4" />
                Required Clinical Features
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                {fields.map((f, i) => (
                  <div key={i}>
                    <Label className="text-xs font-semibold text-slate-500">
                      {formatLabel(f.name)} <span className="text-red-500">*</span>
                    </Label>

                    {f.type === "select" ? (
                      <Select
                        onValueChange={(val) =>
                          setFormData(prev => ({
                            ...prev,
                            [f.name]: val
                          }))
                        }
                        value={formData[f.name] || ""}
                      >
                        <SelectTrigger className={`h-12 bg-white ${
                          !formData[f.name] ? "border-red-400" : ""
                        }`}>
                          <SelectValue placeholder={`Select ${formatLabel(f.name)}`} />
                        </SelectTrigger>

                        <SelectContent>
                          {f.options?.map((opt, index) => (
                            <SelectItem key={index} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type="number"
                        step="any"
                        placeholder={`Enter ${formatLabel(f.name)}`}
                        value={formData[f.name] || ''}
                        className={`h-12 ${
                          !formData[f.name] ? "border-red-400" : ""
                        }`}
                        onChange={(e) =>
                          setFormData(prev => ({
                            ...prev,
                            [f.name]: e.target.value
                          }))
                        }
                      />
                    )}
                  </div>
                ))}

              </div>

            </div>
          ) : !loading && (
            <div className="h-40 flex items-center justify-center border-dashed border rounded-xl">
              <p className="text-slate-400">Select disease to load parameters</p>
            </div>
          )}

          {/* BUTTON */}
          <Button
            type="submit"
            className="w-full h-14 bg-blue-600 text-white text-lg font-bold"
            disabled={loading || !selectedDisease || !allFilled}
          >
            {loading ? "Analyzing Patient Data..." : "Analyze Risk"}
          </Button>

        </form>
      </div>
    </DashboardLayout>
  );
};

export default PredictPage;