import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Dashboard = () => {
  const navigate = useNavigate();
  const { getAuthHeader } = useAuth();
  const [stats, setStats] = useState({
    total_predictions: 0,
    high_risk_count: 0,
    low_risk_count: 0,
    recent_predictions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/stats`, {
        headers: getAuthHeader(),
      });
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Predictions',
      value: stats.total_predictions,
      icon: Activity,
      color: 'bg-blue-50',
      iconColor: 'text-primary',
    },
    {
      title: 'High Risk Cases',
      value: stats.high_risk_count,
      icon: AlertTriangle,
      color: 'bg-red-50',
      iconColor: 'text-destructive',
    },
    {
      title: 'Low Risk Cases',
      value: stats.low_risk_count,
      icon: TrendingUp,
      color: 'bg-green-50',
      iconColor: 'text-success',
    },
    {
      title: 'Recent (7 days)',
      value: stats.recent_predictions,
      icon: Clock,
      color: 'bg-amber-50',
      iconColor: 'text-warning',
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="dashboard-page">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-accent mb-2">
            Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Welcome back! Here's your health analytics overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white border border-slate-100 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                data-testid={`stat-card-${index}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                </div>
                <div className="text-4xl font-bold font-heading text-accent mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-muted-foreground">{stat.title}</div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-accent mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => navigate('/predict')}
              data-testid="quick-predict-btn"
              size="lg"
              className="h-14 text-base font-medium"
            >
              <Activity className="h-5 w-5 mr-2" />
              New Prediction
            </Button>
            <Button
              onClick={() => navigate('/history')}
              data-testid="quick-history-btn"
              variant="outline"
              size="lg"
              className="h-14 text-base font-medium border-2"
            >
              <Clock className="h-5 w-5 mr-2" />
              View History
            </Button>
          </div>
        </div>

        {/* Available Models */}
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-accent mb-6">Available Prediction Models</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center"
                data-testid={`model-${index}`}
              >
                <div className="text-sm font-medium text-accent">{disease}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
