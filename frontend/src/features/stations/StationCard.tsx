import { Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, MapPin, ChevronRight } from 'lucide-react';

interface StationCardProps {
    station: any;
    onSelect?: (id: string, selected: boolean) => void;
    selected?: boolean;
}

export default function StationCard({ station, onSelect, selected }: StationCardProps) {
    const isCompliant = station.compliance?.status === 'COMPLIANT';

    return (
        <div className={`bg-white rounded-lg shadow-sm border ${selected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'} hover:shadow-md transition-shadow relative overflow-hidden group`}>
            {/* Selection Checkbox Overlay */}
            {onSelect && (
                <div className="absolute top-3 left-3 z-10">
                    <input
                        type="checkbox"
                        checked={selected}
                        onChange={(e) => onSelect(station.id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                </div>
            )}

            {/* Status Stripe */}
            <div className={`h-1.5 w-full ${isCompliant ? 'bg-green-500' : 'bg-red-500'}`} />

            <div className="p-5">
                <div className="flex justify-between items-start mb-2 pl-6"> {/* padding left for checkbox */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1" title={station.name}>
                            {station.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            <span className="line-clamp-1">{station.address || 'No address'}</span>
                        </div>
                    </div>

                    <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${isCompliant ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                        {isCompliant ? <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> : <AlertCircle className="h-3.5 w-3.5 mr-1.5" />}
                        {isCompliant ? 'Compliant' : 'Non-Compliant'}
                    </div>
                </div>

                {/* Badges / Issues */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {station.compliance?.badges?.map((badge: string) => (
                        <span key={badge} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                            {badge === 'PENDING_REPORT' ? 'Pending Report' : badge}
                        </span>
                    ))}

                    {!isCompliant && station.compliance?.violations?.length > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-100" title={station.compliance.violations.join('\n')}>
                            {station.compliance.violations.length} Violation{station.compliance.violations.length !== 1 ? 's' : ''}
                        </span>
                    )}

                    {/* Legacy Task Count Fallback */}
                    {(!station.compliance && station._count?.tasks > 0) && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                            {station._count.tasks} Tasks
                        </span>
                    )}
                </div>

                {/* Mini Sparkline (Simulated for generic view) */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Recent History</span>
                        <span>Last 6 Periods</span>
                    </div>
                    <div className="flex gap-1 h-3">
                        {[...Array(6)].map((_, i) => {
                            // Simulate generic history based on current status for now
                            // Ideally this comes from the backend in the future
                            const isOk = isCompliant ? i !== 4 : i < 2;
                            return (
                                <div
                                    key={i}
                                    className={`flex-1 rounded-sm ${isOk ? 'bg-green-200' : 'bg-red-200'}`}
                                    title={isOk ? 'Compliant' : 'Issue Detected'}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center group-hover:bg-blue-50 transition-colors">
                <span className="text-xs text-gray-500 font-mono">
                    {station.amdika || 'NO-ID'}
                </span>
                <Link
                    to={`/stations/${station.slug || station.id}`}
                    className="text-sm font-medium text-blue-600 flex items-center hover:underline"
                >
                    View Details <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
            </div>
        </div>
    );
}
