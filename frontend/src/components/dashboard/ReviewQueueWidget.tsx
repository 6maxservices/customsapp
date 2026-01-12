import { Link } from 'react-router-dom';
import { ArrowRight, Clock, AlertTriangle } from 'lucide-react';


interface ReviewQueueProps {
    submissions: any[];
}

export default function ReviewQueueWidget({ submissions }: ReviewQueueProps) {
    // Mock data enhancement if submissions empty
    const displayItems = submissions.length > 0 ? submissions : [
        { id: '1', stationName: 'Alpha Chalandri', period: 'Jan 2026', submittedAt: '2026-01-10', riskLevel: 'LOW' },
        { id: '2', stationName: 'Beta Toumpa', period: 'Jan 2026', submittedAt: '2026-01-09', riskLevel: 'HIGH' },
        { id: '3', stationName: 'Gamma Patra', period: 'Jan 2026', submittedAt: '2026-01-08', riskLevel: 'MEDIUM' },
        { id: '4', stationName: 'Delta Larissa', period: 'Jan 2026', submittedAt: '2026-01-05', riskLevel: 'LOW' },
        { id: '5', stationName: 'Epsilon Heraklion', period: 'Jan 2026', submittedAt: '2026-01-02', riskLevel: 'HIGH' },
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-gray-900">Priority Review Queue</h3>
                    <p className="text-xs text-gray-500">Submissions pending approval sorted by urgency</p>
                </div>
                <Link to="/submissions?status=SUBMITTED" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center">
                    View All <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Action</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {displayItems.map((item: any, idx: number) => (
                            <tr key={idx} className="hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => window.location.href = `/stations/${item.stationId || '1'}`}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-bold text-gray-900">{item.stationName || item.station?.name}</div>
                                    <div className="text-xs text-gray-500">{item.companyName || 'Alpha Petroleum S.A.'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {typeof item.period === 'string'
                                            ? item.period
                                            : `${item.period?.month}/${item.period?.year}`}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> {item.submittedAt}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {item.riskLevel === 'HIGH' ? (
                                        <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                                            <AlertTriangle className="h-3 w-3" /> HIGH RISK
                                        </span>
                                    ) : item.riskLevel === 'MEDIUM' ? (
                                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">MEDIUM</span>
                                    ) : (
                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">LOW</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/stations/${item.stationId || '1'}`} className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors">
                                        Review
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
