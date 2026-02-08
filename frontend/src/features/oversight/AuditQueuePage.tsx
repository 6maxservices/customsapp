import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import api from '../../lib/api';
import { AlertTriangle, CheckCircle, Clock, ArrowRight, Filter, RefreshCw } from 'lucide-react';

interface ForwardedSubmission {
    id: string;
    status: string;
    forwardedAt: string;
    station: {
        id: string;
        name: string;
        city: string;
        riskScore: number;
    };
    company: {
        name: string;
    };
    period: {
        month: number;
        year: number;
    };
}

export default function AuditQueuePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [prioritizeHighRisk, setPrioritizeHighRisk] = useState(true);

    const isCustomsUser = user?.role.startsWith('CUSTOMS_') || user?.role === 'SYSTEM_ADMIN';

    // Fetch forwarded submissions from oversight queue
    const { data: queue = [], isLoading, refetch } = useQuery<ForwardedSubmission[]>({
        queryKey: ['audit-queue', prioritizeHighRisk],
        queryFn: () => api.get('/oversight/queue', {
            params: { prioritizeHighRisk, limit: 50 }
        }).then(res => res.data),
        enabled: isCustomsUser,
    });

    const getRiskBadge = (score: number) => {
        if (score >= 70) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    <AlertTriangle className="h-3 w-3" />
                    Υψηλός ({score})
                </span>
            );
        } else if (score >= 40) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                    <Clock className="h-3 w-3" />
                    Μέτριος ({score})
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <CheckCircle className="h-3 w-3" />
                    Χαμηλός ({score})
                </span>
            );
        }
    };

    if (!isCustomsUser) {
        return (
            <div className="p-8 text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                <h2 className="text-xl font-bold text-red-600 mt-4">Πρόσβαση Απορρίφθηκε</h2>
                <p className="text-gray-600">Μόνο οι Τελωνειακοί Ελεγκτές έχουν πρόσβαση σε αυτή τη σελίδα.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Ουρά Ελέγχου</h1>
                    <p className="text-gray-600">Υποβολές που έχουν προωθηθεί από εταιρείες για έλεγχο</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Ανανέωση"
                    >
                        <RefreshCw className="h-5 w-5" />
                    </button>
                    <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <input
                            type="checkbox"
                            checked={prioritizeHighRisk}
                            onChange={(e) => setPrioritizeHighRisk(e.target.checked)}
                            className="rounded"
                        />
                        <span className="text-sm text-gray-700">Υψηλός κίνδυνος πρώτα</span>
                    </label>
                </div>
            </div>

            {/* Queue Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Σταθμός / Εταιρεία
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Περίοδος
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Κίνδυνος
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Προωθήθηκε
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Ενέργεια
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                                        Φόρτωση ουράς ελέγχου...
                                    </div>
                                </td>
                            </tr>
                        ) : queue.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
                                    <p className="font-medium">Δεν υπάρχουν εκκρεμείς υποβολές</p>
                                    <p className="text-sm">Η ουρά ελέγχου είναι άδεια.</p>
                                </td>
                            </tr>
                        ) : (
                            queue.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-medium text-gray-900">{item.station.name}</div>
                                            <div className="text-sm text-gray-500">{item.company.name} • {item.station.city}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {item.period.month}/{item.period.year}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getRiskBadge(item.station.riskScore)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(item.forwardedAt).toLocaleDateString('el-GR')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => navigate(`/submissions/${item.id}`)}
                                            className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            Έλεγχος
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Queue Stats */}
            {queue.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                        <div className="text-2xl font-bold text-red-700">
                            {queue.filter(q => q.station.riskScore >= 70).length}
                        </div>
                        <div className="text-sm text-red-600">Υψηλού Κινδύνου</div>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                        <div className="text-2xl font-bold text-amber-700">
                            {queue.filter(q => q.station.riskScore >= 40 && q.station.riskScore < 70).length}
                        </div>
                        <div className="text-sm text-amber-600">Μέτριου Κινδύνου</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                        <div className="text-2xl font-bold text-green-700">
                            {queue.filter(q => q.station.riskScore < 40).length}
                        </div>
                        <div className="text-sm text-green-600">Χαμηλού Κινδύνου</div>
                    </div>
                </div>
            )}
        </div>
    );
}
