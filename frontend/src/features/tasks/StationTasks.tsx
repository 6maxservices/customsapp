import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    User,
    MessageSquare,
    Send
} from 'lucide-react';
import api from '../../lib/api';
import { Button } from '../../components/ui/button';
import { useAuth } from '../auth/AuthContext';

interface TaskMessage {
    id: string;
    content: string;
    createdAt: string;
    user: {
        id: string;
        email: string;
        name?: string;
    };
}

interface Task {
    id: string;
    title: string;
    description: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'AWAITING_COMPANY' | 'ESCALATED' | 'CLOSED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    dueDate?: string;
    assignedTo?: {
        id: string;
        email: string;
        name: string;
    };
    obligation?: {
        title: string;
        code: string;
    };
    messages?: TaskMessage[];
    stationId: string;
    station?: {
        companyId: string;
    };
    createdAt: string;
}

export default function StationTasks() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState<string>('');

    const isCustoms = user?.role.startsWith('CUSTOMS_') || user?.role === 'SYSTEM_ADMIN';
    const isCompany = user?.role.includes('COMPANY') && !user?.stationId;

    const { data: tasks, isLoading } = useQuery<Task[]>({
        queryKey: ['tasks'],
        queryFn: async () => {
            const res = await api.get('/tasks');
            return res.data.tasks;
        }
    });

    const updateTaskMutation = useMutation({
        mutationFn: async ({ id, status, assignedToId }: { id: string, status?: string, assignedToId?: string }) => {
            await api.put(`/tasks/${id}`, { status, assignedToId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            alert('Task updated successfully');
        }
    });

    const addMessageMutation = useMutation({
        mutationFn: async ({ taskId, content }: { taskId: string, content: string }) => {
            await api.post(`/tasks/${taskId}/messages`, { content });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            setReplyText('');
        }
    });

    const handleDelegate = (taskId: string) => {
        const email = prompt("Enter user email to delegate to:");
        if (email) {
            alert(`Delegation of ticket ${taskId} to ${email} initiated. (Backend logic requires User ID)`);
        }
    };

    const handleMarkResolved = (taskId: string) => {
        if (window.confirm('Are you sure you want to resolve/close this ticket?')) {
            updateTaskMutation.mutate({ id: taskId, status: 'CLOSED' });
        }
    };

    const handleSendReply = (taskId: string) => {
        if (!replyText.trim()) return;
        addMessageMutation.mutate({ taskId, content: replyText });
    };

    const filteredTasks = tasks?.filter(task => {
        if (filterStatus === 'ALL') return task.status !== 'CLOSED';
        if (filterStatus === 'RESOLVED_ALL') return true;
        return task.status === filterStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CLOSED':
            case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-200';
            case 'ESCALATED': return 'bg-red-100 text-red-800 border-red-200';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'AWAITING_COMPANY': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/dashboard')} className="p-2">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Support Tickets & Tasks</h1>
                        <p className="text-gray-500 text-sm">Manage compliance issues and communication.</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <select
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="ALL">Open Tickets</option>
                        <option value="RESOLVED_ALL">All History</option>
                        <option value="ESCALATED">Escalated</option>
                        <option value="AWAITING_COMPANY">Awaiting Company</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-12">Loading tickets...</div>
            ) : !filteredTasks || filteredTasks.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">All Clear!</h3>
                    <p className="text-gray-500">No open tickets found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredTasks.map((task) => (
                        <div key={task.id} className="bg-white border border-gray-200 rounded-lg shadow-sm transition-shadow hover:shadow-md">
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(task.status)}`}>
                                                {task.status.replace('_', ' ')}
                                            </span>
                                            <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                                        </div>
                                        <p className="text-gray-600 max-w-3xl">{task.description}</p>

                                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-4">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Created: {new Date(task.createdAt).toLocaleDateString()}
                                            </div>
                                            {task.assignedTo && (
                                                <div className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    Assigned: {task.assignedTo.name || task.assignedTo.email}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 min-w-[140px] ml-6">
                                        {(isCustoms || isCompany) && task.status !== 'CLOSED' && (
                                            <Button variant="outline" size="sm" onClick={() => handleDelegate(task.id)}>
                                                <User className="w-4 h-4 mr-2" /> Delegate
                                            </Button>
                                        )}
                                        {isCustoms && task.status !== 'CLOSED' && (
                                            <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleMarkResolved(task.id)}>
                                                <CheckCircle className="w-4 h-4 mr-2" /> Resolve
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full justify-between"
                                            onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                                        >
                                            {expandedTaskId === task.id ? 'Hide Details' : 'View Messages'}
                                            <MessageSquare className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Details / Messages */}
                            {expandedTaskId === task.id && (
                                <div className="border-t border-gray-100 bg-gray-50 p-6 space-y-4">
                                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" /> Message History
                                    </h4>

                                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                        {task.messages?.length ? task.messages.map((msg) => (
                                            <div key={msg.id} className={`flex flex-col ${msg.user.id === user?.id ? 'items-end' : 'items-start'}`}>
                                                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.user.id === user?.id ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                                                    {msg.content}
                                                </div>
                                                <span className="text-[10px] text-gray-400 mt-1 uppercase">
                                                    {msg.user.name || msg.user.email} • {new Date(msg.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                        )) : (
                                            <p className="text-sm text-gray-500 italic">No messages yet.</p>
                                        )}
                                    </div>

                                    {task.status !== 'CLOSED' && (
                                        <div className="flex gap-2 pt-2">
                                            <input
                                                type="text"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Type your reply..."
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSendReply(task.id)}
                                            />
                                            <Button size="sm" onClick={() => handleSendReply(task.id)}>
                                                <Send className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
