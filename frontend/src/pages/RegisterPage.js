import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Mail, Lock, User, Loader2, ChevronLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth(); // Ensure this is coming from context
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic Frontend Validation
    if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setLoading(true);

    try {
      // Calling the register function from AuthContext
      const result = await register(
        formData.email, 
        formData.password, 
        formData.full_name
      );
      
      if (result.success) {
        toast.success('Welcome to MediVision! Account created.');
        // Dashboard will now load real stats because user is in DB
        navigate('/dashboard');
      } else {
        // This catches "Email already registered" from FastAPI
        toast.error(result.error || 'Registration failed');
      }
    } catch (err) {
      toast.error('Server connection error. Is the Python backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 py-12 selection:bg-blue-100">
      <Link 
        to="/" 
        className="mb-8 flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors group"
      >
        <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-blue-600 p-2 rounded-xl mb-4 shadow-lg shadow-blue-200">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2 italic">
            MediVision
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            AI-Powered Clinical Diagnostics Platform
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 p-8 sm:p-10">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800">Create Account</h2>
            <p className="text-xs text-slate-400 mt-1">Start your 7-day clinical trial today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                Full Name
              </Label>
              <div className="relative group">
                <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  id="full_name"
                  type="text"
                  placeholder="Dr. John Doe"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                Work Email
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="hospital@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                Secure Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-base font-black bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-[0.98] mt-4 rounded-xl"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Create Doctor Account'
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
              Already a member?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 transition-colors ml-1"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">AES-256 Encryption Active</span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;