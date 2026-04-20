import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Lock, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
  // 🔥 FIX: use updateProfile instead of axios
  const { user, updateProfile } = useAuth();

  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: user?.name || '',
    email: user?.email || '',
    current_password: '',
    new_password: ''
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await updateProfile(formData.email, formData.full_name);

      if (!res.success) {
        throw new Error(res.error);
      }

      toast.success("Clinical profile updated!");

      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: ''
      }));

    } catch (error) {
      toast.error(error.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">User Settings</h1>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Manage your medical credentials</p>
          </div>
        </div>

        <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-900 text-white p-6">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="text-blue-400" /> Account Security
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleUpdate} className="space-y-6">

              <div className="grid gap-6">

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-400" size={18} />
                    <Input 
                      className="pl-10 bg-slate-50 border-slate-200 rounded-xl py-6"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                    <Input 
                      className="pl-10 bg-slate-50 border-slate-200 rounded-xl py-6"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <hr className="my-4 border-slate-100" />

                <div className="grid md:grid-cols-2 gap-4">

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-slate-400">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                      <Input 
                        type="password"
                        className="pl-10 bg-slate-50 border-slate-200 rounded-xl py-6"
                        placeholder="Required for any changes"
                        value={formData.current_password}
                        onChange={(e) => setFormData({...formData, current_password: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-slate-400">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                      <Input 
                        type="password"
                        className="pl-10 bg-slate-50 border-slate-200 rounded-xl py-6"
                        placeholder="Optional"
                        value={formData.new_password}
                        onChange={(e) => setFormData({...formData, new_password: e.target.value})}
                      />
                    </div>
                  </div>

                </div>

              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-2xl shadow-lg"
              >
                {loading ? "SAVING..." : "UPDATE PROFILE"}
              </Button>

            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;