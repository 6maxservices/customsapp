import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { formatDateGreek } from '../../lib/translations';
import { StatusBadge, SeverityBadge, TypeBadge } from './components/TaskBadges';
import { Task } from './types';
import { AlertCircle, CheckCircle, Clock, Filter, Plus } from 'lucide-react';

export default function TasksQueuePage() {
    const [filter, setFilter] = useState<'ALL' | 'ACTION_REQUIRED' | 'IN_REVIEW' | 'OVERDUE'>('ACTION_REQUIRED');
    const [searchTerm, setSearchTerm] = useState('');

    // Mock fetching with improved types
    const { data: tasks = [], isLoading } = useQuery({
        queryKey: ['tasks', 'queue', filter],
        queryFn: () => api.get('/tasks').then((res) => {
            // Ensuring we safely map the backend response to our new detailed Task type
            // In a real scenario, the backend would return this shape.
            // For now, we trust the existing mock/backend or would map it here.
            return res.data.tasks as Task[];
        }),
    });

    const filteredTasks = tasks.filter((t) => {
        // Client-side filtering simulation if backend doesn't support all filters yet
        const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.station.name.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (filter === 'ACTION_REQUIRED') return t.status === 'COMPANY_RESPONDED';
        if (filter === 'IN_REVIEW') return t.status === 'IN_REVIEW';
        // Simple mock for overdue - would normally be a date comparison
        if (filter === 'OVERDUE') return new Date(t.dueDate || '') < new Date() && t.status !== 'CLOSED';

        return true;
    });

    const stats = {
        actionRequired: tasks.filter(t => t.status === 'COMPANY_RESPONDED').length,
        inReview: tasks.filter(t => t.status === 'IN_REVIEW').length,
        overdue: tasks.filter(t => new Date(t.dueDate || '') < new Date() && t.status !== 'CLOSED').length
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Actions & Sanctions Queue</h1>
                    <p className="text-sm text-gray-500">Manage enforcement actions and compliance tickets</p>
                </div>
                <Link
                    to="/tasks/new"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm font-medium text-sm transition-colors"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Action
                </Link>
            </div>

            {/* Stats / Queue Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button
                    onClick={() => setFilter('ACTION_REQUIRED')}
                    className={`p-4 rounded-lg border text-left transition-all ${filter === 'ACTION_REQUIRED' ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                >
                    <div className="flex justify-between items-start">
                        <div className={`p-2 rounded-md ${filter === 'ACTION_REQUIRED' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">{stats.actionRequired}</span>
                    </div>
                    <p className={`mt-2 text-sm font-medium ${filter === 'ACTION_REQUIRED' ? 'text-blue-900' : 'text-gray-600'}`}>Action Required</p>
                    <p className="text-xs text-gray-500">Company responded</p>
                </button>

                <button
                    onClick={() => setFilter('IN_REVIEW')}
                    className={`p-4 rounded-lg border text-left transition-all ${filter === 'IN_REVIEW' ? 'bg-purple-50 border-purple-200 ring-1 ring-purple-300' : 'bg-white border-gray-200 hover:border-purple-300'}`}
                >
                    <div className="flex justify-between items-start">
                        <div className={`p-2 rounded-md ${filter === 'IN_REVIEW' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                            <Clock className="h-5 w-5" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">{stats.inReview}</span>
                    </div>
                    <p className={`mt-2 text-sm font-medium ${filter === 'IN_REVIEW' ? 'text-purple-900' : 'text-gray-600'}`}>In Review</p>
                    <p className="text-xs text-gray-500">Processing evidence</p>
                </button>

                <button
                    onClick={() => setFilter('OVERDUE')}
                    className={`p-4 rounded-lg border text-left transition-all ${filter === 'OVERDUE' ? 'bg-red-50 border-red-200 ring-1 ring-red-300' : 'bg-white border-gray-200 hover:border-red-300'}`}
                >
                    <div className="flex justify-between items-start">
                        <div className={`p-2 rounded-md ${filter === 'OVERDUE' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">{stats.overdue}</span>
                    </div>
                    <p className={`mt-2 text-sm font-medium ${filter === 'OVERDUE' ? 'text-red-900' : 'text-gray-600'}`}>Overdue</p>
                    <p className="text-xs text-gray-500">Deadline missed</p>
                </button>

                <button
                    onClick={() => setFilter('ALL')}
                    className={`p-4 rounded-lg border text-left transition-all ${filter === 'ALL' ? 'bg-gray-50 border-gray-300 ring-1 ring-gray-300' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                >
                    <div className="flex justify-between items-start">
                        <div className={`p-2 rounded-md ${filter === 'ALL' ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-500'}`}>
                            <Filter className="h-5 w-5" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">{tasks.length}</span>
                    </div>
                    <p className={`mt-2 text-sm font-medium ${filter === 'ALL' ? 'text-gray-900' : 'text-gray-600'}`}>All Tickets</p>
                    <p className="text-xs text-gray-500">Searchable archive</p>
                </button>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-gray-900">
                        {filter === 'ALL' ? 'All Tickets' : filter === 'ACTION_REQUIRED' ? 'Requires Attention' : filter === 'IN_REVIEW' ? 'Under Review' : 'Overdue Items'}
                    </h3>
                    <input
                        type="text"
                        placeholder="Search station, ticket ID..."
                        className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref ID / Title</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station & Company</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type / Severity</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTasks.length > 0 ? filteredTasks.map((task) => (
                            <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <Link to={`/tasks/${task.id}`} className="block">
                                        <span className="text-xs text-gray-500 font-mono block mb-1">#{task.id.slice(0, 8)}</span>
                                        <span className="text-sm font-medium text-blue-600 hover:text-blue-800">{task.title}</span>
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{task.station?.name || 'Unknown Station'}</div>
                                    <div className="text-xs text-gray-500">{task.station?.company?.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col gap-1 items-start">
                                        <TypeBadge type={task.type || 'ACTION'} />
                                        <SeverityBadge severity={task.severity || 'MAJOR'} />
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={task.status as any} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {task.dueDate ? formatDateGreek(task.dueDate) : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {task.originSubmission ? (
                                        <Link to={`/submissions/${task.originSubmission.id}`} className="text-blue-600 hover:underline">
                                            Submission {task.originSubmission.period} (Rejected)
                                        </Link>
                                    ) : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/tasks/${task.id}`} className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded hover:bg-blue-100 transition-colors">
                                        Process
                                    </Link>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <CheckCircle className="h-10 w-10 text-gray-300 mb-2" />
                                        <p>No tickets found in this queue.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
