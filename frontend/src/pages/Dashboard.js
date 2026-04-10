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
import { toast } from "sonner";

const Dashboard = () => {
  const { api, token, clearHistory } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    highRisk: 0,
    lowRisk: 0,
    recent: []
  });

  const [loading, setLoading] = useState(true);

  // 🔥 FETCH DATA
  const fetchDashboardData = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await api.get('/api/history');
      const data = res.data || [];

      const high = data.filter(r => r.risk_level === 'High Risk').length;

      setStats({
        total: data.length,
        highRisk: high,
        lowRisk: data.length - high,
        recent: data.slice(0, 3)
      });

    } catch (err) {
      console.error("Dashboard error:", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  // 🔥 CLEAR HISTORY
  const handleClearHistory = async () => {
    const confirmDelete = window.confirm("Are you sure you want to clear all history?");
    if (!confirmDelete) return;

    const result = await clearHistory();

    if (result.success) {
      setStats({
        total: 0,
        highRisk: 0,
        lowRisk: 0,
        recent: []
      });
      toast.success("History cleared successfully");
    } else {
      toast.error(result.error);
    }
  };

  const statCards = [
    { title: "Total Assessments", value: stats.total, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "High Risk Cases", value: stats.highRisk, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
    { title: "Low Risk/Healthy", value: stats.lowRisk, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "System Accuracy", value: "94.2%", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex justify-between items-end flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">
              Medical Command Center
            </h1>
            <p className="text-slate-500 font-medium">
              Real-time diagnostic overview and patient analytics.
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleClearHistory}
              className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl px-4 h-12"
            >
              Clear History
            </Button>

            <Button 
              onClick={() => navigate('/predict')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 h-12 shadow-lg shadow-blue-200"
            >
              + NEW DIAGNOSIS
            </Button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <Card key={i} className="border-none shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-black text-slate-400">
                      {stat.title}
                    </p>

                    <h3 className="text-3xl font-black">
                      {loading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        stat.value
                      )}
                    </h3>
                  </div>

                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={stat.color} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* RECENT ACTIVITY */}
        <Card className="border-none shadow-sm rounded-3xl">
          <CardHeader className="flex justify-between px-8 pt-8">
            <CardTitle className="text-xl font-black flex gap-2 items-center">
              <Activity className="text-blue-600" /> Recent Activity
            </CardTitle>

            <Button onClick={() => navigate('/history')}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="px-8 pb-8 space-y-3">
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : stats.recent.length > 0 ? (
              stats.recent.map(item => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl"
                >
                  <div>
                    <p className="font-bold">{item.patient_name}</p>
                    <p className="text-xs text-slate-500">
                      {item.disease_name}
                    </p>
                  </div>

                  <p className="font-semibold">
                    {(item.risk_percentage || 0).toFixed(1)}%
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-400">
                No recent activity
              </p>
            )}
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;