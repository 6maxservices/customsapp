import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuth } from '../auth/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { commonText, formatDateGreek } from '../../lib/translations';

interface Period {
  id: string;
  startDate: string;
  endDate: string;
  deadlineDate: string;
  periodNumber: number;
  month: number;
  year: number;
}

interface Station {
  id: string;
  name: string;
  company: {
    id: string;
    name: string;
  };
}

export default function CreateSubmissionPage() {
  const navigate = useNavigate();
  useAuth();

  const queryClient = useQueryClient();
  const [periodId, setPeriodId] = useState('');
  const [stationId, setStationId] = useState('');
  const [error, setError] = useState('');

  // Fetch available periods (upcoming and current)
  const { data: currentPeriod } = useQuery<Period>({
    queryKey: ['periods', 'current'],
    queryFn: () => api.get('/periods/current').then((res) => res.data.period),
  });

  const { data: upcomingPeriods } = useQuery<Period[]>({
    queryKey: ['periods', 'upcoming'],
    queryFn: () => api.get('/periods/upcoming?limit=10').then((res) => res.data.periods),
  });

  // Combine current and upcoming periods
  const availablePeriods = [
    ...(currentPeriod ? [currentPeriod] : []),
    ...(upcomingPeriods || []),
  ].filter((p, index, self) => index === self.findIndex((t) => t.id === p.id));

  // Fetch available stations
  const { data: stations } = useQuery<Station[]>({
    queryKey: ['stations'],
    queryFn: () => api.get('/stations').then((res) => res.data.stations),
  });

  // Create submission mutation
  const createSubmissionMutation = useMutation({
    mutationFn: async (data: { periodId: string; stationId: string }) => {
      return api.post('/submissions', data);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      navigate(`/submissions/${response.data.submission.id}`);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || commonText.failedToCreateSubmission);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!periodId || !stationId) {
      setError(commonText.pleaseSelectBoth);
      return;
    }

    createSubmissionMutation.mutate({ periodId, stationId });
  };

  const formatPeriod = (period: Period) => {
    const start = formatDateGreek(period.startDate);
    const end = formatDateGreek(period.endDate);
    return `${commonText.periodNumber} ${period.periodNumber} (${start} - ${end})`;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/submissions" className="text-blue-600 hover:underline mb-4 inline-flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        {commonText.backToSubmissions}
      </Link>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{commonText.createSubmission}</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Period Selection */}
          <div>
            <label htmlFor="periodId" className="block text-sm font-medium text-gray-700 mb-2">
              {commonText.submissionPeriod} <span className="text-red-500">*</span>
            </label>
            <select
              id="periodId"
              value={periodId}
              onChange={(e) => setPeriodId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">{commonText.selectPeriod}</option>
              {availablePeriods.map((period) => (
                <option key={period.id} value={period.id}>
                  {formatPeriod(period)}
                </option>
              ))}
            </select>
            {availablePeriods.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                {commonText.noAvailablePeriods}
              </p>
            )}
          </div>

          {/* Station Selection */}
          <div>
            <label htmlFor="stationId" className="block text-sm font-medium text-gray-700 mb-2">
              {commonText.station} <span className="text-red-500">*</span>
            </label>
            <select
              id="stationId"
              value={stationId}
              onChange={(e) => setStationId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">{commonText.selectStation}</option>
              {stations?.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.name} ({station.company.name})
                </option>
              ))}
            </select>
            {stations && stations.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">{commonText.noStationsAvailable}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={createSubmissionMutation.isPending || !periodId || !stationId}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createSubmissionMutation.isPending ? commonText.creating : commonText.creatingSubmission}
            </button>
            <Link
              to="/submissions"
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-center"
            >
              {commonText.cancel}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

