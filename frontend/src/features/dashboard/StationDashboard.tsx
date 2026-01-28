import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, CheckCircle, Clock, PlayCircle, Save } from 'lucide-react';
import api from '../../lib/api';
import { Button } from '../../components/ui/button';

interface StationDashboardData {
    station: {
        id: string;
        name: string;
        amdika: string;
        status: 'ACTIVE' | 'INACTIVE';
    };
    lastSubmission?: {
        period: { start: string; end: string };
        status: string;
        checks: Record<string, any>;
    };
    currentPeriod: {
        id: string;
        start: string;
        end: string;
        deadline: string;
    };
    currentSubmission: {
        id: string;
        status: string;
        checks: Array<{
            obligationId: string;
            title: string;
            code: string;
            value: string; // JSON string
            notes: string;
            fieldType: string;
        }>;
    } | null;
    notifications: Array<{
        id: string;
        type: 'WARNING' | 'INFO' | 'ERROR';
        message: string;
    }>;
}

export default function StationDashboard() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [draftValues, setDraftValues] = useState<Record<string, string>>({});

    const { data, isLoading } = useQuery<StationDashboardData>({
        queryKey: ['station-dashboard'],
        queryFn: async () => {
            const res = await api.get('/dashboard/station');
            return res.data;
        },
    });

    // Initialize draft values when data loads
    useEffect(() => {
        if (data?.currentSubmission?.checks) {
            const initialValues: Record<string, string> = {};
            data.currentSubmission.checks.forEach(check => {
                initialValues[check.obligationId] = check.value || 'NO'; // Default to NO if empty? Or empty string.
            });
            setDraftValues(initialValues);
        }
    }, [data?.currentSubmission?.id]);

    const startSubmissionMutation = useMutation({
        mutationFn: async () => {
            if (!data) return;
            await api.post('/submissions/ensure', { stationId: data.station.id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['station-dashboard'] });
        },
    });

    const saveDraftMutation = useMutation({
        mutationFn: async () => {
            if (!data?.currentSubmission) return;

            // Sequential updates for now (better: batch endpoint)
            const promises = data.currentSubmission.checks.map(check => {
                const newVal = draftValues[check.obligationId];
                if (newVal !== check.value) {
                    return api.put(`/submissions/${data.currentSubmission!.id}/checks`, {
                        obligationId: check.obligationId,
                        value: newVal
                    });
                }
                return Promise.resolve();
            });
            await Promise.all(promises);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['station-dashboard'] });
            alert('Draft saved successfully!');
        },
    });

    const submitSubmissionMutation = useMutation({
        mutationFn: async () => {
            if (!data?.currentSubmission) return;

            // 1. Auto-Save: Ensure any pending changes are saved to DB first
            const promises = data.currentSubmission.checks.map(check => {
                const newVal = draftValues[check.obligationId];
                // Only update if value is different (and strictly defined)
                if (newVal !== undefined && newVal !== check.value) {
                    return api.put(`/submissions/${data.currentSubmission!.id}/checks`, {
                        obligationId: check.obligationId,
                        value: newVal
                    });
                }
                return Promise.resolve();
            });

            await Promise.all(promises);

            // 2. Submit Final
            await api.post(`/submissions/${data.currentSubmission.id}/submit`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['station-dashboard'] });
            alert('Submission finalized successfully!');
        },
        onError: (err: any) => {
            alert('Failed to submit: ' + (err.response?.data?.error || err.message));
        }
    });
    const recallSubmissionMutation = useMutation({
        mutationFn: async () => {
            if (!data?.currentSubmission) return;
            await api.post(`/submissions/${data.currentSubmission.id}/recall`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['station-dashboard'] });
            alert('Submission recalled! You can now edit it again.');
        },
        onError: (err: any) => {
            alert('Failed to recall: ' + (err.response?.data?.error || err.message));
        }
    });

    const isComplete = data?.currentSubmission?.checks.every(c => {
        const val = draftValues[c.obligationId];
        return val && val !== ''; // Check if value is set in local state (which syncs with DB on load)
    });

    // Helper to determine if we can recall
    const canRecall = data?.currentSubmission?.status === 'SUBMITTED';

    const handleValueChange = (obligationId: string, value: string) => {
        setDraftValues(prev => ({
            ...prev,
            [obligationId]: value
        }));
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">Failed to load dashboard data.</div>;

    const isLocked = ['SUBMITTED', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'].includes(data.currentSubmission?.status || '');

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gas Station Portal</h1>
                    <p className="text-gray-500">
                        Station: <span className="font-semibold text-gray-900">{data.station.name}</span> •
                        AMDIKA: {data.station.amdika}
                    </p>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-bold ${data.station.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    Status: {data.station.status}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Content (Left 3 cols) */}
                <div className="lg:col-span-3 space-y-6">

                    {/* Section A: Last Submission (Read-Only) */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 opacity-90">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-5 h-5 text-gray-500" />
                            <h2 className="text-lg font-semibold text-gray-700">Last Submission</h2>
                            {data.lastSubmission ? (
                                <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                    {new Date(data.lastSubmission.period.start).toLocaleDateString()} — {new Date(data.lastSubmission.period.end).toLocaleDateString()}
                                </span>
                            ) : null}
                        </div>

                        {data.lastSubmission ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.keys(data.lastSubmission.checks).map((key) => {
                                    const val = data.lastSubmission!.checks[key];
                                    let displayVal = 'OK';
                                    try {
                                        // Handle JSON or simple string
                                        displayVal = val === 'YES' ? 'OK' : (val === 'NO' ? 'MISSING' : 'Check');
                                    } catch (e) { }

                                    return (
                                        <div key={key} className="bg-white p-3 rounded border border-gray-200">
                                            <div className="text-xs text-gray-500 uppercase truncate" title={key}>{key}</div>
                                            <div className="flex items-center gap-1 text-green-600 font-medium text-sm">
                                                <CheckCircle className="w-4 h-4" /> {displayVal}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-gray-500 italic">No previous finalized submissions found.</div>
                        )}
                    </div>

                    {/* Section B: Current Submission (Editable) */}
                    <div className={`bg-white border-2 rounded-lg p-6 shadow-sm ${data.currentSubmission ? 'border-blue-100' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-8 rounded-full ${data.currentSubmission ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Current Submission</h2>
                                    <p className="text-sm text-gray-500">
                                        Period: {new Date(data.currentPeriod.start).toLocaleDateString('el-GR')} — {new Date(data.currentPeriod.end).toLocaleDateString('el-GR')}
                                    </p>
                                </div>
                            </div>
                            <div className="text-sm bg-orange-50 text-orange-700 px-3 py-1 rounded-full border border-orange-100 flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Deadline: {new Date(data.currentPeriod.deadline).toLocaleDateString()}
                            </div>
                        </div>

                        {!data.currentSubmission ? (
                            <div className="text-center py-12 bg-gray-50 rounded border border-dashed border-gray-300">
                                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-gray-900 font-medium mb-1">No Active Submission</h3>
                                <p className="text-gray-500 text-sm mb-6">Start a new submission for the current period.</p>
                                <Button onClick={() => startSubmissionMutation.mutate()} disabled={startSubmissionMutation.isPending}>
                                    <PlayCircle className="w-4 h-4 mr-2" />
                                    {startSubmissionMutation.isPending ? 'Starting...' : 'Start Submission'}
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {data.currentSubmission.checks.map((check) => (
                                        <div key={check.obligationId} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                                            <div className='flex-1 pr-4'>
                                                <div className="font-medium text-gray-900 text-sm">{check.title}</div>
                                                <div className="text-xs text-gray-500">{check.code}</div>
                                            </div>
                                            <div className="w-48">
                                                <select
                                                    className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    value={draftValues[check.obligationId] || ""}
                                                    onChange={(e) => handleValueChange(check.obligationId, e.target.value)}
                                                    disabled={isLocked}
                                                >
                                                    <option value="">Select...</option>
                                                    <option value="YES">YES (Valid)</option>
                                                    <option value="NO">NO (Invalid/Missing)</option>
                                                </select>
                                            </div>
                                        </div>
                                    ))}

                                    {data.currentSubmission.checks.length === 0 && (
                                        <div className="text-center text-gray-500 italic py-4">
                                            No obligations configured for this submission.
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-gray-100">
                                    {canRecall && (
                                        <div className="mr-auto">
                                            <p className="text-xs text-gray-500 mb-1">Made a mistake?</p>
                                            <Button
                                                variant="ghost"
                                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to recall this submission? It will revert to draft status.')) {
                                                        recallSubmissionMutation.mutate();
                                                    }
                                                }}
                                                disabled={recallSubmissionMutation.isPending}
                                            >
                                                Recall Submission
                                            </Button>
                                        </div>
                                    )}

                                    {!isLocked && (
                                        <Button
                                            variant="outline"
                                            onClick={() => saveDraftMutation.mutate()}
                                            disabled={saveDraftMutation.isPending || isLocked}
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            {saveDraftMutation.isPending ? 'Saving...' : 'Save Draft'}
                                        </Button>
                                    )}

                                    <Button
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to finalize this submission? This action cannot be undone.')) {
                                                submitSubmissionMutation.mutate();
                                            }
                                        }}
                                        disabled={isLocked || !isComplete || submitSubmissionMutation.isPending}
                                        className={!isComplete && !isLocked ? "opacity-50 cursor-not-allowed" : ""}
                                        title={!isComplete ? "All checks must be completed before submitting" : ""}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        {isLocked ? 'Submitted' : (submitSubmissionMutation.isPending ? 'Submitting...' : 'Submit Final')}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Sidebar (Right 1 col) */}
                <div className="space-y-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-3 border-b pb-2">Notifications</h3>
                        <div className="space-y-3">
                            {data.notifications && data.notifications.length > 0 ? (
                                data.notifications.map((notif) => (
                                    <div key={notif.id} className={`p-3 rounded border text-sm ${notif.type === 'WARNING' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                                        notif.type === 'ERROR' ? 'bg-red-50 border-red-200 text-red-800' :
                                            'bg-blue-50 border-blue-200 text-blue-800'
                                        }`}>
                                        {notif.message}
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-500 text-sm italic">No notifications</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-3 border-b pb-2">Quick Links</h3>
                        <div className="space-y-2">
                            <Button variant="ghost" className="w-full justify-start text-gray-700" onClick={() => navigate('/dashboard/tasks')}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Support Tickets
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-gray-700" onClick={() => navigate('/dashboard/history')}>
                                <FileText className="w-4 h-4 mr-2" />
                                Submission History
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => window.location.href = '/api/auth/logout'}>
                                Log Out
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
