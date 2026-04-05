import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Loader2, Activity, ClipboardList } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PredictPage = () => {
  const { api, token } = useAuth(); 
  const navigate = useNavigate();
  const [diseases, setDiseases] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState('');
  const [patientName, setPatientName] = useState('');
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      api.get('/api/diseases')
        .then(res => setDiseases(res.data.diseases || []))
        .catch(() => toast.error("Could not load disease list"));
    }
  }, [api, token]);

  useEffect(() => {
    if (selectedDisease && token) {
      setLoading(true);
      api.get(`/api/disease-fields/${selectedDisease}`)
        .then(res => {
          const fetchedFields = res.data.fields || [];
          setFields(fetchedFields);
          const initial = {};
          fetchedFields.forEach(f => { initial[f.name] = ""; });
          setFormData(initial);
        })
        .catch(() => toast.error("Error loading clinical parameters"))
        .finally(() => setLoading(false));
    }
  }, [selectedDisease, api, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDisease || !patientName) return toast.error("Please fill in patient details");
    setLoading(true);

    try {
      const processedFeatures = {};
      fields.forEach(field => {
        const val = formData[field.name];
        processedFeatures[field.name] = field.type === 'number' 
          ? (val === "" ? 0 : parseFloat(val)) : val;
      });

      const payload = {
        disease_name: selectedDisease,
        patient_name: patientName,
        features: processedFeatures
      };

      // FIXED: Use the 'api' instance
      const res = await api.post('/api/predict', payload);
      
      toast.success("Diagnosis Complete!");
      navigate('/result', { state: { prediction: res.data } });
      
    } catch (err) {
      console.error("Prediction Error:", err);
      const errorMsg = err.response?.data?.detail || "Server error. Check Python logs.";
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
          <div className="bg-blue-50 p-2 rounded-lg"><Activity className="text-blue-600 h-6 w-6" /></div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-8">
          <div className="grid md:grid-cols-2 gap-6 p-6 bg-slate-50/50 rounded-xl border border-slate-100">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Target Medical Model</Label>
              <Select onValueChange={setSelectedDisease} value={selectedDisease}>
                <SelectTrigger className="h-12 bg-white border-slate-200">
                  <SelectValue placeholder="Choose Disease Category..." />
                </SelectTrigger>
                <SelectContent>
                  {diseases?.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Patient Full Name</Label>
              <Input className="h-12 bg-white border-slate-200" placeholder="e.g. John Doe" value={patientName} onChange={e => setPatientName(e.target.value)} required />
            </div>
          </div>

          {selectedDisease && fields.length > 0 ? (
            <div className="pt-4 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-6 text-blue-600 font-bold uppercase text-[10px] tracking-[0.2em]">
                <ClipboardList className="h-4 w-4" /> Required Clinical Features
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                {fields.map((f, i) => (
                  <div key={i} className="space-y-2 group">
                    <Label className="text-[11px] font-bold text-slate-500 group-hover:text-blue-600 transition-colors uppercase">{f.label}</Label>
                    <Input type="number" step="any" className="h-10 bg-white border-slate-200 group-hover:border-blue-200" placeholder="0.00" value={formData[f.name] || ''} onChange={e => setFormData(prev => ({...prev, [f.name]: e.target.value}))} required />
                  </div>
                ))}
              </div>
            </div>
          ) : !loading && (
            <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-xl">
              <p className="text-slate-400 text-sm italic">Select a medical model to load parameters.</p>
            </div>
          )}

          <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg font-black rounded-xl transition-all" disabled={loading || !selectedDisease}>
            {loading ? <div className="flex items-center gap-2"><Loader2 className="animate-spin" /> Analyzing...</div> : "Execute AI Diagnosis"}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default PredictPage;