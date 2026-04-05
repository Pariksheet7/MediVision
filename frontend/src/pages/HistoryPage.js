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
import { History, ClipboardList, Search, Loader2, Calendar, Fingerprint, Printer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const HistoryPage = () => {
  const { api, token } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      try {
        const res = await api.get('/api/history');
        setHistory(res.data || []);
      } catch (err) {
        console.error("History fetch error:", err);
        toast.error("Failed to sync medical records");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [api, token]);

  const filteredHistory = history.filter(item => 
    item.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.disease_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <History className="text-blue-600 h-8 w-8" /> Patient Records
            </h1>
            <p className="text-slate-500 font-medium">Verified AI diagnostic logs from MediVision Vault.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by patient or disease..." 
              className="pl-10 h-12 bg-white border-slate-200 shadow-sm rounded-xl focus:ring-blue-500/10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-32 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-blue-600 h-12 w-12" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">
                Decrypting Secure Vault...
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-b border-slate-100">
                    <TableHead className="font-bold text-slate-600 py-4">Timestamp</TableHead>
                    <TableHead className="font-bold text-slate-600">Patient</TableHead>
                    <TableHead className="font-bold text-slate-600">Disease Model</TableHead>
                    <TableHead className="font-bold text-slate-600">AI Result</TableHead>
                    <TableHead className="font-bold text-slate-600">Confidence</TableHead>
                    <TableHead className="text-right font-bold text-slate-600 px-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((record) => {
                    const dateObj = record.created_at ? new Date(record.created_at) : new Date();
                    return (
                      <TableRow key={record.id || record._id} className="hover:bg-blue-50/20 transition-colors group">
                        <TableCell className="py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700">
                              {dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono uppercase">
                              {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                              {record.patient_name?.charAt(0) || 'P'}
                            </div>
                            <span className="font-heavy text-slate-900 font-bold">{record.patient_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 font-bold px-3 py-1">
                            {record.disease_name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={record.risk_level === 'High Risk' 
                            ? 'bg-red-50 text-red-600 border-red-200 font-black' 
                            : 'bg-green-50 text-green-600 border-green-200 font-black'} 
                          variant="outline">
                            {record.risk_level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden hidden sm:block">
                              <div 
                                className={`h-full transition-all duration-700 ${record.risk_percentage > 70 ? 'bg-red-500' : 'bg-blue-500'}`}
                                style={{ width: `${record.risk_percentage || 0}%` }}
                              />
                            </div>
                            <span className="text-xs font-black text-slate-700">{(record.risk_percentage || 0).toFixed(1)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-6">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="hover:bg-blue-600 hover:text-white text-blue-600 font-black rounded-lg transition-all">
                                VIEW REPORT
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl rounded-3xl">
                              <DialogHeader className="p-8 bg-slate-900 text-white">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <DialogTitle className="flex items-center gap-3 text-2xl font-black">
                                      <ClipboardList className="text-blue-400 h-7 w-7" /> 
                                      Diagnostic Report
                                    </DialogTitle>
                                    <div className="mt-3 flex items-center gap-4 text-slate-400 text-sm font-medium">
                                      <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {record.patient_name}</span>
                                      <span className="text-slate-700">|</span>
                                      <span className="flex items-center gap-1.5"><Fingerprint className="h-4 w-4" /> ID: {(record.id || record._id)?.slice(-8).toUpperCase()}</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-1">AI Status</p>
                                    <p className={`text-xl font-black ${record.risk_level === 'High Risk' ? 'text-red-400' : 'text-green-400'}`}>
                                      {record.risk_level}
                                    </p>
                                  </div>
                                </div>
                              </DialogHeader>
                              
                              <div className="overflow-y-auto p-8 bg-slate-50">
                                <div className="mb-6 flex items-center gap-2">
                                  <div className="h-px flex-1 bg-slate-200"></div>
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Input Parameters</span>
                                  <div className="h-px flex-1 bg-slate-200"></div>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                  {record.features && Object.entries(record.features).map(([key, value]) => (
                                    <div key={key} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-blue-300 transition-all">
                                      <p className="text-[9px] uppercase font-black text-slate-400 mb-1 leading-tight">
                                        {key.replace(/_/g, ' ')}
                                      </p>
                                      <p className="text-sm font-bold text-slate-800">
                                        {typeof value === 'number' ? value.toFixed(4) : value}
                                      </p>
                                    </div>
                                  ))}
                                </div>

                                {record.clinical_summary && (
                                  <div className="mt-8 p-6 bg-blue-50/50 border border-blue-100 rounded-2xl">
                                    <p className="text-[10px] font-black text-blue-600 uppercase mb-2">AI Summary</p>
                                    <p className="text-sm text-slate-700 leading-relaxed italic">"{record.clinical_summary}"</p>
                                  </div>
                                )}
                              </div>

                              <div className="p-6 bg-white border-t border-slate-100 flex justify-between items-center">
                                <p className="text-[10px] text-slate-400 italic max-w-[60%]">Confidential medical record. AI-assisted diagnosis requires professional clinical validation.</p>
                                <Button className="bg-slate-900 hover:bg-black text-white font-bold rounded-xl" onClick={() => window.print()}>
                                  <Printer className="mr-2 h-4 w-4" /> Print PDF
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          
          {!loading && filteredHistory.length === 0 && (
            <div className="py-32 text-center">
              <Search className="h-10 w-10 text-slate-200 mx-auto mb-6" />
              <h3 className="text-lg font-bold text-slate-800">No medical records found</h3>
              <p className="text-slate-400 max-w-xs mx-auto mt-2 text-sm font-medium">Try a different search or run a new diagnosis.</p>
              <Button variant="outline" className="mt-8 rounded-xl" onClick={() => setSearchTerm('')}>Clear Search</Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HistoryPage;