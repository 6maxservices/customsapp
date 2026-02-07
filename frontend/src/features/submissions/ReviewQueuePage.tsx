import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

import { ArrowRight } from 'lucide-react';

export default function ReviewQueuePage() {
    const navigate = useNavigate();
    const [periodId, setPeriodId] = useState<string>(''); // Empty = All, or current

    const { data: queue = [], isLoading } = useQuery({
        queryKey: ['review-queue', periodId],
        queryFn: () => api.get('/company/submissions/inbox', { params: { periodId } }).then(res => res.data.submissions)
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUBMITTED': return 'bg-blue-100 text-blue-800';
            case 'UNDER_REVIEW': return 'bg-orange-100 text-orange-800';
            case 'APPROVED': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="w-full space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Submission Review Queue</h1>
                    <p className="text-gray-500">Manage station submissions pending approval</p>
                </div>
                {/* Period Filter (simplified) */}
                <select
                    className="border border-gray-300 rounded-md shadow-sm p-2"
                    value={periodId}
                    onChange={(e) => setPeriodId(e.target.value)}
                >
                    <option value="">All Periods</option>
                    {/* In real app, we'd list periods dynamically */}
                </select>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr><td colSpan={6} className="text-center py-4">Loading queue...</td></tr>
                        ) : queue.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-8 text-gray-500">No submissions found in queue.</td></tr>
                        ) : (
                            queue.map((item: any) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{item.station.name}</div>
                                        <div className="text-xs text-gray-500">{item.station.city}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.period?.month}/{item.period?.year}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.submittedBy?.email || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(item.submittedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => navigate(`/submissions/${item.id}`)}
                                            className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end gap-1 ml-auto"
                                        >
                                            Review <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
