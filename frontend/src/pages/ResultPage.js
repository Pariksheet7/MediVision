import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Activity, ArrowLeft, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import DashboardLayout from '../components/DashboardLayout';

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prediction = location.state?.prediction;

  if (!prediction) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">No prediction data available</p>
          <Button onClick={() => navigate('/predict')} data-testid="no-data-predict-btn">
            Make a Prediction
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const isHighRisk = prediction.risk_level === 'High Risk';
  const riskColor = isHighRisk ? 'text-destructive' : 'text-success';
  const riskBg = isHighRisk ? 'bg-red-50' : 'bg-green-50';
  const progressColor = isHighRisk ? 'bg-destructive' : 'bg-success';

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto" data-testid="result-page">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/predict')}
            className="mb-4"
            data-testid="back-to-predict-btn"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Prediction
          </Button>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-accent mb-2">
            Prediction Results
          </h1>
          <p className="text-lg text-muted-foreground">
            AI-powered health risk assessment completed
          </p>
        </div>

        {/* Risk Level Card */}
        <div className={`${riskBg} border-2 ${
          isHighRisk ? 'border-destructive/20' : 'border-success/20'
        } rounded-xl p-8 mb-6`}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                {isHighRisk ? (
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                ) : (
                  <CheckCircle className="h-8 w-8 text-success" />
                )}
                <h2 className={`text-3xl font-bold font-heading ${riskColor}`}>
                  {prediction.risk_level}
                </h2>
              </div>
              <p className="text-base text-foreground/80">
                {isHighRisk
                  ? 'Elevated risk detected. Please consult a healthcare professional.'
                  : 'Low risk detected. Continue maintaining healthy habits.'}
              </p>
            </div>
          </div>

          {/* Risk Percentage */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Risk Probability
              </span>
              <span className={`text-2xl font-bold font-heading ${riskColor}`}>
                {prediction.risk_percentage}%
              </span>
            </div>
            <div className="relative h-4 bg-white rounded-full overflow-hidden">
              <div
                className={`h-full ${progressColor} transition-all duration-500`}
                style={{ width: `${prediction.risk_percentage}%` }}
                data-testid="risk-progress-bar"
              />
            </div>
          </div>
        </div>

        {/* Patient Details */}
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-8 mb-6">
          <h3 className="text-xl font-semibold text-accent mb-6 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-primary" />
            Prediction Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Disease
              </div>
              <div className="text-lg font-medium text-accent">{prediction.disease_name}</div>
            </div>
            <div>
              <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Patient Name
              </div>
              <div className="text-lg font-medium text-accent">{prediction.patient_name}</div>
            </div>
            <div>
              <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Prediction ID
              </div>
              <div className="text-sm font-mono text-accent">{prediction.id}</div>
            </div>
            <div>
              <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Date
              </div>
              <div className="text-sm text-accent">
                {new Date(prediction.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-8 mb-6">
          <h3 className="text-xl font-semibold text-accent mb-4">Recommendations</h3>
          <div className="space-y-3">
            {isHighRisk ? (
              <>
                <div className="flex items-start space-x-3">
                  <div className="bg-destructive/10 p-2 rounded-lg mt-0.5">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </div>
                  <p className="text-base text-foreground/80 leading-7">
                    Consult with a healthcare professional immediately for proper diagnosis and treatment.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg mt-0.5">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-base text-foreground/80 leading-7">
                    Schedule regular check-ups and follow your doctor's advice closely.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start space-x-3">
                  <div className="bg-success/10 p-2 rounded-lg mt-0.5">
                    <CheckCircle className="h-4 w-4 text-success" />
                  </div>
                  <p className="text-base text-foreground/80 leading-7">
                    Continue maintaining a healthy lifestyle with regular exercise and balanced diet.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg mt-0.5">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-base text-foreground/80 leading-7">
                    Schedule routine health check-ups to monitor your health status.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6">
          <p className="text-sm text-muted-foreground">
            <strong className="font-semibold">Medical Disclaimer:</strong> This prediction is generated by AI 
            and should not be considered as a medical diagnosis. Always consult with qualified healthcare 
            professionals for accurate diagnosis and treatment recommendations.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate('/predict')}
            data-testid="new-prediction-btn"
            size="lg"
            className="flex-1 h-12"
          >
            <Activity className="h-5 w-5 mr-2" />
            New Prediction
          </Button>
          <Button
            onClick={() => navigate('/history')}
            data-testid="view-history-btn"
            variant="outline"
            size="lg"
            className="flex-1 h-12 border-2"
          >
            <History className="h-5 w-5 mr-2" />
            View History
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResultPage;
