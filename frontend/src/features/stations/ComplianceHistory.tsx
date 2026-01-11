import { FileText, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDateGreek, translateSubmissionStatus } from '../../lib/translations';

interface Period {
    startDate: string;
    endDate: string;
    year: number;
    month: number;
    periodNumber: number;
}

interface Submission {
    id: string;
    status: string;
    submittedAt: string | null;
    period: Period;
}

interface ComplianceHistoryProps {
    submissions: Submission[];
}

export default function ComplianceHistory({ submissions }: ComplianceHistoryProps) {
    if (!submissions || submissions.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-gray-400" />
                    Submission History
                </h2>
                <p className="text-center py-8 text-gray-500 italic">No historical submissions found.</p>
            </div>
        );
    }

    // Sort by date desc
    const sortedSubmissions = [...submissions].sort((a, b) =>
        new Date(b.period.startDate).getTime() - new Date(a.period.startDate).getTime()
    );

    return (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                <Clock className="h-5 w-5 text-blue-600" />
                Submission History (Snapshots)
            </h2>

            <div className="space-y-4">
                {sortedSubmissions.map((sub) => (
                    <Link
                        key={sub.id}
                        to={`/submissions/${sub.id}`}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="h-5 w-5 text-blue-700" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">
                                    {formatDateGreek(sub.period.startDate)} - {formatDateGreek(sub.period.endDate)}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                    <Calendar className="h-3 w-3" />
                                    Period {sub.period.periodNumber}, {sub.period.year}
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${sub.status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-800' :
                                sub.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-200 text-gray-700'
                                }`}>
                                {translateSubmissionStatus(sub.status)}
                            </span>
                            {sub.submittedAt && (
                                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tight">
                                    Submitted {formatDateGreek(sub.submittedAt)}
                                </p>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
