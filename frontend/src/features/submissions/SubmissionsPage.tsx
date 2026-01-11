import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { commonText, translateSubmissionStatus, formatDateGreek } from '../../lib/translations';

export default function SubmissionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['submissions'],
    queryFn: () => api.get('/submissions').then((res) => res.data.submissions),
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{commonText.loadingSubmissions}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{commonText.submissions}</h1>
          <Link
            to="/submissions/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {commonText.createNew} Υποβολή
          </Link>
        </div>

        {data && data.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {commonText.period}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {commonText.station}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {commonText.status}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {commonText.submitted}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {commonText.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((submission: any) => (
                  <tr key={submission.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDateGreek(submission.period.startDate)} -{' '}
                      {formatDateGreek(submission.period.endDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{submission.station.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          submission.status === 'SUBMITTED'
                            ? 'bg-yellow-100 text-yellow-800'
                            : submission.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {translateSubmissionStatus(submission.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {submission.submittedAt
                        ? formatDateGreek(submission.submittedAt)
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/submissions/${submission.id}`}
                        className="text-blue-600 hover:underline"
                      >
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
            <p className="text-gray-500 text-lg mb-4">{commonText.noSubmissions}</p>
            <Link
              to="/submissions/new"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Δημιουργήστε την πρώτη σας υποβολή
            </Link>
          </div>
        )}
    </div>
  );
}

