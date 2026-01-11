import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../../lib/api';
import { CheckSquare, AlertCircle, PlusCircle, Edit2, Save, X } from 'lucide-react';
import { commonText, translateSubmissionStatus, formatDateGreek } from '../../lib/translations';
import StationHistory from './StationHistory';
import ComplianceHistory from './ComplianceHistory';
import ComplianceChecklist from '../../components/ComplianceChecklist';
import { getCurrentPeriod } from '../../lib/periods';
import { useAuth } from '../auth/AuthContext';

interface Station {
  id: string;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  company: {
    id: string;
    name: string;
  };
  amdika: string | null;
  prefecture: string | null;
  city: string | null;
  installationType: string | null;
  slug: string | null;
  isActive: boolean;
}

interface Submission {
  id: string;
  status: string;
  submittedAt: string | null;
  createdAt: string;
  period: {
    startDate: string;
    endDate: string;
    deadlineDate?: string;
    year: number;
    month: number;
    periodNumber: number;
  };
  checks: any[];
}



interface Evidence {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  submissionId: string | null;
  obligationId: string | null;
}

export default function StationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const currentPeriod = getCurrentPeriod();
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [metadataValues, setMetadataValues] = useState<Partial<Station>>({});

  const isCustomsUser = user?.role.startsWith('CUSTOMS_') || user?.role === 'SYSTEM_ADMIN';

  // Station Metadata Update Mutation
  const updateStationMutation = useMutation({
    mutationFn: (data: Partial<Station>) => api.put(`/stations/${id}`, data),
    onSuccess: () => {
      setIsEditingMetadata(false);
      queryClient.invalidateQueries({ queryKey: ['station', id] });
    },
  });

  const handleEditMetadata = () => {
    if (station) {
      setMetadataValues({
        name: station.name,
        amdika: station.amdika,
        address: station.address,
        prefecture: station.prefecture,
        city: station.city,
        installationType: station.installationType,
      });
      setIsEditingMetadata(true);
    }
  };

  const handleSaveMetadata = () => {
    updateStationMutation.mutate(metadataValues);
  };

  // Fetch station - try ID first then Slug if needed
  const { data: station, isLoading: stationLoading } = useQuery<Station>({
    queryKey: ['station', id],
    queryFn: async () => {
      // Determine if 'id' is a UUID or a Slug
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || '');

      try {
        if (isUuid) {
          const res = await api.get(`/stations/${id}`);
          return res.data.station;
        } else {
          const res = await api.get(`/stations/slug/${id}`);
          return res.data.station;
        }
      } catch (err) {
        throw err;
      }
    },
  });

  // Fetch submissions for this station
  const { data: allSubmissions } = useQuery<Submission[]>({
    queryKey: ['submissions'],
    queryFn: () => api.get('/submissions').then((res) => res.data.submissions),
  });



  // Fetch evidence for this station
  const { data: evidence } = useQuery<Evidence[]>({
    queryKey: ['evidence', 'station', id],
    queryFn: () => api.get(`/evidence?stationId=${id}`).then((res) => res.data.evidence),
    enabled: !!id,
  });

  // Fetch all obligations (needed for checklist structure)
  const { data: obligations } = useQuery({
    queryKey: ['obligations'],
    queryFn: () => api.get('/obligations').then((res) => res.data.obligations),
  });

  // Filter submissions by station
  const submissions = allSubmissions?.filter((s: any) => s.station?.id === id) || [];

  // Fetch or Ensure CURRENT Period Submission
  const { data: activeSubmission, isLoading: submissionLoading, refetch: refetchSubmission } = useQuery<Submission>({
    queryKey: ['active-submission', id],
    queryFn: () => api.post('/submissions/ensure', { stationId: id }).then((res) => res.data.submission),
    enabled: !!id,
  });

  // Finalize Submission Mutation
  const finalizeSubmissionMutation = useMutation({
    mutationFn: (submissionId: string) => api.post(`/submissions/${submissionId}/submit`),
    onSuccess: () => {
      refetchSubmission();
    },
  });

  // Reopen Submission Mutation
  const reopenSubmissionMutation = useMutation({
    mutationFn: (submissionId: string) => api.post(`/submissions/${submissionId}/reopen`),
    onSuccess: () => {
      refetchSubmission();
    },
  });



  if (stationLoading) {
    return (
      <div className="w-full py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{commonText.loadingStation}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="w-full py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{commonText.stationNotFound}</h2>
          <p className="text-gray-600 mb-4">{commonText.notFoundMessage}</p>
          <Link to="/stations" className="text-blue-600 hover:underline">
            {commonText.backToStations}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link to="/stations" className="text-blue-600 hover:underline mb-2 inline-block">
            {commonText.backToStations}
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {station.name}
            </h1>
            {isEditingMetadata && (
              <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">EDITING MODE</span>
            )}
            {!station.isActive && (
              <span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full border border-red-200">
                INACTIVE
              </span>
            )}
          </div>
          <p className="text-gray-600 mt-1">{station.company.name}</p>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <span className="inline-block bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full border border-blue-100">
            {currentPeriod.label}
          </span>

          <div className="flex gap-2">
            {activeSubmission?.status === 'DRAFT' && !isCustomsUser && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to finalize this declaration? It will become read-only.')) {
                    finalizeSubmissionMutation.mutate(activeSubmission.id);
                  }
                }}
                disabled={finalizeSubmissionMutation.isPending}
                className="bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-md hover:bg-green-700 shadow-sm flex items-center gap-2"
              >
                {finalizeSubmissionMutation.isPending ? 'Finalizing...' : 'Finalize Declaration'}
              </button>
            )}

            {/* Action Buttons */}
            {(user?.role === 'COMPANY_ADMIN' || user?.role === 'SYSTEM_ADMIN') && (
              <button
                onClick={async () => {
                  if (confirm(`Are you sure you want to ${station.isActive ? 'DISABLE' : 'ENABLE'} this station?`)) {
                    await api.put(`/stations/${station.id}/status`, { isActive: !station.isActive });
                    queryClient.invalidateQueries({ queryKey: ['station', id] });
                  }
                }}
                className={`text-sm font-medium px-4 py-2 rounded-md transition-colors ${station.isActive
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                  : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                  }`}
              >
                {station.isActive ? 'Disable Station' : 'Activate Station'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg mb-8 border-t-4 border-blue-600 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Edit2 className="h-5 w-5 text-blue-600" />
            {commonText.stationInformation}
          </h2>

          {!isCustomsUser && (
            <div className="flex gap-2">
              {isEditingMetadata ? (
                <>
                  <button
                    onClick={() => setIsEditingMetadata(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <X className="h-4 w-4" /> {commonText.cancel}
                  </button>
                  <button
                    onClick={handleSaveMetadata}
                    disabled={updateStationMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 shadow-sm"
                  >
                    <Save className="h-4 w-4" /> {updateStationMutation.isPending ? 'Saving...' : commonText.save}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEditMetadata}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded hover:bg-blue-100 transition-colors"
                >
                  <Edit2 className="h-4 w-4" /> {commonText.edit}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`p-3 rounded-lg transition-colors ${isEditingMetadata ? 'bg-blue-50 border border-blue-100 shadow-inner' : 'bg-gray-50'}`}>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{commonText.stationName}</p>
              {isEditingMetadata ? (
                <input
                  type="text"
                  value={metadataValues.name || ''}
                  onChange={(e) => setMetadataValues({ ...metadataValues, name: e.target.value })}
                  className="w-full mt-1 bg-white border border-blue-200 rounded px-2 py-1 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="font-semibold text-gray-900 mt-1">{station.name}</p>
              )}
            </div>

            <div className={`p-3 rounded-lg transition-colors ${isEditingMetadata ? 'bg-blue-50 border border-blue-100 shadow-inner' : 'bg-gray-50'}`}>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{commonText.amdika}</p>
              {isEditingMetadata ? (
                <input
                  type="text"
                  value={metadataValues.amdika || ''}
                  onChange={(e) => setMetadataValues({ ...metadataValues, amdika: e.target.value })}
                  className="w-full mt-1 bg-white border border-blue-200 rounded px-2 py-1 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="font-mono font-medium text-gray-900 mt-1">{station.amdika || '-'}</p>
              )}
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{commonText.company}</p>
              <p className="font-medium text-gray-900 mt-1">{station.company.name}</p>
            </div>

            <div className={`p-3 rounded-lg transition-colors ${isEditingMetadata ? 'bg-blue-50 border border-blue-100 shadow-inner' : 'bg-gray-50'}`}>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{commonText.installationType}</p>
              {isEditingMetadata ? (
                <input
                  type="text"
                  value={metadataValues.installationType || ''}
                  onChange={(e) => setMetadataValues({ ...metadataValues, installationType: e.target.value })}
                  className="w-full mt-1 bg-white border border-blue-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="font-medium text-gray-900 mt-1">{station.installationType || '-'}</p>
              )}
            </div>

            <div className={`p-3 rounded-lg transition-colors ${isEditingMetadata ? 'bg-blue-50 border border-blue-100 shadow-inner' : 'bg-gray-50'}`}>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{commonText.prefecture}</p>
              {isEditingMetadata ? (
                <input
                  type="text"
                  value={metadataValues.prefecture || ''}
                  onChange={(e) => setMetadataValues({ ...metadataValues, prefecture: e.target.value })}
                  className="w-full mt-1 bg-white border border-blue-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="font-medium text-gray-900 mt-1">{station.prefecture || '-'}</p>
              )}
            </div>

            <div className={`p-3 rounded-lg transition-colors ${isEditingMetadata ? 'bg-blue-50 border border-blue-100 shadow-inner' : 'bg-gray-50'}`}>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{commonText.city}</p>
              {isEditingMetadata ? (
                <input
                  type="text"
                  value={metadataValues.city || ''}
                  onChange={(e) => setMetadataValues({ ...metadataValues, city: e.target.value })}
                  className="w-full mt-1 bg-white border border-blue-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="font-medium text-gray-900 mt-1">{station.city || '-'}</p>
              )}
            </div>

            <div className={`md:col-span-2 p-3 rounded-lg transition-colors ${isEditingMetadata ? 'bg-blue-50 border border-blue-100 shadow-inner' : 'bg-gray-50'}`}>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{commonText.address}</p>
              {isEditingMetadata ? (
                <input
                  type="text"
                  value={metadataValues.address || ''}
                  onChange={(e) => setMetadataValues({ ...metadataValues, address: e.target.value })}
                  className="w-full mt-1 bg-white border border-blue-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="font-medium text-gray-900 mt-1">{station.address || '-'}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Checklist (Active/Current) */}
      <div className="bg-white rounded-lg shadow mb-8 overflow-hidden border border-gray-200">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-blue-600" />
              {activeSubmission?.period?.year === currentPeriod.year &&
                activeSubmission?.period?.month === currentPeriod.month &&
                activeSubmission?.period?.periodNumber === currentPeriod.periodNumber
                ? 'Compliance Checklist (Current Period)'
                : 'Compliance Checklist (Latest Available)'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Monitoring Period: <span className="font-semibold">
                {activeSubmission?.period ? `${formatDateGreek(activeSubmission.period.startDate)} - ${formatDateGreek(activeSubmission.period.endDate)}` : currentPeriod.label}
              </span>
            </p>
          </div>

          {activeSubmission && (
            <div className="flex items-center gap-3">
              {activeSubmission.status === 'DRAFT' ? (
                <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-3 py-1 rounded-full text-sm font-bold border border-blue-100">
                  <PlusCircle className="h-4 w-4" />
                  LIVE DATA (DRAFT)
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm font-bold border border-green-100">
                  <CheckSquare className="h-4 w-4" />
                  SNAPSHOT ({translateSubmissionStatus(activeSubmission.status)})
                </span>
              )}

              {activeSubmission?.status === 'SUBMITTED' && !isCustomsUser &&
                activeSubmission?.period?.year === currentPeriod.year &&
                activeSubmission?.period?.month === currentPeriod.month &&
                activeSubmission?.period?.periodNumber === currentPeriod.periodNumber && (
                  <button
                    onClick={() => {
                      if (confirm('Reopen this checklist for editing?')) {
                        reopenSubmissionMutation.mutate(activeSubmission.id);
                      }
                    }}
                    disabled={reopenSubmissionMutation.isPending}
                    className="ml-3 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 shadow-sm transition-colors"
                  >
                    {reopenSubmissionMutation.isPending ? 'Unlocking...' : 'Reopen for Editing'}
                  </button>
                )}
            </div>
          )}
        </div>

        <div className="p-6">
          {submissionLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : activeSubmission ? (
            <ComplianceChecklist
              submissionId={activeSubmission.id}
              stationId={station.id}
              status={activeSubmission.status}
              checks={activeSubmission.checks || []}
              obligations={obligations || []}
              evidence={evidence || []}
              isCustomsUser={isCustomsUser}
              onRefresh={() => refetchSubmission()}
              deadlineDate={activeSubmission.period?.deadlineDate}
            />
          ) : (
            <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <AlertCircle className="h-10 w-10 mx-auto mb-3 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">No Compliance Records</h3>
              <p className="mt-1">No submissions found for this station. Compliance reporting will begin in the next period.</p>
            </div>
          )}
        </div>
      </div>

      {/* Legacy/History Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ComplianceHistory submissions={submissions} />
        <StationHistory />
      </div>

    </div>
  );
}
