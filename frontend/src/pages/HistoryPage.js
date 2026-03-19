import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History as HistoryIcon, AlertTriangle, CheckCircle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const HistoryPage = () => {
  const { getAuthHeader } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [filteredPredictions, setFilteredPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDisease, setFilterDisease] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [predictions, filterDisease, filterRisk]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/history`, {
        headers: getAuthHeader(),
      });
      setPredictions(response.data);
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...predictions];

    if (filterDisease !== 'all') {
      filtered = filtered.filter((p) => p.disease_name === filterDisease);
    }

    if (filterRisk !== 'all') {
      filtered = filtered.filter((p) => p.risk_level === filterRisk);
    }

    setFilteredPredictions(filtered);
  };

  const diseases = [...new Set(predictions.map((p) => p.disease_name))];

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
      <div data-testid="history-page">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-accent mb-2">
            Patient History
          </h1>
          <p className="text-lg text-muted-foreground">
            View all your previous health risk predictions
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-accent">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Disease
              </label>
              <Select value={filterDisease} onValueChange={setFilterDisease}>
                <SelectTrigger className="h-12 bg-white border-slate-200" data-testid="filter-disease">
                  <SelectValue placeholder="All Diseases" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Diseases</SelectItem>
                  {diseases.map((disease, index) => (
                    <SelectItem key={index} value={disease}>
                      {disease}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Risk Level
              </label>
              <Select value={filterRisk} onValueChange={setFilterRisk}>
                <SelectTrigger className="h-12 bg-white border-slate-200" data-testid="filter-risk">
                  <SelectValue placeholder="All Risk Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="High Risk">High Risk</SelectItem>
                  <SelectItem value="Low Risk">Low Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredPredictions.length} of {predictions.length} predictions
          </p>
        </div>

        {/* History Table */}
        {filteredPredictions.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-12 text-center">
            <HistoryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground mb-2">No predictions found</p>
            <p className="text-sm text-muted-foreground">
              {predictions.length === 0
                ? 'Start by making your first prediction'
                : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="history-table">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Patient
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Disease
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Risk Level
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Risk %
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPredictions.map((prediction, index) => {
                    const isHighRisk = prediction.risk_level === 'High Risk';
                    return (
                      <tr
                        key={index}
                        className="hover:bg-slate-50 transition-colors"
                        data-testid={`history-row-${index}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-accent">
                          {new Date(prediction.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-accent">
                          {prediction.patient_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-accent">
                          {prediction.disease_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              isHighRisk
                                ? 'bg-red-100 text-destructive'
                                : 'bg-green-100 text-success'
                            }`}
                            data-testid={`risk-badge-${index}`}
                          >
                            {isHighRisk ? (
                              <AlertTriangle className="h-3 w-3 mr-1" />
                            ) : (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            )}
                            {prediction.risk_level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 max-w-[100px]">
                              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    isHighRisk ? 'bg-destructive' : 'bg-success'
                                  }`}
                                  style={{ width: `${prediction.risk_percentage}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-accent min-w-[45px]">
                              {prediction.risk_percentage}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HistoryPage;
