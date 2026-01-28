import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
    LayoutDashboard,
    Building2,
    FileText,
    CheckSquare,
    Users,
    Settings,
    X,
    Map,
} from 'lucide-react';
import { commonText, translateUserRole } from '../../lib/translations';

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
    const { user } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => {
        if (path === '/dashboard') {
            return location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(path);
    };

    const menuItems = [
        {
            name: commonText.dashboard,
            href: '/dashboard',
            icon: LayoutDashboard,
            roles: ['STATION_OPERATOR', 'COMPANY_ADMIN', 'CUSTOMS_REVIEWER', 'SYSTEM_ADMIN'],
        },
        {
            name: 'Εθνικός Χάρτης', // National Map (Customs)
            href: '/audit/map',
            icon: Map,
            roles: ['CUSTOMS_REVIEWER', 'SYSTEM_ADMIN'],
        },
        {
            name: commonText.stations,
            href: '/stations',
            icon: Building2,
            roles: ['COMPANY_ADMIN', 'SYSTEM_ADMIN'],
        },
        {
            name: commonText.submissions,
            href: '/submissions',
            icon: FileText,
            roles: ['COMPANY_ADMIN', 'CUSTOMS_REVIEWER', 'SYSTEM_ADMIN'],
        },
        {
            name: 'Ουρά Ελέγχου', // Audit Queue (Customs)
            href: '/audit/queue',
            icon: CheckSquare,
            roles: ['CUSTOMS_REVIEWER', 'SYSTEM_ADMIN'],
        },
        {
            name: commonText.tasks,
            href: '/dashboard/tasks',
            icon: CheckSquare,
            roles: ['STATION_OPERATOR', 'COMPANY_ADMIN', 'CUSTOMS_REVIEWER', 'SYSTEM_ADMIN'],
        },
        {
            name: 'Χρήστες', // Users
            href: '/settings/users',
            icon: Users,
            roles: ['COMPANY_ADMIN', 'SYSTEM_ADMIN'],
        },
        {
            name: 'Ρυθμίσεις', // Settings
            href: '/settings',
            icon: Settings,
            roles: ['SYSTEM_ADMIN'],
        },
    ];

    const filteredMenu = menuItems.filter((item) =>
        item.roles.includes(user?.role || '')
    );

    return (
        <>
            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:top-20 lg:bottom-0 
          ${sidebarOpen ? 'translate-x-0 bottom-0 top-0 pt-0' : '-translate-x-full lg:h-[calc(100vh-5rem)]'}
        `}
            >
                <div className="flex flex-col h-full lg:h-[calc(100vh-5rem)] bg-white">
                    {/* Mobile Header */}
                    <div className="lg:hidden flex items-center justify-between h-20 px-6 border-b border-gray-100 bg-gray-50/50">
                        <span className="font-bold text-lg text-aade-primary tracking-tight">Μενού Πλοήγησης</span>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 hover:bg-white rounded-full transition-colors"
                        >
                            <X className="h-6 w-6 text-gray-400" />
                        </button>
                    </div>

                    <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
                        <div className="mb-4 px-4">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Κύριες Λειτουργίες</span>
                        </div>

                        {filteredMenu.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center px-4 py-3.5 text-[14px] font-semibold rounded-xl transition-all duration-200 group relative border shadow-sm ${active
                                            ? 'bg-blue-50 text-aade-primary border-blue-100'
                                            : 'text-gray-500 hover:text-aade-primary hover:bg-gray-50 border-transparent shadow-none'
                                        }`}
                                >
                                    <Icon className={`mr-3.5 h-[18px] w-[18px] ${active ? 'text-aade-accent' : 'text-gray-400 group-hover:text-aade-accent'}`} />
                                    {item.name}

                                    {active && (
                                        <div className="absolute left-[-17px] top-1/2 -translate-y-1/2 w-1.5 h-8 bg-aade-accent rounded-r-full shadow-[0_0_10px_rgba(0,112,192,0.4)]" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Status Card (Desktop Only) */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50 m-4 rounded-2xl border hidden lg:block">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-aade-primary font-bold">
                                {user?.email?.[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{user?.email}</p>
                                <p className="text-[11px] font-medium text-aade-accent uppercase tracking-tighter">
                                    {user?.role ? translateUserRole(user.role) : ''}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Information */}
                    <div className="p-6 border-t border-gray-100 flex flex-col items-center gap-1 group">
                        <p className="text-[10px] text-gray-400 font-medium">v1.2.1 Stable Release</p>
                        <p className="text-[10px] text-gray-300 group-hover:text-aade-primary transition-colors">FuelGuard © 2026 ΑΑΔΕ</p>
                    </div>
                </div>
            </aside>
        </>
    );
}
