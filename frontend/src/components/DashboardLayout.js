import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, 
  LayoutDashboard, 
  Stethoscope, 
  History, 
  LogOut, 
  Menu, 
  X, 
  UserCircle,
  Settings // Added Settings icon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';

// IMPORTANT: Ensure these files exist in your components folder!
import ChatAssistant from './ChatAssistant'; 

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // UPDATED: Added Profile to menuItems for global access
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Stethoscope, label: 'Predict Disease', path: '/predict' },
    { icon: History, label: 'Patient History', path: '/history' },
    { icon: Settings, label: 'Account Settings', path: '/profile' }, 
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* --- TOP NAVIGATION BAR --- */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                MediVision<span className="text-blue-600">.</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* UPDATED: Wrapped User Info in a Link to make it clickable */}
            <Link 
              to="/profile" 
              className="hidden md:flex items-center space-x-3 pr-4 border-r border-slate-200 group hover:opacity-80 transition-all"
            >
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 leading-none group-hover:text-blue-600">
                  {user?.full_name || 'Medical Officer'}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                  Authorized Access
                </p>
              </div>
              <UserCircle className="h-8 w-8 text-slate-300 group-hover:text-blue-600" />
            </Link>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-600 font-bold"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* --- SIDEBAR NAVIGATION --- */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-slate-200 z-40 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : ''}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-6 md:p-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>

      <ChatAssistant />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;