import { User, FileText, AlertTriangle, Edit } from 'lucide-react';

interface ActivityItem {
    id: string;
    type: 'SUBMISSION' | 'LOGIN' | 'EDIT' | 'ALERT';
    message: string;
    timestamp: string;
    user: string;
}

// Mock Data for now - eventually will fetch from Audit Log API
const MOCK_ACTIVITY: ActivityItem[] = [
    { id: '1', type: 'SUBMISSION', message: 'Submitted compliance report for Alpha Peiraias', timestamp: '10 mins ago', user: 'Admin User' },
    { id: '2', type: 'LOGIN', message: 'User login detected', timestamp: '22 mins ago', user: 'Admin User' },
    { id: '3', type: 'EDIT', message: 'Updated station details for Beta Toumpa', timestamp: '1 hour ago', user: 'Manager' },
    { id: '4', type: 'ALERT', message: 'Compliance violation at Alpha Nea Smyrni', timestamp: '5 hours ago', user: 'System' },
    { id: '5', type: 'SUBMISSION', message: 'Draft saved for Beta Thermi', timestamp: 'Yesterday', user: 'Operator Y' },
    { id: '6', type: 'LOGIN', message: 'User login detected', timestamp: 'Yesterday', user: 'Operator X' },
];

const ICONS = {
    SUBMISSION: <FileText className="h-4 w-4 text-blue-500" />,
    LOGIN: <User className="h-4 w-4 text-gray-500" />,
    EDIT: <Edit className="h-4 w-4 text-orange-500" />,
    ALERT: <AlertTriangle className="h-4 w-4 text-red-500" />,
};

export default function ActivityFeed() {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {MOCK_ACTIVITY.map((item) => (
                    <div key={item.id} className="flex gap-3 text-sm">
                        <div className="mt-0.5 flex-shrink-0 bg-gray-50 p-1.5 rounded-full">
                            {ICONS[item.type]}
                        </div>
                        <div>
                            <p className="text-gray-900 font-medium">
                                {item.message}
                            </p>
                            <p className="text-gray-500 text-xs mt-0.5">
                                {item.user} • {item.timestamp}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
