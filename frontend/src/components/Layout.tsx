import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import {
  LogOut,
  Menu,
} from 'lucide-react';
import { useState } from 'react';
import { commonText, translateUserRole } from '../lib/translations';
import { getCurrentPeriod } from '../lib/periods';
import Sidebar from '../features/layout/Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-bg-screen flex flex-col font-sans">
      {/* 1. Full-width Sticky Header (AADE Branding) */}
      <header className="bg-aade-primary border-b border-blue-900 h-20 fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-white hover:text-blue-200"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo / App Name */}
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-md h-14 min-w-[120px] flex items-center justify-center overflow-hidden shadow-sm">
              <img src="/aade_logo.svg" alt="AADE Logo" className="h-full w-full object-contain" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl font-bold text-white tracking-tight leading-none mb-0.5">
                Σύστημα FuelGuard
              </h1>
              <span className="text-[11px] text-blue-100 font-medium tracking-wide opacity-90">
                Σύστημα Ελέγχου Αδειών & Συμμόρφωσης Πρατηρίων Καυσίμων
              </span>
            </div>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center px-3 py-1 bg-blue-800 text-white rounded-full border border-blue-700 text-sm font-medium shadow-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            {getCurrentPeriod().label}
          </div>

          <div className="hidden md:block h-8 w-px bg-blue-800 mx-2"></div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{user?.email}</p>
              <p className="text-xs text-blue-200">{user?.role ? translateUserRole(user.role) : ''}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2 text-blue-200 hover:text-white hover:bg-blue-800 rounded-lg transition-colors"
              title={commonText.logout}
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Layout Container (Offset for header) */}
      <div className="flex flex-1 pt-20">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Content Area */}

        {/* Main Content Area */}
        <main className="flex-1 bg-bg-screen min-h-[calc(100vh-5rem)] w-full">
          <div className="w-full px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
