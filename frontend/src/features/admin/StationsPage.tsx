import React, { useState, useEffect } from 'react';
import { Plus, Edit, Search, X, AlertTriangle, MapPin } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

interface Station {
    id: string;
    name: string;
    address: string | null;
    companyId: string;
    company?: { id: string; name: string };
    createdAt: string;
}

interface Company {
    id: string;
    name: string;
}

export default function StationsPage() {
    const { user: currentUser } = useAuth();
    const [stations, setStations] = useState<Station[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filterCompany, setFilterCompany] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingStation, setEditingStation] = useState<Station | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        companyId: '',
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [stationsRes, companiesRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL}/api/registry/stations`, { credentials: 'include' }),
                fetch(`${import.meta.env.VITE_API_URL}/api/registry/companies`, { credentials: 'include' }),
            ]);
            if (!stationsRes.ok) throw new Error('Failed to fetch stations');
            const stationsData = await stationsRes.json();
            const companiesData = companiesRes.ok ? await companiesRes.json() : { companies: [] };
            setStations(stationsData.stations || []);
            setCompanies(companiesData.companies || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const url = editingStation
                ? `${import.meta.env.VITE_API_URL}/api/registry/stations/${editingStation.id}`
                : `${import.meta.env.VITE_API_URL}/api/registry/stations`;

            const res = await fetch(url, {
                method: editingStation ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save station');
            }

            setShowModal(false);
            setEditingStation(null);
            resetForm();
            fetchData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', address: '', companyId: '' });
    };

    const openEditModal = (station: Station) => {
        setEditingStation(station);
        setFormData({
            name: station.name,
            address: station.address || '',
            companyId: station.companyId,
        });
        setShowModal(true);
    };

    const filteredStations = stations.filter((s) => {
        const matchesSearch =
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            (s.address && s.address.toLowerCase().includes(search.toLowerCase()));
        const matchesCompany = !filterCompany || s.companyId === filterCompany;
        return matchesSearch && matchesCompany;
    });

    if (currentUser?.role !== 'SYSTEM_ADMIN') {
        return (
            <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
                <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                <h2 className="mt-4 text-2xl font-bold text-red-600">Πρόσβαση Απορρίφθηκε</h2>
                <p className="mt-2 text-gray-500">Αυτή η σελίδα είναι διαθέσιμη μόνο σε Διαχειριστές Συστήματος.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Διαχείριση Πρατηρίων</h1>
                <button
                    onClick={() => { resetForm(); setEditingStation(null); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Νέο Πρατήριο
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Αναζήτηση πρατηρίων..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <select
                    value={filterCompany}
                    onChange={(e) => setFilterCompany(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    <option value="">Όλες οι Εταιρείες</option>
                    {companies.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center justify-between">
                    {error}
                    <button onClick={() => setError(null)}><X className="h-4 w-4" /></button>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Πρατήριο</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Διεύθυνση</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Εταιρεία</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ενέργειες</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredStations.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        Δεν βρέθηκαν πρατήρια
                                    </td>
                                </tr>
                            ) : (
                                filteredStations.map((station) => (
                                    <tr key={station.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-50 rounded-lg">
                                                    <MapPin className="h-4 w-4 text-purple-600" />
                                                </div>
                                                <span className="font-medium text-gray-900">{station.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{station.address || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{station.company?.name || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => openEditModal(station)}
                                                className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">{editingStation ? 'Επεξεργασία Πρατηρίου' : 'Νέο Πρατήριο'}</h2>
                            <button onClick={() => setShowModal(false)}><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Όνομα</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Διεύθυνση</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Εταιρεία</label>
                                <select
                                    required
                                    value={formData.companyId}
                                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">-- Επιλέξτε Εταιρεία --</option>
                                    {companies.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Ακύρωση
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                                >
                                    {submitting ? 'Αποθήκευση...' : 'Αποθήκευση'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
