import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Stethoscope, 
  History, 
  Settings, 
  LogOut, 
  Activity,
  UserCircle
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'New Diagnosis', icon: Stethoscope, path: '/predict' },
    { name: 'Medical History', icon: History, path: '/history' },
    { name: 'Health Analytics', icon: Activity, path: '/analytics' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="h-screen w-64 bg-slate-900 text-slate-300 flex flex-col fixed left-0 top-0 shadow-2xl z-40">
      {/* Logo Section */}
      <div className="p-8 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-xl">
          <Activity className="text-white h-6 w-6" />
        </div>
        <span className="text-white font-black text-xl tracking-tight">
          MediVision<span className="text-blue-500">.</span>
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 group ${
                isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* User & Settings Section */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <button 
          onClick={() => navigate('/settings')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
        >
          <Settings size={20} className="text-slate-500" />
          Settings
        </button>
        
        <div className="mt-4 p-4 bg-slate-800/50 rounded-2xl flex items-center gap-3 border border-slate-700/50">
          <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white">
            <UserCircle size={24} />
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-xs font-black truncate uppercase tracking-wider">Dr. Alexander</p>
            <p className="text-[10px] text-slate-500 font-bold truncate">Clinical Lead</p>
          </div>
          <button 
            onClick={handleLogout}
            className="ml-auto p-2 text-slate-500 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;