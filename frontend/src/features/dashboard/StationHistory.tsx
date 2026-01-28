import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    Filter
} from 'lucide-react';
import api from '../../lib/api';
import { Button } from '../../components/ui/button';

interface Submission {
    id: string;
    status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
    checks: Record<string, any>; // or array depending on DTO, but usually raw here? Wait, getAllSubmissions returns checks?
    // Let's check the API response for /submissions
    // It returns: include: { period: true, station: true, ... }
    period: {
        start: string;
        end: string;
        deadline: string;
        periodNumber: number;
        month: number;
        year: number;
    };
    submittedAt?: string;
    createdAt: string;
    station: {
        name: string;
    };
}

export default function StationHistory() {
    const navigate = useNavigate();
    const [filterStatus, setFilterStatus] = useState<string>('ALL');

    const { data: submissions, isLoading } = useQuery<Submission[]>({
        queryKey: ['submissions'],
        queryFn: async () => {
            const res = await api.get('/submissions');
            return res.data.submissions;
        }
    });

    const filteredSubmissions = submissions?.filter(sub => {
        if (filterStatus === 'ALL') return true;
        return sub.status === filterStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
            case 'SUBMITTED': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle className="w-4 h-4 mr-1" />;
            case 'REJECTED': return <XCircle className="w-4 h-4 mr-1" />;
            case 'SUBMITTED':
            case 'UNDER_REVIEW': return <Clock className="w-4 h-4 mr-1" />;
            default: return <FileText className="w-4 h-4 mr-1" />;
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/dashboard')} className="p-2">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Submission History</h1>
                        <p className="text-gray-500 text-sm">View past submissions and their status.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <select
                            className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="APPROVED">Approved</option>
                            <option value="SUBMITTED">Submitted</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="DRAFT">Draft</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="text-center py-12">Loading history...</div>
            ) : !filteredSubmissions || filteredSubmissions.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No submissions found</h3>
                    <p className="text-gray-500">You haven't submitted anything yet.</p>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredSubmissions.map((sub) => (
                                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {new Date(sub.period.start).toLocaleDateString()} — {new Date(sub.period.end).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Period #{sub.period.periodNumber}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(sub.status)}`}>
                                            {getStatusIcon(sub.status)}
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Button variant="ghost" className="text-blue-600 hover:text-blue-900" onClick={() => alert('View details coming soon')}>
                                            View
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
