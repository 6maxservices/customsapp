import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuth } from '../auth/AuthContext';
import { CheckCircle, XCircle, AlertTriangle, Plus, RotateCcw, PlayCircle, Clipboard } from 'lucide-react';
import ComplianceChecklist from '../../components/ComplianceChecklist';
import { commonText, translateSubmissionStatus, formatDateGreek } from '../../lib/translations';


interface SubmissionCheck {
  id: string;
  obligationId: string;
  value: string | null;
  notes: string | null;
  updatedAt: string;
  obligation: {
    id: string;
    title: string;
    description: string | null;
    fieldType: 'BOOLEAN' | 'TEXT' | 'NUMBER' | 'DATE' | 'FILE';
  };
}

interface Evidence {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  obligationId: string | null;
  obligation: {
    title: string;
  } | null;
}

interface Submission {
  id: string;
  status: string;
  submittedAt: string | null;
  createdAt: string;
  period: {
    id: string;
    startDate: string;
    endDate: string;
  };
  station: {
    id: string;
    name: string;
    company: {
      name: string;
    };
  };
  company: {
    id: string;
    name: string;
  };
  submittedBy: {
    email: string;
  } | null;
  reviewedBy: {
    email: string;
  } | null;
  checks: SubmissionCheck[];
  forwardedAt?: string | null;
}

