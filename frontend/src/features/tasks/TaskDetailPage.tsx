import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../lib/api';
import { useAuth } from '../auth/AuthContext';
import { CheckCircle, MessageSquare, AlertOctagon, FileText, ChevronRight, User, ArrowUpRight } from 'lucide-react';
import { formatDateGreek, formatDateTimeGreek } from '../../lib/translations';
import { Task } from './types';
import { StatusBadge, SeverityBadge, TypeBadge } from './components/TaskBadges';

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const isCustomsUser = user?.role.startsWith('CUSTOMS_') || user?.role === 'SYSTEM_ADMIN';

  // Fetch task
  const { data: task, isLoading: taskLoading } = useQuery<Task>({
    queryKey: ['task', id],
    queryFn: () => api.get(`/tasks/${id}`).then((res) => {
      // Cast or transform backend response to new Task type
      return res.data.task as Task;
    }),
  });

  const addMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      // In a real app we'd handle attachments here too
      return api.post(`/tasks/${id}/messages`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      setReplyContent('');
      setIsReplying(false);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      return api.put(`/tasks/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
    },
  });

  const handleReply = () => {
    if (replyContent.trim()) {
      addMessageMutation.mutate(replyContent.trim());
    }
  };

  const handleStatusChange = (status: string) => {
    updateStatusMutation.mutate(status);
  };

  if (taskLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket Not Found</h2>
          <Link to="/tasks" className="text-blue-600 hover:underline">
            Back to Queue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb & Header */}
      <div>
        <nav className="flex items-center text-sm text-gray-500 mb-4">
          <Link to="/tasks" className="hover:text-blue-600">Tasks</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="font-medium text-gray-900">#{task.id.slice(0, 8)}</span>
        </nav>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <TypeBadge type={task.type} />
                <SeverityBadge severity={task.severity} />
                <StatusBadge status={task.status} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {task.station?.name} ({task.station?.company?.name})
                </span>
                <span>•</span>
                <span>Created {formatDateGreek(task.createdAt)}</span>
                {task.dueDate && (
                  <>
                    <span>•</span>
                    <span className="text-red-600 font-medium">Due {formatDateGreek(task.dueDate)}</span>
                  </>
                )}
              </div>
            </div>

            {/* Primary Actions */}
            <div className="flex items-center gap-3">
              {/* CUSTOMS ACTIONS */}
              {isCustomsUser && task.status !== 'CLOSED' && (
                <>
                  {task.status !== 'IN_REVIEW' && (
                    <button
                      onClick={() => handleStatusChange('IN_REVIEW')}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 shadow-sm"
                    >
                      Review
                    </button>
                  )}
                  <button
                    onClick={() => handleStatusChange('CLOSED')}
                    className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 shadow-sm flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Close Ticket
                  </button>
                </>
              )}

              {/* COMPANY ACTIONS */}
              {!isCustomsUser && task.status === 'AWAITING_COMPANY' && (
                <button
                  onClick={() => handleStatusChange('COMPANY_RESPONDED')}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 shadow-sm flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark Action Complete
                </button>
              )}
            </div>
          </div>

          {task.description && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Description / Requirement</h3>
              <div className="prose prose-sm text-gray-600 bg-gray-50 p-4 rounded-md border border-gray-100">
                {task.description}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: THREAD */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-gray-400" />
                Activity Log & Messages
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {task.messages?.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.user.role.startsWith('CUSTOMS') ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.user.role.startsWith('CUSTOMS') ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                    <User className="h-4 w-4" />
                  </div>
                  <div className={`flex-1 max-w-[80%] rounded-lg p-4 ${msg.user.role.startsWith('CUSTOMS') ? 'bg-blue-50 text-blue-900' : 'bg-gray-50 text-gray-900'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold">{msg.user.email}</span>
                      <span className="text-xs opacity-70">{formatDateTimeGreek(msg.createdAt)}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}

              {(!task.messages || task.messages.length === 0) && (
                <p className="text-center text-gray-500 italic py-4">No commands or messages in this thread yet.</p>
              )}
            </div>

            {/* Reply Area */}
            {task.status !== 'CLOSED' && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                {isReplying ? (
                  <div className="space-y-3">
                    <textarea
                      rows={3}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Type your response..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsReplying(false)}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReply}
                        disabled={!replyContent.trim()}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Send Message
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsReplying(true)}
                    className="w-full py-2 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
                  >
                    Reply to Thread
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: SUBMISSIONS & CONTEXT */}
        <div className="space-y-6">
          {/* Origin Submission */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 text-red-500" />
              Originating Verification
            </h3>
            {task.originSubmission ? (
              <div className="bg-red-50 rounded-md p-3 border border-red-100">
                <p className="text-sm font-medium text-red-900">Rejected Submission</p>
                <p className="text-xs text-red-700 mt-1">Period: {task.originSubmission.period}</p>
                <Link
                  to={`/submissions/${task.originSubmission.id}`}
                  className="mt-2 inline-flex items-center text-xs font-medium text-red-700 hover:text-red-900 underline"
                >
                  View Submission <ArrowUpRight className="h-3 w-3 ml-1" />
                </Link>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No origin submission linked.</p>
            )}
          </div>

          {/* Resolution Submission */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-600" />
              Remediation Proof
            </h3>

            {task.resolutionSubmission ? (
              <div className="bg-green-50 rounded-md p-3 border border-green-100">
                <p className="text-sm font-medium text-green-900">New Submission Linked</p>
                <p className="text-xs text-green-700 mt-1">Status: {task.resolutionSubmission.status}</p>
                <Link
                  to={`/submissions/${task.resolutionSubmission.id}`}
                  className="mt-2 inline-flex items-center text-xs font-medium text-green-700 hover:text-green-900 underline"
                >
                  View Proof <ArrowUpRight className="h-3 w-3 ml-1" />
                </Link>
              </div>
            ) : (
              <div className="text-center py-4 bg-gray-50 rounded border border-dashed border-gray-300">
                <p className="text-sm text-gray-500 mb-2">No verification submitted yet.</p>
                {!isCustomsUser && task.status !== 'CLOSED' && (
                  <button className="text-xs bg-white border border-gray-300 px-2 py-1 rounded shadow-sm hover:bg-gray-50 text-blue-600 font-medium">
                    Link a Submission
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
