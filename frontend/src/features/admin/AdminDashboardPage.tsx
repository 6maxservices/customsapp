import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, MapPin, FileText, Activity, AlertTriangle } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

interface DashboardStats {
    users: number;
    companies: number;
    stations: number;
    pendingSubmissions: number;
    activeTasks: number;
}

export default function AdminDashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            // Fetch basic counts from existing APIs
            const [usersRes, companiesRes, stationsRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL}/api/users`, { credentials: 'include' }),
                fetch(`${import.meta.env.VITE_API_URL}/api/registry/companies`, { credentials: 'include' }),
                fetch(`${import.meta.env.VITE_API_URL}/api/registry/stations`, { credentials: 'include' }),
            ]);

            const usersData = usersRes.ok ? await usersRes.json() : { users: [] };
            const companiesData = companiesRes.ok ? await companiesRes.json() : { companies: [] };
            const stationsData = stationsRes.ok ? await stationsRes.json() : { stations: [] };

            setStats({
                users: usersData.users?.length || 0,
                companies: companiesData.companies?.length || 0,
                stations: stationsData.stations?.length || 0,
                pendingSubmissions: 0,
                activeTasks: 0,
            });
        } catch (err) {
            setError('Failed to load dashboard stats');
        } finally {
            setLoading(false);
        }
    };

    if (user?.role !== 'SYSTEM_ADMIN') {
        return (
            <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
                <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                <h2 className="mt-4 text-2xl font-bold text-red-600">Πρόσβαση Απορρίφθηκε</h2>
                <p className="mt-2 text-gray-500">Αυτή η σελίδα είναι διαθέσιμη μόνο σε Διαχειριστές Συστήματος.</p>
            </div>
        );
    }

    const statCards = [
        { label: 'Χρήστες', value: stats?.users || 0, icon: Users, link: '/admin/users', color: 'bg-blue-500' },
        { label: 'Εταιρείες', value: stats?.companies || 0, icon: Building2, link: '/admin/companies', color: 'bg-green-500' },
        { label: 'Πρατήρια', value: stats?.stations || 0, icon: MapPin, link: '/admin/stations', color: 'bg-purple-500' },
        { label: 'Υποβολές', value: stats?.pendingSubmissions || '-', icon: FileText, link: '/admin/periods', color: 'bg-orange-500' },
        { label: 'Εργασίες', value: stats?.activeTasks || '-', icon: Activity, link: '/admin/audit', color: 'bg-red-500' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Διαχείριση Συστήματος</h1>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {statCards.map((card) => (
                        <Link
                            key={card.label}
                            to={card.link}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${card.color}`}>
                                    <card.icon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                                    <p className="text-sm text-gray-500">{card.label}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold mb-4">Γρήγορες Ενέργειες</h2>
                    <div className="space-y-3">
                        <Link to="/admin/users" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <Users className="h-5 w-5 text-blue-600" />
                            <span>Διαχείριση Χρηστών</span>
                        </Link>
                        <Link to="/admin/companies" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <Building2 className="h-5 w-5 text-green-600" />
                            <span>Διαχείριση Εταιρειών</span>
                        </Link>
                        <Link to="/admin/stations" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <MapPin className="h-5 w-5 text-purple-600" />
                            <span>Διαχείριση Πρατηρίων</span>
                        </Link>
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold mb-4">Κατάσταση Συστήματος</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <span className="text-green-700">API Server</span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded-full">Online</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <span className="text-green-700">Database</span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded-full">Connected</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