export default function SubmissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isCustomsUser = user?.role.startsWith('CUSTOMS_') || user?.role === 'SYSTEM_ADMIN';
  const isCompanyAdmin = user?.role === 'COMPANY_ADMIN';

  // Fetch submission
  const { data: submission, isLoading: submissionLoading } = useQuery<Submission>({
    queryKey: ['submission', id],
    queryFn: () => api.get(`/submissions/${id}`).then((res) => res.data.submission),
  });

  // Fetch all obligations to show full checklist
  const { data: obligations } = useQuery({
    queryKey: ['obligations'],
    queryFn: () => api.get('/obligations').then((res) => res.data.obligations),
  });

  // Fetch evidence files
  const { data: evidence, refetch: refetchEvidence } = useQuery<Evidence[]>({
    queryKey: ['evidence', 'submission', id],
    queryFn: () => api.get(`/evidence?submissionId=${id}`).then((res) => res.data.evidence),
    enabled: !!id,
  });

  // Update submission status mutation (for customs users)
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      return api.put(`/submissions/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submission', id] });
    },
  });

  // Company Admin: Start Review mutation
  const startReviewMutation = useMutation({
    mutationFn: async () => {
      return api.post(`/company/submissions/${id}/start-review`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submission', id] });
    },
  });

  // Company Admin: Approve mutation
  const approveMutation = useMutation({
    mutationFn: async () => {
      return api.post(`/company/submissions/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submission', id] });
    },
  });

  // Company Admin: Return for Correction mutation
  const returnMutation = useMutation({
    mutationFn: async (reason: string) => {
      return api.post(`/company/submissions/${id}/return`, { returnReason: reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submission', id] });
    },
  });

  // Submit submission mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      return api.post(`/submissions/${id}/submit`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submission', id] });
    },
  });

  if (submissionLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{commonText.loadingSubmission}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{commonText.submissionNotFound}</h2>
          <p className="text-gray-600 mb-4">{commonText.notFoundMessage}</p>
          <Link to="/submissions" className="text-blue-600 hover:underline">
            {commonText.backToSubmissions}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link to="/submissions" className="text-blue-600 hover:underline mb-2 inline-block">
          {commonText.backToSubmissions}
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{commonText.submissionDetails}</h1>
            <p className="text-gray-600 mt-1">
              {submission.station.name} - {submission.company.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 text-sm font-semibold rounded ${submission.status === 'SUBMITTED'
                ? 'bg-yellow-100 text-yellow-800'
                : submission.status === 'APPROVED'
                  ? 'bg-green-100 text-green-800'
                  : submission.status === 'REJECTED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
            >
              {translateSubmissionStatus(submission.status)}
            </span>
            {submission.status === 'DRAFT' && !isCustomsUser && (
              <button
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-lg font-bold rounded-lg hover:bg-blue-700 shadow-md transform transition hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                <CheckCircle className="h-6 w-6" />
                {commonText.verifyAndSubmit}
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Submission Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{commonText.submissionInformation}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">{commonText.period}</p>
            <p className="font-medium">
              {formatDateGreek(submission.period.startDate)} -{' '}
              {formatDateGreek(submission.period.endDate)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{commonText.station}</p>
            <p className="font-medium">{submission.station.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{commonText.company}</p>
            <p className="font-medium">{submission.company.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{commonText.createdLabel}</p>
            <p className="font-medium">{formatDateGreek(submission.createdAt)}</p>
          </div>
          {submission.submittedAt && (
            <div>
              <p className="text-sm text-gray-500">{commonText.submitted}</p>
              <p className="font-medium">{formatDateGreek(submission.submittedAt)}</p>
            </div>
          )}
          {submission.submittedBy && (
            <div>
              <p className="text-sm text-gray-500">{commonText.submittedBy}</p>
              <p className="font-medium">{submission.submittedBy.email}</p>
            </div>
          )}
          {submission.reviewedBy && (
            <div>
              <p className="text-sm text-gray-500">{commonText.reviewedBy}</p>
              <p className="font-medium">{submission.reviewedBy.email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Change (Customs Users) */}
      {isCustomsUser && submission.status === 'SUBMITTED' && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Confirmation of Compliance</h2>
              <p className="text-sm text-gray-600">Review the evidence and checks below before making a decision.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to REJECT this submission?')) {
                    const reason = window.prompt('Please provide a reason for rejection:');
                    if (reason) updateStatusMutation.mutate('REJECTED'); // In real app, pass reason
                  }
                }}
                disabled={updateStatusMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-md hover:bg-red-50 font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Reject submission
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Confirm approval of this submission?')) {
                    updateStatusMutation.mutate('APPROVED');
                  }
                }}
                disabled={updateStatusMutation.isPending}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow-md transition-all hover:shadow-lg disabled:opacity-50"
              >
                <CheckCircle className="h-5 w-5" />
                Approve Declaration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customs User: Create Task Button */}
      {isCustomsUser && (submission.status === 'APPROVED' || submission.forwardedAt) && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Δημιουργία Εργασίας/Κύρωσης</h2>
              <p className="text-sm text-gray-600">Η υποβολή θα συνδεθεί αυτόματα.</p>
            </div>
            <Link
              to={`/tasks/new?submissionId=${id}&stationId=${submission.station.id}&companyId=${submission.company?.id}`}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium shadow-md transition-all hover:shadow-lg"
            >
              <Clipboard className="h-5 w-5" />
              Δημιουργία Εργασίας
            </Link>
          </div>
        </div>
      )}

      {/* Company Admin: Start Review */}
      {isCompanyAdmin && submission.status === 'SUBMITTED' && (
        <div className="bg-green-50 border border-green-200 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Αναθεώρηση Υποβολής</h2>
              <p className="text-sm text-gray-600">Εξετάστε τα δεδομένα πριν εγκρίνετε ή επιστρέψετε την υποβολή.</p>
            </div>
            <button
              onClick={() => startReviewMutation.mutate()}
              disabled={startReviewMutation.isPending}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium shadow-md transition-all hover:shadow-lg disabled:opacity-50"
            >
              <PlayCircle className="h-5 w-5" />
              Έναρξη Αναθεώρησης
            </button>
          </div>
        </div>
      )}

      {/* Company Admin: Approve or Return */}
      {isCompanyAdmin && submission.status === 'UNDER_REVIEW' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Απόφαση Εταιρείας</h2>
              <p className="text-sm text-gray-600">Εγκρίνετε για προώθηση ή επιστρέψτε για διόρθωση.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const reason = window.prompt('Λόγος επιστροφής (υποχρεωτικό):');
                  if (reason && reason.length >= 5) {
                    returnMutation.mutate(reason);
                  } else if (reason) {
                    alert('Ο λόγος πρέπει να είναι τουλάχιστον 5 χαρακτήρες.');
                  }
                }}
                disabled={returnMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-white text-amber-600 border border-amber-300 rounded-md hover:bg-amber-50 font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                Επιστροφή για Διόρθωση
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Είστε σίγουροι ότι θέλετε να εγκρίνετε αυτή την υποβολή;')) {
                    approveMutation.mutate();
                  }
                }}
                disabled={approveMutation.isPending}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium shadow-md transition-all hover:shadow-lg disabled:opacity-50"
              >
                <CheckCircle className="h-5 w-5" />
                Έγκριση
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6 overflow-hidden">
        <h2 className="text-xl font-semibold mb-4">{commonText.complianceChecklist}</h2>
        <ComplianceChecklist
          submissionId={submission.id}
          stationId={submission.station.id}
          status={submission.status}
          checks={submission.checks || []}
          obligations={obligations || []}
          evidence={evidence || []}
          isCustomsUser={isCustomsUser}
          onRefresh={() => {
            queryClient.invalidateQueries({ queryKey: ['submission', id] });
            refetchEvidence();
          }}
        />
      </div>

      {/* RELATED TASKS / ACTIONS PANEL */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-gray-500" />
            Actions & Sanctions
          </h2>
          {isCustomsUser && (submission.status === 'REJECTED' || submission.status === 'APPROVED') && (
            <Link
              to={`/tasks/new?submissionId=${submission.id}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create New Action
            </Link>
          )}
        </div>

        <div className="p-6">
          {/* Mocking Tasks List - In real app, fetch linked tasks */}
          {submission.status === 'REJECTED' ? (
            <div className="space-y-4">
              {/* Example of an open task linked to this rejection */}
              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-lg">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">ACTION REQUIRED</span>
                    <span className="text-sm font-medium text-gray-900">Upload Missing Safety Certificate</span>
                  </div>
                  <p className="text-xs text-red-800">Please provide the updated certificate as per the audit findings.</p>
                </div>
                <Link to="/tasks/queue" className="px-3 py-1 bg-white border border-red-200 text-red-700 text-sm font-medium rounded hover:bg-red-50">
                  View Ticket
                </Link>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">
                <AlertTriangle className="h-4 w-4" />
                <p>Rejection automatically flags this period for closer monitoring.</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">No open enforcement actions linked to this submission.</p>
          )}
        </div>
      </div>

    </div>
  );
}
