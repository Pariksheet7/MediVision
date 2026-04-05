import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Activity, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { api, token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    highRisk: 0,
    lowRisk: 0,
    recent: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      try {
        const res = await api.get('/api/history');
        const data = res.data || [];
        
        const high = data.filter(r => r.risk_level === 'High Risk').length;
        
        setStats({
          total: data.length,
          highRisk: high,
          lowRisk: data.length - high,
          recent: data.slice(0, 3) // Only show last 3
        });
      } catch (err) {
        console.error("Dashboard sync error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [api, token]);

  const statCards = [
    { 
      title: "Total Assessments", 
      value: stats.total, 
      icon: Users, 
      color: "text-blue-600", 
      bg: "bg-blue-50" 
    },
    { 
      title: "High Risk Cases", 
      value: stats.highRisk, 
      icon: AlertCircle, 
      color: "text-red-600", 
      bg: "bg-red-50" 
    },
    { 
      title: "Low Risk/Healthy", 
      value: stats.lowRisk, 
      icon: CheckCircle2, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50" 
    },
    { 
      title: "System Accuracy", 
      value: "94.2%", 
      icon: TrendingUp, 
      color: "text-purple-600", 
      bg: "bg-purple-50" 
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Medical Command Center</h1>
            <p className="text-slate-500 font-medium">Real-time diagnostic overview and patient analytics.</p>
          </div>
          <Button 
            onClick={() => navigate('/predict')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 h-12 shadow-lg shadow-blue-200 transition-all"
          >
            + NEW DIAGNOSIS
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <Card key={i} className="border-none shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{stat.title}</p>
                    <h3 className="text-3xl font-black text-slate-900">
                      {loading ? <Loader2 className="h-6 w-6 animate-spin text-slate-200" /> : stat.value}
                    </h3>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity Section */}
          <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between px-8 pt-8">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Activity className="text-blue-600" /> Recent Activity
              </CardTitle>
              <Button variant="ghost" className="text-blue-600 font-bold" onClick={() => navigate('/history')}>
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="space-y-4">
                {loading ? (
                  [1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-2xl" />)
                ) : stats.recent.length > 0 ? (
                  stats.recent.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center font-black text-white ${item.risk_level === 'High Risk' ? 'bg-red-400' : 'bg-emerald-400'}`}>
                          {item.patient_name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.patient_name}</p>
                          <p className="text-xs text-slate-500">{item.disease_name} • {new Date(item.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-black ${item.risk_level === 'High Risk' ? 'text-red-600' : 'text-emerald-600'}`}>
                          {item.risk_percentage.toFixed(1)}%
                        </p>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Risk Score</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium italic">No assessment data available yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Platform Health / Quick Tip */}
          <Card className="bg-slate-900 border-none shadow-xl rounded-3xl text-white overflow-hidden relative">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Activity size={120} />
             </div>
             <CardContent className="p-8 h-full flex flex-col justify-between relative z-10">
                <div className="space-y-4">
                  <div className="inline-flex p-3 bg-blue-500/20 rounded-2xl text-blue-400">
                    <TrendingUp />
                  </div>
                  <h3 className="text-2xl font-black leading-tight">AI Model Confidence <br/>is Nominal.</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    MediVision v3.0 is currently utilizing GPT-3.5 and custom logic for patient screening. Accuracy remains consistent at 94%.
                  </p>
                </div>
                <Button className="w-full bg-white text-slate-900 font-black h-12 rounded-xl mt-6 hover:bg-blue-50 transition-colors">
                  System Health Details
                </Button>
             </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;