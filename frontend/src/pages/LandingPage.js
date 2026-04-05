import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Brain, Heart, Shield, TrendingUp, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced machine learning models trained on vast medical datasets for high-precision risk assessment.',
    },
    {
      icon: Heart,
      title: 'Multi-Disease Detection',
      description: 'Access 8 specialized prediction models including Heart Disease, Diabetes, and Stroke risk.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Enterprise-grade encryption ensures your health data remains confidential and under your control.',
    },
    {
      icon: TrendingUp,
      title: 'Track Your Health',
      description: 'Monitor health trends over time with our comprehensive patient history and analytics suite.',
    },
  ];

  const diseaseList = [
    'Heart Disease', 'Diabetes', 'Kidney Disease', 'Liver Disease',
    'Breast Cancer', 'Parkinsons', 'Stroke Risk', 'Hypertension',
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/70 backdrop-blur-xl border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-2 group cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <div className="bg-blue-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">MediVision</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="font-semibold text-slate-600 hover:text-blue-600"
              >
                Log In
              </Button>
              <Button
                onClick={() => navigate('/register')}
                className="bg-blue-600 hover:bg-blue-700 font-semibold px-6 shadow-md shadow-blue-200"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 lg:pt-52 lg:pb-40 px-6 lg:px-12 overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-40">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-[128px] animate-pulse"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-[128px] animate-pulse delay-700"></div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-700">
                  v2.0 AI Models Active
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-slate-900">
                Precision Health <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-500">
                  Through Data
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
                MediVision uses clinical-grade AI to analyze medical markers, providing 
                instant insights into potential health risks. Empowering patients and 
                doctors with data-driven clarity.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="h-16 px-10 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
                >
                  Start Assessment
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="h-16 px-10 text-lg font-bold border-2 border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
                >
                  Sign In
                </Button>
              </div>

              <div className="flex items-center gap-10 pt-4 divide-x divide-slate-100">
                <div>
                  <div className="text-3xl font-bold text-slate-900">8+</div>
                  <div className="text-sm font-medium text-slate-500">Disease Models</div>
                </div>
                <div className="pl-10">
                  <div className="text-3xl font-bold text-slate-900">92%</div>
                  <div className="text-sm font-medium text-slate-500">Accuracy Rate</div>
                </div>
              </div>
            </div>

            <div className="relative lg:ml-auto">
              <div className="relative rounded-3xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 group">
                <img
                  src="https://images.unsplash.com/photo-1576091160550-2173bdb999ef?auto=format&fit=crop&q=80&w=1000"
                  alt="AI Medical Tech"
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-10 -left-10 bg-white rounded-2xl shadow-2xl p-6 border border-slate-100 animate-bounce-slow">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 p-3 rounded-xl">
                    <Shield className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-900">HIPAA Ready</div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Encrypted Data</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 lg:py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mb-20">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Intelligence built around your safety.
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              We've combined modern UI with complex backend algorithms to ensure that 
              getting a health checkup is as easy as filling out a 1-minute form.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disease Grid */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-16">
              Specialized Prediction Engines
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {diseaseList.map((disease, i) => (
                    <div key={i} className="py-6 px-4 rounded-2xl border-2 border-slate-50 hover:border-blue-100 hover:bg-blue-50/30 transition-all cursor-default group">
                        <span className="text-slate-600 font-semibold group-hover:text-blue-700 transition-colors">
                            {disease}
                        </span>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 justify-center md:justify-start">
              <Activity className="h-7 w-7 text-blue-400" />
              <span className="text-2xl font-bold">MediVision</span>
            </div>
            <p className="text-slate-400 max-w-xs text-center md:text-left">
              Making healthcare accessible and predictable through advanced AI modeling.
            </p>
          </div>
          
          <div className="text-center md:text-right space-y-2">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">© 2026 MediVision Systems</p>
            <div className="flex gap-6 justify-center md:justify-end text-sm text-slate-300">
                <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;