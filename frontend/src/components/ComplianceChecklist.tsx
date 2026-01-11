import { useState } from 'react';
import { Save, Edit2, Upload, Trash2, CheckCircle, Clock, AlertTriangle, AlertCircle, Eye } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import { commonText, formatDateGreek, formatRelativeTime, calculateDaysRemaining } from '../lib/translations';

interface Check {
    id: string;
    obligationId: string;
    value: string | null;
    notes: string | null;
    updatedAt: string; // Add updated timestamp
}

interface Evidence {
    id: string;
    filename: string;
    mimeType: string;
    size: number;
    uploadedAt: string;
    obligationId: string | null;
}

interface ComplianceChecklistProps {
    submissionId: string;
    stationId: string;
    status: string;
    checks: Check[];
    obligations: any[];
    evidence: Evidence[];
    isCustomsUser: boolean;
    onRefresh: () => void;
    deadlineDate?: string; // Add deadline prop
}

export default function ComplianceChecklist({
    submissionId,
    stationId,
    status,
    checks,
    obligations,
    evidence,
    isCustomsUser,
    onRefresh,
    deadlineDate
}: ComplianceChecklistProps) {
    const [editingCheckId, setEditingCheckId] = useState<string | null>(null);
    const [checkValues, setCheckValues] = useState<Record<string, { value: string; notes: string }>>({});

    // Create a map of existing checks by obligationId
    const checksMap = new Map(checks.map((c) => [c.obligationId, c]));

    // Update submission check mutation
    const updateCheckMutation = useMutation({
        mutationFn: async ({ obligationId, value, notes }: { obligationId: string; value?: string; notes?: string }) => {
            return api.put(`/submissions/${submissionId}/checks`, { obligationId, value, notes });
        },
        onSuccess: () => {
            onRefresh(); // Refresh parent data
            setEditingCheckId(null);
        },
    });

    // Upload evidence mutation
    const uploadEvidenceMutation = useMutation({
        mutationFn: async ({ file, obligationId }: { file: File; obligationId?: string }) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('stationId', stationId);
            formData.append('submissionId', submissionId);
            if (obligationId) formData.append('obligationId', obligationId);

            return api.post('/evidence', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        },
        onSuccess: () => {
            onRefresh();
        },
    });

    // Delete evidence mutation
    const deleteEvidenceMutation = useMutation({
        mutationFn: async (evidenceId: string) => {
            return api.delete(`/evidence/${evidenceId}`);
        },
        onSuccess: () => {
            onRefresh();
        },
    });

    const handleEditCheck = (obligationId: string) => {
        const existingCheck = checksMap.get(obligationId);
        setCheckValues({
            ...checkValues,
            [obligationId]: {
                value: existingCheck?.value || '',
                notes: existingCheck?.notes || '',
            },
        });
        setEditingCheckId(obligationId);
    };

    const handleCancelEdit = () => {
        setEditingCheckId(null);
    };

    const handleSaveCheck = (obligationId: string) => {
        const values = checkValues[obligationId];
        updateCheckMutation.mutate({
            obligationId,
            value: values.value || undefined,
            notes: values.notes || undefined,
        });
    };

    const handleDownload = (evidenceId: string) => {
        window.open(`/api/evidence/${evidenceId}/download`, '_blank');
    };

    const isDraft = status === 'DRAFT';
    const canEdit = !isCustomsUser && isDraft;

    return (
        <div className="space-y-6">
            {/* List of Obligations */}
            <div className="space-y-4">
                {obligations.map((obligation: any) => {
                    const check = checksMap.get(obligation.id);
                    const isEditing = editingCheckId === obligation.id;
                    const values = checkValues[obligation.id] || { value: '', notes: '' };

                    // Filter evidence for this specific obligation
                    const obligationEvidence = evidence.filter(e => e.obligationId === obligation.id);

                    // Deadline Status
                    let deadlineStatus = null;
                    if (deadlineDate) {
                        const { days, status: urgency } = calculateDaysRemaining(deadlineDate);
                        let badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                        let Icon = Clock;

                        if (urgency === 'WARNING') {
                            badgeColor = 'bg-orange-50 text-orange-700 border-orange-200';
                            Icon = AlertTriangle;
                        } else if (urgency === 'CRITICAL') {
                            badgeColor = 'bg-red-50 text-red-700 border-red-200';
                            Icon = AlertCircle;
                        } else if (urgency === 'EXPIRED') {
                            badgeColor = 'bg-gray-100 text-gray-500 border-gray-200';
                            Icon = Clock;
                        }

                        deadlineStatus = (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${badgeColor}`}>
                                <Icon className="h-3 w-3" />
                                {urgency === 'EXPIRED'
                                    ? `Expired ${Math.abs(days)} days ago`
                                    : `${days} days remaining`}
                            </span>
                        );
                    }

                    return (
                        <div key={obligation.id} className="border rounded-lg bg-white shadow-sm overflow-hidden">
                            {/* Header / Summary View */}
                            <div className="p-4 bg-gray-50 flex items-start justify-between border-b border-gray-100">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                                            {obligation.title}
                                        </h3>
                                        <span className="text-xs font-mono bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                                            {obligation.code}
                                        </span>
                                        {check && check.value && (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {deadlineStatus}

                                        {check?.updatedAt && (
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Save className="h-3 w-3" />
                                                Updated {formatRelativeTime(check.updatedAt)}
                                            </span>
                                        )}
                                    </div>

                                    {obligation.description && (
                                        <p className="text-xs text-gray-500 mt-2">{obligation.description}</p>
                                    )}
                                </div>

                                {canEdit && (
                                    <button
                                        onClick={() => (isEditing ? handleSaveCheck(obligation.id) : handleEditCheck(obligation.id))}
                                        className={`ml-4 p-2 rounded-full transition-all ${isEditing
                                            ? 'bg-green-600 text-white hover:bg-green-700 shadow-md transform scale-110'
                                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border border-blue-100'}`}
                                        title={isEditing ? commonText.save : commonText.edit}
                                    >
                                        {isEditing ? <Save className="h-5 w-5" /> : <Edit2 className="h-5 w-5" />}
                                    </button>
                                )}
                            </div>

                            <div className="p-4">
                                {/* Editing Mode */}
                                {isEditing ? (
                                    <div className="space-y-4">
                                        {/* Value Input */}
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                                {commonText.valueLabel}
                                            </label>
                                            {obligation.fieldType === 'DATE' ? (
                                                <input
                                                    type="date"
                                                    value={values.value}
                                                    onChange={(e) => setCheckValues({ ...checkValues, [obligation.id]: { ...values, value: e.target.value } })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                                                />
                                            ) : obligation.fieldType === 'BOOLEAN' ? (
                                                <select
                                                    value={values.value}
                                                    onChange={(e) => setCheckValues({ ...checkValues, [obligation.id]: { ...values, value: e.target.value } })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                                                >
                                                    <option value="">{commonText.selectStatus}</option>
                                                    <option value="true">YES</option>
                                                    <option value="false">NO</option>
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={values.value}
                                                    onChange={(e) => setCheckValues({ ...checkValues, [obligation.id]: { ...values, value: e.target.value } })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                                                    placeholder={commonText.enterValue}
                                                />
                                            )}
                                        </div>

                                        {/* Notes Input */}
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                                METADATA / {commonText.notes}
                                            </label>
                                            <textarea
                                                value={values.notes}
                                                onChange={(e) => setCheckValues({ ...checkValues, [obligation.id]: { ...values, notes: e.target.value } })}
                                                rows={2}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                                                placeholder={commonText.enterNotes}
                                            />
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={handleCancelEdit}
                                                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                            >
                                                {commonText.cancel}
                                            </button>
                                            <button
                                                onClick={() => handleSaveCheck(obligation.id)}
                                                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                            >
                                                {commonText.save}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // View Mode
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Value & Metadata */}
                                        <div>
                                            <div className="mb-3">
                                                <span className="text-xs font-bold text-gray-400 uppercase block mb-1">VALUE</span>
                                                <span className="font-medium text-gray-900 text-lg">
                                                    {check?.value ? (
                                                        obligation.fieldType === 'DATE' ? formatDateGreek(check.value) :
                                                            obligation.fieldType === 'BOOLEAN' ? (check.value === 'true' ? 'YES' : 'NO') :
                                                                check.value
                                                    ) : (
                                                        <span className="text-gray-400 italic text-sm">- Not set -</span>
                                                    )}
                                                </span>
                                            </div>

                                            {check?.notes && (
                                                <div>
                                                    <span className="text-xs font-bold text-gray-400 uppercase block mb-1">METADATA</span>
                                                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-100 italic">
                                                        "{check.notes}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Evidence / Attachments */}
                                        <div className="bg-gray-50 rounded p-3 border border-gray-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                                                    <Upload className="h-3 w-3" /> Attachments
                                                </span>
                                                {canEdit && (
                                                    <div className="relative overflow-hidden inline-block">
                                                        <button className="text-xs text-blue-600 hover:underline font-medium cursor-pointer">
                                                            + Upload
                                                        </button>
                                                        <input
                                                            type="file"
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                            onChange={(e: any) => {
                                                                if (e.target.files?.[0]) {
                                                                    uploadEvidenceMutation.mutate({
                                                                        file: e.target.files[0],
                                                                        obligationId: obligation.id
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {obligationEvidence.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {obligationEvidence.map(file => (
                                                        <li key={file.id} className="flex items-center justify-between bg-white p-2 rounded shadow-sm">
                                                            <div className="flex items-center gap-2 truncate">
                                                                <span className="text-xs text-gray-700 truncate max-w-[120px]" title={file.filename}>
                                                                    {file.filename}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => handleDownload(file.id)}
                                                                    className="text-gray-400 hover:text-blue-600"
                                                                    title="View/Download"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </button>
                                                                {canEdit && (
                                                                    <button
                                                                        onClick={() => deleteEvidenceMutation.mutate(file.id)}
                                                                        className="text-gray-400 hover:text-red-600"
                                                                        title={commonText.delete}
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-xs text-gray-400 italic">No attachments</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
