export type TaskType = 'ACTION' | 'SANCTION';
export type TaskCategory = 'LICENSE' | 'CALIBRATION' | 'IOW_DATA' | 'OTHER';
export type TaskSeverity = 'MINOR' | 'MAJOR' | 'CRITICAL';
export type TaskStatus = 'AWAITING_COMPANY' | 'COMPANY_RESPONDED' | 'IN_REVIEW' | 'CLOSED' | 'ESCALATED';

export interface TaskMessage {
    id: string;
    content: string;
    createdAt: string;
    user: {
        id: string;
        email: string;
        role: string;
    };
    attachments?: {
        name: string;
        url: string;
    }[];
}

export interface Task {
    id: string;
    title: string;
    description: string | null;
    type: TaskType;
    category: TaskCategory;
    severity: TaskSeverity;
    status: TaskStatus;
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;

    // Origin: The submission that caused this task (e.g., failed and rejected)
    originSubmission?: {
        id: string;
        period: string; // e.g., "01/2026"
    };

    // Resolution: The submission that solves this task
    resolutionSubmission?: {
        id: string;
        period: string;
        status: string;
    };

    resolutionNotes?: string;

    station: {
        id: string;
        name: string;
        company: {
            id: string;
            name: string;
        };
    };

    createdBy: {
        id: string;
        email: string;
    };

    assignedTo: {
        id: string;
        email: string;
    } | null;

    messages: TaskMessage[];
}
