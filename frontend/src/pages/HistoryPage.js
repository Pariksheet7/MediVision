// SAME IMPORTS (no change)
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { History, Search, Loader2, Printer, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const HistoryPage = () => {
  const { api, token, clearHistory } = useAuth();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 🔥 FETCH HISTORY
  const fetchHistory = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await api.get('/api/history');
      setHistory(res.data || []);
    } catch (err) {
      console.error("History fetch error:", err);
      toast.error("Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  // 🔥 CLEAR HISTORY
  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear all history?")) return;

    const result = await clearHistory();

    if (result.success) {
      setHistory([]);
      toast.success("History cleared successfully");
    } else {
      toast.error(result.error);
    }
  };

  // 🔥 DELETE SINGLE RECORD
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;

    try {
      await api.delete(`/api/delete-history/${id}`);

      // UI update
      setHistory(prev => prev.filter(item => item._id !== id));

      toast.success("Record deleted");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Delete failed");
    }
  };

  // 🔥 FILTER
  const filteredHistory = history.filter(item =>
    item.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.disease_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <History className="text-blue-600 h-8 w-8" /> Patient Records
            </h1>
            <p className="text-slate-500 font-medium">
              Verified AI diagnostic logs from MediVision Vault.
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">

            <Button 
              onClick={handleClearHistory}
              className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl h-12 px-4"
            >
              Clear History
            </Button>

            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search by patient or disease..." 
                className="pl-10 h-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">

          {loading ? (
            <div className="py-32 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-blue-600 h-12 w-12" />
              <p className="text-slate-400 font-bold text-xs">
                Loading patient records...
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Disease</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredHistory.map((record) => {
                    const dateObj = new Date(record.created_at);

                    return (
                      <TableRow key={record._id}> {/* ✅ FIXED HERE */}

                        <TableCell>{dateObj.toLocaleDateString()}</TableCell>
                        <TableCell>{record.patient_name}</TableCell>

                        <TableCell>
                          <Badge>{record.disease_name}</Badge>
                        </TableCell>

                        <TableCell>
                          <Badge className={
                            record.risk_level === 'High Risk'
                              ? 'bg-red-500'
                              : 'bg-green-500'
                          }>
                            {record.risk_level}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {(record.risk_percentage || 0).toFixed(1)}%
                        </TableCell>

                        <TableCell className="text-right flex gap-2 justify-end">

                          {/* VIEW BUTTON (UNCHANGED) */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm">VIEW</Button>
                            </DialogTrigger>

                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Medical Report</DialogTitle>
                              </DialogHeader>

                              <p><b>Patient:</b> {record.patient_name}</p>
                              <p><b>Disease:</b> {record.disease_name}</p>
                              <p><b>Risk:</b> {record.risk_level}</p>
                              <p><b>Confidence:</b> {(record.risk_percentage || 0).toFixed(1)}%</p>

                              <Button onClick={() => window.print()}>
                                <Printer className="mr-2" /> Print
                              </Button>
                            </DialogContent>
                          </Dialog>

                          {/* 🔥 DELETE BUTTON */}
                          <Button 
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(record._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>

              </Table>
            </div>
          )}

          {!loading && filteredHistory.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-slate-400">No records found</p>
              <Button onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
};

export default HistoryPage;