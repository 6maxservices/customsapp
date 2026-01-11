import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface Task {
    id: string;
    title: string;
    stationName: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

const MOCK_TASKS: Task[] = [
    { id: '1', title: 'Pending Station Audit', stationName: 'Alpha Peiraias', priority: 'HIGH' },
    { id: '2', title: 'Verify Certificate Expiry', stationName: 'Beta Toumpa', priority: 'MEDIUM' },
    { id: '3', title: 'Update Contact Info', stationName: 'Alpha Glyfada', priority: 'LOW' },
];

export default function TaskListWidget() {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <Link to="/tasks" className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    Pending Actions
                </Link>
                <Link to="/tasks" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center">
                    View All <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {MOCK_TASKS.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                        <CheckCircle className="h-8 w-8 mb-2 text-gray-200" />
                        No pending tasks
                    </div>
                ) : (
                    <div className="space-y-1">
                        {MOCK_TASKS.map((task) => (
                            <div key={task.id} className="p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100 group">
                                <div className="flex justify-between items-start mb-1">
                                    <span
                                        title="Estimated Priority based on deadline"
                                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${task.priority === 'HIGH' ? 'bg-red-50 text-red-600 border-red-100' :
                                            task.priority === 'MEDIUM' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                'bg-blue-50 text-blue-600 border-blue-100'
                                            }`}>
                                        {task.priority}
                                    </span>
                                </div>
                                <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {task.title}
                                </h4>
                                <p className="text-xs text-gray-500 mt-0.5 truncate">
                                    {task.stationName}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
