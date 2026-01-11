import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuth } from '../auth/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { commonText, translateSubmissionStatus, formatDateGreek } from '../../lib/translations';

interface Station {
  id: string;
  name: string;
  company: {
    id: string;
    name: string;
  };
}

interface Submission {
  id: string;
  status: string;
  period: {
    startDate: string;
    endDate: string;
  };
  station: {
    name: string;
  };
}

interface Obligation {
  id: string;
  title: string;
}



export default function CreateTaskPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    stationId: '',
    submissionId: '',
    obligationId: '',
    title: '',
    description: '',
    dueDate: '',
    assignedToId: '',
  });
  const [error, setError] = useState('');

  const isCustomsUser = user?.role.startsWith('CUSTOMS_') || user?.role === 'SYSTEM_ADMIN';

  // Redirect if not customs user
  if (!isCustomsUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{commonText.onlyCustomsUsersCanCreateTasks}</p>
          <Link to="/tasks" className="text-blue-600 hover:underline mt-2 inline-block">
            {commonText.backToTasks}
          </Link>
        </div>
      </div>
    );
  }

  // Fetch stations (customs users see all)
  const { data: stations } = useQuery<Station[]>({
    queryKey: ['stations'],
    queryFn: () => api.get('/stations').then((res) => res.data.stations),
  });

  // Fetch submissions (for optional linking)
  const { data: submissions } = useQuery<Submission[]>({
    queryKey: ['submissions'],
    queryFn: () => api.get('/submissions').then((res) => res.data.submissions),
  });

  // Fetch obligations (for optional linking)
  const { data: obligations } = useQuery<Obligation[]>({
    queryKey: ['obligations'],
    queryFn: () => api.get('/obligations').then((res) => res.data.obligations),
  });

  // Fetch company users for assignment (we'll filter from all users if there's an endpoint, or use stations to get company users)
  // For now, we'll make assignment optional and let the backend handle it

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload: any = {
        stationId: data.stationId,
        title: data.title,
      };
      if (data.submissionId) payload.submissionId = data.submissionId;
      if (data.obligationId) payload.obligationId = data.obligationId;
      if (data.description) payload.description = data.description;
      if (data.dueDate) payload.dueDate = new Date(data.dueDate).toISOString();
      if (data.assignedToId) payload.assignedToId = data.assignedToId;

      return api.post('/tasks', payload);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      navigate(`/tasks/${response.data.task.id}`);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || commonText.failedToCreateTask);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.stationId || !formData.title.trim()) {
      setError(commonText.stationAndTitleRequired);
      return;
    }

    createTaskMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Filter submissions by selected station
  const filteredSubmissions = formData.stationId
    ? submissions?.filter((s: any) => s.station?.id === formData.stationId)
    : [];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/tasks" className="text-blue-600 hover:underline mb-4 inline-flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        {commonText.backToTasks}
      </Link>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{commonText.createTask}</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Station Selection */}
          <div>
            <label htmlFor="stationId" className="block text-sm font-medium text-gray-700 mb-2">
              {commonText.station} <span className="text-red-500">*</span>
            </label>
            <select
              id="stationId"
              name="stationId"
              value={formData.stationId}
              onChange={handleChange}
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
          </div>

          {/* Submission Selection (Optional) */}
          <div>
            <label htmlFor="submissionId" className="block text-sm font-medium text-gray-700 mb-2">
              {commonText.relatedSubmissionOptional}
            </label>
            <select
              id="submissionId"
              name="submissionId"
              value={formData.submissionId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.stationId}
            >
              <option value="">{commonText.noneOption}</option>
              {filteredSubmissions?.map((submission: any) => (
                <option key={submission.id} value={submission.id}>
                  {formatDateGreek(submission.period.startDate)} -{' '}
                  {formatDateGreek(submission.period.endDate)} ({translateSubmissionStatus(submission.status)})
                </option>
              ))}
            </select>
            {formData.stationId && filteredSubmissions?.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">{commonText.noSubmissionsFoundForStation}</p>
            )}
          </div>

          {/* Obligation Selection (Optional) */}
          <div>
            <label htmlFor="obligationId" className="block text-sm font-medium text-gray-700 mb-2">
              {commonText.relatedObligationOptional}
            </label>
            <select
              id="obligationId"
              name="obligationId"
              value={formData.obligationId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{commonText.noneOption}</option>
              {obligations?.map((obligation) => (
                <option key={obligation.id} value={obligation.id}>
                  {obligation.title}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              {commonText.title} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder={commonText.enterTaskTitlePlaceholder}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              {commonText.taskDescriptionOptional}
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={commonText.enterTaskDescriptionPlaceholder}
            />
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
              {commonText.dueDateOptional}
            </label>
            <input
              type="datetime-local"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Assigned To - We'll leave this out for now since we don't have a users endpoint easily accessible */}
          {/* Can be added later if needed */}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={createTaskMutation.isPending || !formData.stationId || !formData.title.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createTaskMutation.isPending ? commonText.creating : commonText.creatingTask}
            </button>
            <Link
              to="/tasks"
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

