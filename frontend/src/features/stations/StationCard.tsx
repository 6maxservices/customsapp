import { Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, MapPin, ChevronRight, Trash2, Ban } from 'lucide-react';
import { Station } from './types';

interface StationCardProps {
    station: Station;
    onSelect?: (id: string, selected: boolean) => void;
    onDelete?: (id: string) => void;
    selected?: boolean;
}

export default function StationCard({ station, onSelect, onDelete, selected }: StationCardProps) {
    const isCompliant = station.compliance?.status === 'COMPLIANT';
    const isDisabled = !station.isActive;

    // Report says: "Card remains red even if data is correct".
    // This implies isCompliant might be calculated incorrectly or missing.
    // For now, we trust the backend's `compliance.status`.

    // Status Color: Disabled = Gray, Compliant = Green, Non-Compliant = Red
    const statusColor = isDisabled ? 'bg-gray-400' : (isCompliant ? 'bg-green-500' : 'bg-red-500');
    const borderColor = selected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200';

    return (
        <div className={`bg-white rounded-lg shadow-sm border ${borderColor} hover:shadow-md transition-shadow relative overflow-hidden group`}>
            {/* Selection Checkbox Overlay */}
            {onSelect && (
                <div className="absolute top-3 left-3 z-10">
                    <input
                        type="checkbox"
                        checked={selected}
                        onChange={(e) => onSelect(station.id, e.target.checked)}
                        className="h-4 w-4 cursor-pointer text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                </div>
            )}

            {/* List View Delete Action (Top Right) */}
            {onDelete && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        if (confirm('Are you sure you want to delete this station?')) onDelete(station.id);
                    }}
                    className="absolute top-3 right-3 z-10 p-1.5 bg-white/80 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Station"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            )}

            {/* Status Stripe */}
            <div className={`h-1.5 w-full ${statusColor}`} />

            <div className="p-5">
                <div className="flex justify-between items-start mb-2 pl-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className={`text-lg font-semibold line-clamp-1 ${isDisabled ? 'text-gray-500 line-through' : 'text-gray-900'}`} title={station.name}>
                                {station.name}
                            </h3>
                            {isDisabled && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                                    <Ban className="w-3 h-3 mr-1" /> kw
                                    Disabled
                                </span>
                            )}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            <span className="line-clamp-1">{station.address || 'No address'}</span>
                        </div>
                    </div>

                    {!isDisabled && (
                        <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${isCompliant ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                            {isCompliant ? <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> : <AlertCircle className="h-3.5 w-3.5 mr-1.5" />}
                            {isCompliant ? 'Compliant' : 'Non-Compliant'}
                        </div>
                    )}
                </div>

                {/* Badges / Issues */}
                {!isDisabled && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {station.compliance?.badges?.map((badge: string) => (
                            <span key={badge} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                                {badge === 'PENDING_REPORT' ? 'Pending Report' : badge}
                            </span>
                        ))}

                        {!isCompliant && (station.compliance?.violations?.length ?? 0) > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-100" title={station.compliance?.violations?.join('\n')}>
                                {station.compliance?.violations?.length} Violation{station.compliance?.violations?.length !== 1 ? 's' : ''}
                            </span>
                        )}

                        {/* Legacy Task Count Fallback */}
                        {(!station.compliance && (station._count?.tasks || 0) > 0) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                {station._count!.tasks} Tasks
                            </span>
                        )}
                    </div>
                )}
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
