import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../auth/AuthContext';
import { commonText, formatDateGreek } from '../../lib/translations';
import TasksQueuePage from './TasksQueuePage';
import { StatusBadge, SeverityBadge, TypeBadge } from './components/TaskBadges';

export default function TasksPage() {
  const { user } = useAuth();

  const isCustomsUser = user?.role.startsWith('CUSTOMS_') || user?.role === 'SYSTEM_ADMIN';

  // For Customs Users, we render the specialized Action Queue
  if (isCustomsUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TasksQueuePage />
      </div>
    );
  }

  // COMPANY VIEW (My Tasks)
  const { data, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then((res) => res.data.tasks),
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{commonText.loadingTasks}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{commonText.tasks}</h1>
          <p className="text-gray-500 mt-1">Actions & Sanctions requiring your attention</p>
        </div>
      </div>

      {data && data.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type / Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{commonText.station}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Complexity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{commonText.status}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{commonText.dueDate}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{commonText.actions}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((task: any) => (
                <tr key={task.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <TypeBadge type={task.type || 'ACTION'} />
                    </div>
                    <div className="text-sm font-medium text-gray-900">{task.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.station?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <SeverityBadge severity={task.severity || 'MAJOR'} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.dueDate ? formatDateGreek(task.dueDate) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/tasks/${task.id}`} className="text-blue-600 hover:text-blue-900 font-medium">
                      {commonText.view}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">{commonText.noTasks}</p>
        </div>
      )}
    </div>
  );
}


