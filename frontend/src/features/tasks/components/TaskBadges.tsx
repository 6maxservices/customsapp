import { TaskStatus, TaskSeverity, TaskType } from '../types';


export const StatusBadge = ({ status }: { status: TaskStatus }) => {
    const styles = {
        AWAITING_COMPANY: 'bg-orange-100 text-orange-800 border-orange-200',
        COMPANY_RESPONDED: 'bg-blue-100 text-blue-800 border-blue-200',
        IN_REVIEW: 'bg-purple-100 text-purple-800 border-purple-200',
        CLOSED: 'bg-green-100 text-green-800 border-green-200',
        ESCALATED: 'bg-red-100 text-red-800 border-red-200',
    };

    const labels = {
        AWAITING_COMPANY: 'Awaiting Company',
        COMPANY_RESPONDED: 'Action Taken',
        IN_REVIEW: 'In Review',
        CLOSED: 'Closed',
        ESCALATED: 'Escalated',
    };

    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}>
            {labels[status]}
        </span>
    );
};

export const SeverityBadge = ({ severity }: { severity: TaskSeverity }) => {
    const styles = {
        MINOR: 'text-gray-600 bg-gray-100',
        MAJOR: 'text-orange-700 bg-orange-50 ring-1 ring-orange-200',
        CRITICAL: 'text-red-700 bg-red-50 ring-1 ring-red-200',
    };

    return (
        <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase tracking-wider ${styles[severity]}`}>
            {severity}
        </span>
    );
};

export const TypeBadge = ({ type }: { type: TaskType }) => {
    return type === 'SANCTION' ? (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
            SANCTION
        </span>
    ) : (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            ACTION
        </span>
    );
};
