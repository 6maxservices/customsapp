import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import {
  LayoutDashboard,
  Building2,
  FileText,
  CheckSquare,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { commonText, translateUserRole } from '../lib/translations';
import { getCurrentPeriod } from '../lib/periods';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigation = [
    { name: commonText.dashboard, href: '/dashboard', icon: LayoutDashboard },
    { name: commonText.stations, href: '/stations', icon: Building2 },
    { name: commonText.submissions, href: '/submissions', icon: FileText },
    { name: commonText.tasks, href: '/tasks', icon: CheckSquare },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
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

        {/* Mobile Sidebar Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:top-20 lg:bottom-0 
              ${sidebarOpen ? 'translate-x-0 bottom-0 top-0 pt-0' : '-translate-x-full lg:h-[calc(100vh-5rem)]'}
            `}
          style={sidebarOpen ? { paddingTop: 0 } : {}}
        >
          <div className="flex flex-col h-full lg:h-[calc(100vh-5rem)]">
            {/* Mobile Header in Sidebar */}
            <div className="lg:hidden flex items-center justify-between h-20 px-6 border-b border-gray-200 bg-gray-50">
              <span className="font-bold text-lg text-gray-900">Menu</span>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
              {navigation.filter(item => {
                // Reviewers hide Stations
                if (user?.role === 'CUSTOMS_REVIEWER' && item.href === '/stations') return false;
                return true;
              }).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors group border-l-4 ${active
                      ? 'bg-blue-50 text-aade-primary border-aade-accent shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent'
                      }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${active ? 'text-aade-accent' : 'text-gray-400 group-hover:text-gray-500'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-[10px] text-center text-gray-500">v1.2.0 Beta • FuelGuard © 2026</p>
            </div>
          </div>
        </aside>

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
