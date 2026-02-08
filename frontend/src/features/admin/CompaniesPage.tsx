import React, { useState, useEffect } from 'react';
import { Plus, Edit, Search, X, AlertTriangle, Building2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

interface Company {
    id: string;
    name: string;
    afm: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    createdAt: string;
    _count?: { stations: number; users: number };
}

export default function CompaniesPage() {
    const { user: currentUser } = useAuth();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        afm: '',
        email: '',
        phone: '',
        address: '',
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/registry/companies`, {
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to fetch companies');
            const data = await res.json();
            setCompanies(data.companies || []);
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
            const url = editingCompany
                ? `${import.meta.env.VITE_API_URL}/api/registry/companies/${editingCompany.id}`
                : `${import.meta.env.VITE_API_URL}/api/registry/companies`;

            const res = await fetch(url, {
                method: editingCompany ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save company');
            }

            setShowModal(false);
            setEditingCompany(null);
            resetForm();
            fetchCompanies();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', afm: '', email: '', phone: '', address: '' });
    };

    const openEditModal = (company: Company) => {
        setEditingCompany(company);
        setFormData({
            name: company.name,
            afm: company.afm,
            email: company.email || '',
            phone: company.phone || '',
            address: company.address || '',
        });
        setShowModal(true);
    };

    const filteredCompanies = companies.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.afm.includes(search)
    );

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
                <h1 className="text-2xl font-bold text-gray-900">Διαχείριση Εταιρειών</h1>
                <button
                    onClick={() => { resetForm(); setEditingCompany(null); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Νέα Εταιρεία
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Αναζήτηση εταιρειών..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center justify-between">
                    {error}
                    <button onClick={() => setError(null)}><X className="h-4 w-4" /></button>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCompanies.length === 0 ? (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            Δεν βρέθηκαν εταιρείες
                        </div>
                    ) : (
                        filteredCompanies.map((company) => (
                            <div key={company.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-green-50 rounded-lg">
                                            <Building2 className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{company.name}</h3>
                                            <p className="text-sm text-gray-500">ΑΦΜ: {company.afm}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openEditModal(company)}
                                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                {company.email && <p className="mt-3 text-sm text-gray-500">{company.email}</p>}
                                {company.address && <p className="text-sm text-gray-500">{company.address}</p>}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">{editingCompany ? 'Επεξεργασία Εταιρείας' : 'Νέα Εταιρεία'}</h2>
                            <button onClick={() => setShowModal(false)}><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Επωνυμία</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ΑΦΜ</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={9}
                                    value={formData.afm}
                                    onChange={(e) => setFormData({ ...formData, afm: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Τηλέφωνο</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Διεύθυνση</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
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
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
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
