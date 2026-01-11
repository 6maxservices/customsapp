import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Building2, AlertTriangle, FileText, CheckCircle } from 'lucide-react';
import { StatCard } from '../../components/dashboard/StatCard';
import StationsMap from '../../features/stations/StationsMap';
import ReviewQueueWidget from '../../components/dashboard/ReviewQueueWidget';

export default function CustomsDashboard() {
  const [filter, setFilter] = useState<'ALL' | 'HIGH_RISK'>('ALL');

  // Fetch ALL stations with safety check
  const { data: stations = [], isLoading: isLoadingStations, error: stationsError } = useQuery({
    queryKey: ['stations', 'all'],
    queryFn: () => api.get('/stations').then((res) => {
      return Array.isArray(res.data.stations) ? res.data.stations : [];
    }),
  });

  // Fetch Pending Submissions with safety check
  const { data: submissions = [], isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['submissions', 'pending'],
    queryFn: () => api.get('/submissions?status=SUBMITTED').then((res) => {
      return Array.isArray(res.data.submissions) ? res.data.submissions : [];
    }),
  });

  const metrics = useMemo(() => {
    // Safety check for stations array
    if (!Array.isArray(stations)) return { totalStations: 0, highRisk: 0, pendingReviews: 0, avgAuditTime: 0 };

    const totalStations = stations.length;
    // Safe access to attributes: riskScore might be missing on type, use isActive as proxy for now if needed or cast
    const highRisk = stations.filter((s: any) => (s.riskScore && s.riskScore > 70) || s.isActive === false).length;
    const pendingReviews = Array.isArray(submissions) ? submissions.length : 0;
    const avgAuditTime = 2.4; // Mock value

    return { totalStations, highRisk, pendingReviews, avgAuditTime };
  }, [stations, submissions]);

  const mapStations = useMemo(() => {
    if (!Array.isArray(stations)) return [];
    if (filter === 'HIGH_RISK') {
      return stations.filter((s: any) => (s.riskScore && s.riskScore > 70) || s.isActive === false);
    }
    return stations;
  }, [stations, filter]);

  // Loading State
  if (isLoadingStations || isLoadingSubmissions) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 font-medium">Loading National Control Center...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (stationsError) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-lg border border-red-100 m-8">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-red-900">System Error</h3>
        <p className="text-red-700 mt-2">Could not retrieve national station network data.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-white border border-red-200 text-red-700 rounded-md hover:bg-red-50 font-medium shadow-sm transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">National Control Center</h1>
        <p className="text-gray-500 mt-1">Oversight & Compliance Monitoring</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Reviews"
          value={metrics.pendingReviews}
          icon={FileText}
          iconClassName="text-blue-600"
          className="bg-blue-50/50 ring-1 ring-blue-100"
        />
        <StatCard
          title="High Risk Stations"
          value={metrics.highRisk}
          icon={AlertTriangle}
          iconClassName="text-red-600"
          trend={{ value: 5, label: 'new alerts', positive: false }}
          className="bg-red-50/50 ring-1 ring-red-100"
        />
        <StatCard
          title="Avg Audit Time"
          value={`${metrics.avgAuditTime} days`}
          icon={CheckCircle}
          trend={{ value: 12, label: 'faster vs last month', positive: true }}
        />
        <StatCard
          title="Total Network"
          value={metrics.totalStations}
          icon={Building2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Priority Review Queue (2/3 width) */}
        <div className="lg:col-span-2 h-[500px]">
          {/* Ensure ReviewQueueWidget receives an array */}
          <ReviewQueueWidget submissions={Array.isArray(submissions) ? submissions : []} />
        </div>

        {/* Right: National Risk Map (1/3 width) */}
        <div className="h-[500px] bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-semibold text-gray-900">National Risk Map</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('ALL')}
                className={`text-xs px-2 py-1 rounded transition-colors ${filter === 'ALL' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-gray-500 hover:bg-gray-100'}`}
              >All</button>
              <button
                onClick={() => setFilter('HIGH_RISK')}
                className={`text-xs px-2 py-1 rounded transition-colors ${filter === 'HIGH_RISK' ? 'bg-red-100 text-red-700 font-bold' : 'text-gray-500 hover:bg-gray-100'}`}
              >High Risk</button>
            </div>
          </div>
          <div className="flex-1 relative">
            <StationsMap stations={mapStations} />
          </div>
        </div>
      </div>
    </div>
  );
}
