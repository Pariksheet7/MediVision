import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, AlertTriangle, ShieldCheck, Printer, Stethoscope, Activity, FileText, ChevronRight, Sparkles } from 'lucide-react';

const ResultPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.prediction;

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

  const riskVal = result.risk_percentage || 0;
  const isHigh = riskVal >= 50;
  const severityColor = isHigh ? 'text-red-600' : 'text-emerald-600';
  const severityBg = isHigh ? 'bg-red-500' : 'bg-emerald-500';
  const severityLightBg = isHigh ? 'bg-red-50' : 'bg-emerald-50';

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 p-4 pb-20">
        <div className="flex justify-between items-center no-print">
          <Button variant="ghost" onClick={() => navigate('/predict')} className="font-bold">
            <ArrowLeft className="mr-2 h-4 w-4" /> NEW ANALYSIS
          </Button>
          <Button onClick={() => window.print()} variant="outline" className="font-bold">
            <Printer className="mr-2 h-4 w-4" /> PRINT REPORT
          </Button>
        </div>
        
        <Card className="overflow-hidden border-none shadow-2xl rounded-3xl">
          <div className={`h-3 ${severityBg}`} />
          <CardContent className="p-0">
            <div className="grid lg:grid-cols-5">
              <div className={`lg:col-span-2 p-10 flex flex-col items-center justify-center border-r border-slate-100 ${severityLightBg}/30`}>
                <div className={`p-4 rounded-2xl mb-4 ${severityLightBg}`}>
                  {isHigh ? <AlertTriangle className="h-12 w-12 text-red-500" /> : <ShieldCheck className="h-12 w-12 text-emerald-500" />}
                </div>
                <h2 className="text-3xl font-black text-slate-900 text-center">{result.patient_name}</h2>
                <p className="text-slate-400 font-bold text-xs uppercase mt-1">{result.disease_name} Assessment</p>
                <div className="mt-8 text-center">
                   <div className={`text-7xl font-black ${severityColor}`}>{riskVal.toFixed(1)}%</div>
                   <p className="text-[10px] font-black uppercase text-slate-400 mt-2">Predicted Risk</p>
                </div>
              </div>

              <div className="lg:col-span-3 p-10 space-y-8 bg-white">
                {result.clinical_summary && (
                  <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 p-5 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-blue-700">AI Interpretation</h4>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed italic">"{result.clinical_summary}"</p>
                  </div>
                )}

                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-blue-600" />
                    <h3 className="font-black text-sm uppercase tracking-widest text-slate-800">Action Plan</h3>
                  </div>
                  <div className="space-y-2">
                    {result.recommendations?.map((r, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className={`h-2 w-2 rounded-full ${severityBg}`} />
                        <p className="text-slate-700 text-sm font-bold">{r}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <Button onClick={() => navigate('/history')} className="w-full bg-slate-900 text-white font-bold h-12 rounded-xl">
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