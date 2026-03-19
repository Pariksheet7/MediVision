import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Brain, Heart, Shield, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced machine learning models trained on medical data for accurate predictions',
    },
    {
      icon: Heart,
      title: 'Multi-Disease Detection',
      description: '8 disease prediction models including heart disease, diabetes, and more',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your health data is encrypted and stored securely with enterprise-grade security',
    },
    {
      icon: TrendingUp,
      title: 'Track Your Health',
      description: 'Monitor your health trends over time with comprehensive history tracking',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold font-heading text-accent">MediVision</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                data-testid="nav-login-btn"
                className="font-medium"
              >
                Log In
              </Button>
              <Button
                onClick={() => navigate('/register')}
                data-testid="nav-register-btn"
                className="font-medium"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 md:pt-40 md:pb-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-sky-50 px-4 py-2 rounded-full">
                  AI-Powered Healthcare
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] text-accent">
                Precision Health
                <br />
                <span className="text-primary">Predictions</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                Leverage cutting-edge AI technology to assess your health risks across multiple diseases. 
                Get instant, data-driven insights to take control of your health journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/register')}
                  data-testid="hero-get-started-btn"
                  className="text-lg h-14 px-8 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Get Started Free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/login')}
                  data-testid="hero-login-btn"
                  className="text-lg h-14 px-8 border-2"
                >
                  Sign In
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-4xl font-bold font-heading text-accent">8+</div>
                  <div className="text-sm text-muted-foreground">Disease Models</div>
                </div>
                <div>
                  <div className="text-4xl font-bold font-heading text-accent">85%</div>
                  <div className="text-sm text-muted-foreground">Avg Accuracy</div>
                </div>
                <div>
                  <div className="text-4xl font-bold font-heading text-accent">1000+</div>
                  <div className="text-sm text-muted-foreground">Predictions Made</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1758691461957-13aff0c37c6f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwyfHxkb2N0b3IlMjB0YWJsZXQlMjBob3NwaXRhbCUyMHRlY2hub2xvZ3l8ZW58MHx8fHwxNzczODk5ODY1fDA&ixlib=rb-4.1.0&q=85"
                  alt="Doctor analyzing patient data"
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6 border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Shield className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold font-heading text-accent">100%</div>
                    <div className="text-sm text-muted-foreground">Secure & Private</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 bg-slate-50 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-accent mb-4">
              Comprehensive Health Analytics
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to monitor and understand your health risks
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white border border-slate-100 rounded-xl p-8 shadow-sm hover:shadow-md hover:border-sky-100 transition-all duration-300"
                  data-testid={`feature-card-${index}`}
                >
                  <div className="bg-sky-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-accent mb-2">{feature.title}</h3>
                  <p className="text-base text-foreground/80 leading-7">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Supported Diseases Section */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-accent mb-4">
              8 Disease Prediction Models
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Trained on medical datasets with high accuracy rates
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'Heart Disease',
              'Diabetes',
              'Kidney Disease',
              'Liver Disease',
              'Breast Cancer',
              'Parkinsons Disease',
              'Stroke Risk',
              'Hypertension',
            ].map((disease, index) => (
              <div
                key={index}
                className="bg-slate-50 border border-transparent hover:bg-white hover:border-sky-100 rounded-xl p-6 text-center transition-all duration-300"
                data-testid={`disease-${index}`}
              >
                <div className="text-lg font-semibold text-accent">{disease}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 bg-gradient-to-br from-blue-50/50 to-white/0 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-accent mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Join thousands of users who trust MediVision for their health insights
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/register')}
            data-testid="cta-get-started-btn"
            className="text-lg h-14 px-12 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-accent text-white py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Activity className="h-6 w-6" />
            <span className="text-xl font-bold font-heading">MediVision</span>
          </div>
          <p className="text-slate-300 mb-4">AI-Powered Precision. Human Care.</p>
          <p className="text-sm text-slate-400">
            © 2024 MediVision. Healthcare Analytics Platform.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
