import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, AlertTriangle, ShieldCheck, Printer, FileText, ChevronRight, Sparkles } from 'lucide-react';

const ResultPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const result =
    state?.prediction ||
    JSON.parse(localStorage.getItem("lastPrediction"));

  if (state?.prediction) {
    localStorage.setItem("lastPrediction", JSON.stringify(state.prediction));
  }

  if (!result) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-32 space-y-4 text-center">
          <FileText className="h-12 w-12 text-slate-300" />
          <h2 className="text-xl font-bold">No Assessment Data</h2>
          <Button onClick={() => navigate('/predict')}>Start Diagnosis</Button>
        </div>
      </DashboardLayout>
    );
  }

  const riskVal = Number(result.risk_percentage || 0);
  const isHigh = riskVal >= 50;

  const severityColor = isHigh ? 'text-red-600' : 'text-emerald-600';
  const severityBg = isHigh ? 'bg-red-500' : 'bg-emerald-500';
  const severityLightBg = isHigh ? 'bg-red-50' : 'bg-emerald-50';

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 p-4 pb-20">

        {/* TOP ACTIONS */}
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate('/predict')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> NEW ANALYSIS
          </Button>

          <Button onClick={() => window.print()} variant="outline">
            <Printer className="mr-2 h-4 w-4" /> PRINT REPORT
          </Button>
        </div>

        <Card className="overflow-hidden shadow-2xl rounded-3xl">
          <div className={`h-3 ${severityBg}`} />

          <CardContent className="p-0">
            <div className="grid lg:grid-cols-5">

              {/* LEFT SIDE */}
              <div className={`lg:col-span-2 p-10 text-center ${severityLightBg}/30`}>
                <div className={`p-4 rounded-2xl mb-4 ${severityLightBg}`}>
                  {isHigh
                    ? <AlertTriangle className="h-12 w-12 text-red-500" />
                    : <ShieldCheck className="h-12 w-12 text-emerald-500" />
                  }
                </div>

                <h2 className="text-3xl font-black">{result.patient_name}</h2>
                <p className="text-slate-400 text-xs uppercase mt-1">
                  {result.disease_name} Assessment
                </p>

                <div className="mt-8">
                  <div className={`text-7xl font-black ${severityColor}`}>
                    {riskVal.toFixed(1)}%
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Predicted Risk ({result.risk_level})
                  </p>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="lg:col-span-3 p-10 space-y-6">

                {/* AI SUMMARY */}
                {result.clinical_summary && (
                  <div className="bg-blue-50 p-5 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      <h4 className="text-xs font-bold text-blue-700">AI Interpretation</h4>
                    </div>
                    <p className="text-sm italic">
                      "{result.clinical_summary}"
                    </p>
                  </div>
                )}

                {/* EXPLAINABLE RISK */}
                {result.top_factors && result.top_factors.length > 0 && (
                  <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-200">
                    <h4 className="text-xs font-bold text-yellow-700 mb-3 uppercase tracking-wider">
                      Key Risk Factors
                    </h4>

                    {result.top_factors.map((f, i) => (
                      <div key={i} className="flex items-center justify-between text-sm font-semibold text-slate-700 mb-2">
                        <span>• {f.reason} ({f.value})</span>
                        <span className="text-yellow-700">+{f.impact}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 🔥 PROFESSIONAL REPORT (PRINT ONLY) */}
                <div className="print:block hidden bg-white border p-8 rounded-2xl space-y-6">

                  <h1 className="text-2xl font-black text-center">
                    MediVision AI Health Report
                  </h1>

                  <div className="text-sm space-y-1">
                    <p><strong>Patient Name:</strong> {result.patient_name}</p>
                    <p><strong>Disease:</strong> {result.disease_name}</p>
                    <p><strong>Risk Level:</strong> {result.risk_level}</p>
                    <p><strong>Risk Percentage:</strong> {riskVal.toFixed(1)}%</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm mb-2">Key Risk Factors</h3>
                    {result.top_factors?.map((f, i) => (
                      <p key={i} className="text-sm">
                        • {f.reason} ({f.value}) → Impact {f.impact}
                      </p>
                    ))}
                  </div>

                  <div>
                    <h3 className="font-bold text-sm mb-2">Recommendations</h3>
                    {result.recommendations?.map((r, i) => (
                      <p key={i} className="text-sm">• {r}</p>
                    ))}
                  </div>

                  <div>
                    <h3 className="font-bold text-sm mb-2">Medical Explanation</h3>
                    <p className="text-sm text-slate-700 whitespace-pre-line">
                      {result.theory}
                    </p>
                  </div>

                </div>

                {/* BUTTON */}
                <Button
                  onClick={() => navigate('/history')}
                  className="w-full bg-black text-white"
                >
                  View Full History <ChevronRight className="ml-2 h-4 w-4" />
                </Button>

              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ResultPage;