import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthContext';
import api from '../../lib/api';
import { Send, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface Period {
    id: string;
    startDate: string;
    endDate: string;
    month: number;
    year: number;
}

interface Submission {
    id: string;
    status: string;
    forwardedAt: string | null;
    station: {
        id: string;
        name: string;
        city: string;
    };
}

type ForwardMode = 'ONLY_APPROVED' | 'INCLUDE_EDGE_CASES';

export default function BulkForwardPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
    const [mode, setMode] = useState<ForwardMode>('ONLY_APPROVED');
    const [selectedStationIds, setSelectedStationIds] = useState<string[]>([]);
    const [perStationExplanation, setPerStationExplanation] = useState<Record<string, string>>({});
    const [showSuccess, setShowSuccess] = useState(false);

    // Fetch periods
    const { data: periods = [] } = useQuery<Period[]>({
        queryKey: ['periods'],
        queryFn: () => api.get('/periods').then(res => res.data.periods),
    });

    // Fetch approved submissions for selected period
    const { data: submissions = [], isLoading: submissionsLoading } = useQuery<Submission[]>({
        queryKey: ['forward-candidates', selectedPeriodId],
        queryFn: () => api.get('/company/submissions/inbox', { params: { periodId: selectedPeriodId } })
            .then(res => res.data.submissions),
        enabled: !!selectedPeriodId,
    });

    // Filter by status
    const approvedSubmissions = submissions.filter(s => s.status === 'APPROVED' && !s.forwardedAt);
    const edgeCaseSubmissions = submissions.filter(s =>
        (s.status !== 'APPROVED' || s.forwardedAt === null) && s.status !== 'DRAFT'
    );

    // Bulk forward mutation
    const forwardMutation = useMutation({
        mutationFn: async () => {
            return api.post('/company/submissions/forward-bulk', {
                periodId: selectedPeriodId,
                mode,
                stationIds: selectedStationIds.length > 0 ? selectedStationIds : undefined,
                perStationExplanation: mode === 'INCLUDE_EDGE_CASES' ? perStationExplanation : undefined,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['forward-candidates'] });
            setShowSuccess(true);
            setSelectedStationIds([]);
            setPerStationExplanation({});
            setTimeout(() => setShowSuccess(false), 5000);
        },
    });

    const handleToggleStation = (stationId: string) => {
        setSelectedStationIds(prev =>
            prev.includes(stationId)
                ? prev.filter(id => id !== stationId)
                : [...prev, stationId]
        );
    };

    const handleExplanationChange = (stationId: string, explanation: string) => {
        setPerStationExplanation(prev => ({
            ...prev,
            [stationId]: explanation
        }));
    };

    if (user?.role !== 'COMPANY_ADMIN') {
        return (
            <div className="p-8 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                <h2 className="text-xl font-bold text-red-600 mt-4">Πρόσβαση Απορρίφθηκε</h2>
                <p className="text-gray-600">Μόνο οι Διαχειριστές Εταιρείας έχουν πρόσβαση σε αυτή τη σελίδα.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Μαζική Προώθηση στο Τελωνείο</h1>
                <p className="text-gray-600">Επιλέξτε περίοδο και υποβολές για προώθηση στις Τελωνειακές Αρχές.</p>
            </div>

            {/* Success Message */}
            {showSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-800">Η προώθηση ολοκληρώθηκε επιτυχώς!</span>
                </div>
            )}

            {/* Period Selection */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">1. Επιλογή Περιόδου</h2>
                <select
                    className="w-full max-w-md border border-gray-300 rounded-md shadow-sm p-3"
                    value={selectedPeriodId}
                    onChange={(e) => {
                        setSelectedPeriodId(e.target.value);
                        setSelectedStationIds([]);
                    }}
                >
                    <option value="">-- Επιλέξτε Περίοδο --</option>
                    {periods.map(period => (
                        <option key={period.id} value={period.id}>
                            {period.month}/{period.year} ({new Date(period.startDate).toLocaleDateString('el-GR')} - {new Date(period.endDate).toLocaleDateString('el-GR')})
                        </option>
                    ))}
                </select>
            </div>

            {/* Mode Selection */}
            {selectedPeriodId && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">2. Τρόπος Προώθησης</h2>
                    <div className="space-y-3">
                        <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${mode === 'ONLY_APPROVED' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <input
                                type="radio"
                                name="forwardMode"
                                value="ONLY_APPROVED"
                                checked={mode === 'ONLY_APPROVED'}
                                onChange={() => setMode('ONLY_APPROVED')}
                                className="mt-1"
                            />
                            <div>
                                <span className="font-medium text-gray-900">Μόνο Εγκεκριμένες</span>
                                <p className="text-sm text-gray-600">Προώθηση μόνο των υποβολών με κατάσταση "Εγκεκριμένη".</p>
                            </div>
                        </label>
                        <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${mode === 'INCLUDE_EDGE_CASES' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <input
                                type="radio"
                                name="forwardMode"
                                value="INCLUDE_EDGE_CASES"
                                checked={mode === 'INCLUDE_EDGE_CASES'}
                                onChange={() => setMode('INCLUDE_EDGE_CASES')}
                                className="mt-1"
                            />
                            <div>
                                <span className="font-medium text-gray-900">Συμπερίληψη Ειδικών Περιπτώσεων</span>
                                <p className="text-sm text-gray-600">Προώθηση εγκεκριμένων + ειδικών περιπτώσεων με υποχρεωτική αιτιολόγηση.</p>
                            </div>
                        </label>
                    </div>
                </div>
            )}

            {/* Submissions List */}
            {selectedPeriodId && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">3. Υποβολές προς Προώθηση</h2>

                    {submissionsLoading ? (
                        <p className="text-gray-500">Φόρτωση...</p>
                    ) : approvedSubmissions.length === 0 && edgeCaseSubmissions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Info className="mx-auto h-8 w-8 mb-2" />
                            <p>Δεν υπάρχουν υποβολές διαθέσιμες για προώθηση.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Approved Submissions */}
                            {approvedSubmissions.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Εγκεκριμένες ({approvedSubmissions.length})
                                    </h3>
                                    <div className="border rounded-lg divide-y">
                                        {approvedSubmissions.map(sub => (
                                            <div key={sub.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                                                <div>
                                                    <span className="font-medium">{sub.station.name}</span>
                                                    <span className="text-gray-500 text-sm ml-2">({sub.station.city})</span>
                                                </div>
                                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                                                    Εγκεκριμένη
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Edge Cases (only show if mode is INCLUDE_EDGE_CASES) */}
                            {mode === 'INCLUDE_EDGE_CASES' && edgeCaseSubmissions.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-amber-700 mb-2 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        Ειδικές Περιπτώσεις ({edgeCaseSubmissions.length})
                                    </h3>
                                    <div className="border border-amber-200 rounded-lg divide-y">
                                        {edgeCaseSubmissions.map(sub => (
                                            <div key={sub.id} className="p-4 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedStationIds.includes(sub.station.id)}
                                                            onChange={() => handleToggleStation(sub.station.id)}
                                                            className="h-4 w-4"
                                                        />
                                                        <div>
                                                            <span className="font-medium">{sub.station.name}</span>
                                                            <span className="text-gray-500 text-sm ml-2">({sub.station.city})</span>
                                                        </div>
                                                    </div>
                                                    <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded">
                                                        {sub.status}
                                                    </span>
                                                </div>
                                                {selectedStationIds.includes(sub.station.id) && (
                                                    <textarea
                                                        className="w-full border border-amber-300 rounded p-2 text-sm"
                                                        placeholder="Αιτιολογία προώθησης (υποχρεωτικό)..."
                                                        value={perStationExplanation[sub.station.id] || ''}
                                                        onChange={(e) => handleExplanationChange(sub.station.id, e.target.value)}
                                                        rows={2}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Submit Button */}
            {selectedPeriodId && (approvedSubmissions.length > 0 || (mode === 'INCLUDE_EDGE_CASES' && selectedStationIds.length > 0)) && (
                <div className="flex justify-end">
                    <button
                        onClick={() => {
                            if (window.confirm('Είστε σίγουροι ότι θέλετε να προωθήσετε τις επιλεγμένες υποβολές στο Τελωνείο;')) {
                                forwardMutation.mutate();
                            }
                        }}
                        disabled={forwardMutation.isPending}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md transition-all disabled:opacity-50"
                    >
                        <Send className="h-5 w-5" />
                        {forwardMutation.isPending ? 'Προώθηση...' : 'Προώθηση στο Τελωνείο'}
                    </button>
                </div>
            )}
        </div>
    );
}
