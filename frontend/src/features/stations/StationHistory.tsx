import { History, User, Calendar, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import api from '../../lib/api';
import { formatDateGreek } from '../../lib/translations';

interface AuditLog {
    id: string;
    action: string;
    actor: {
        email: string;
    };
    timestamp: string;
    diff: any;
}

export default function StationHistory() {
    const { id: stationId } = useParams<{ id: string }>();

    const { data: logs, isLoading } = useQuery<AuditLog[]>({
        queryKey: ['audit', 'station', stationId],
        queryFn: () => api.get(`/audit/entity/Station/${stationId}`).then(res => res.data.logs),
        enabled: !!stationId
    });

    const getActionLabel = (action: string) => {
        switch (action) {
            case 'CREATE': return 'ΔΗΜΙΟΥΡΓΙΑ ΠΡΑΤΗΡΙΟΥ';
            case 'UPDATE': return 'ΕΝΗΜΕΡΩΣΗ ΣΤΟΙΧΕΙΩΝ';
            case 'DELETE': return 'ΔΙΑΓΡΑΦΗ ΠΡΑΤΗΡΙΟΥ';
            default: return action;
        }
    };

    const formatDiff = (diff: any) => {
        if (!diff) return 'No details';
        return Object.entries(diff)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
    };

    if (isLoading) {
        return <div className="p-4 text-center text-gray-500">Loading history...</div>;
    }

    if (!logs || logs.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Ιστορικό Αλλαγών
                    </h2>
                </div>
                <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>Δεν βρέθηκε ιστορικό αλλαγών.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Ιστορικό Αλλαγών
                </h2>
            </div>

            <div className="relative border-l border-gray-200 ml-3 space-y-6">
                {logs.map((log) => (
                    <div key={log.id} className="mb-8 ml-6 relative">
                        <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-9 ring-8 ring-white">
                            <Calendar className="w-3 h-3 text-blue-800" />
                        </span>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div>
                                <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900">
                                    {getActionLabel(log.action)}
                                </h3>
                                <p className="mb-2 text-base font-normal text-gray-500">
                                    {formatDiff(log.diff)}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <User className="h-4 w-4" />
                                    {log.actor.email}
                                </div>
                            </div>
                            <time className="block mb-2 text-sm font-normal leading-none text-gray-400 sm:mb-0 mt-2 sm:mt-0">
                                {formatDateGreek(log.timestamp)}
                            </time>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
