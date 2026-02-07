import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { StatCard } from '../../components/dashboard/StatCard';
import StationsMap from '../../features/stations/StationsMap';
import { ShieldAlert, FileSearch, CheckCircle, AlertTriangle } from 'lucide-react';

export default function CustomsDashboard() {

  // 1. Fetch KPIs
  const { data: kpis } = useQuery({
    queryKey: ['oversight-kpis'],
    queryFn: () => api.get('/oversight/dashboard-kpis').then(res => res.data),
    refetchInterval: 30000 // Refresh every 30s
  });

  // 2. Fetch Risk Map Data
  const { data: riskStations = [] } = useQuery({
    queryKey: ['oversight-risk-map'],
    queryFn: () => api.get('/oversight/risk-map').then(res => res.data)
  });

  // 3. Fetch Audit Queue (Preview)
  const { data: auditQueue = [] } = useQuery({
    queryKey: ['oversight-audit-queue-preview'],
    queryFn: () => api.get('/oversight/audit-queue?limit=5&highRisk=true').then(res => res.data.submissions)
  });

  const stats = kpis?.stats || { totalSubmissions: 0, pendingReview: 0, approved: 0, activeViolations: 0 };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">National Oversight Center</h1>
        <p className="text-gray-500 mt-1">Real-time compliance monitoring and risk auditing</p>
      </div>

      {/* Row 1: KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Active Violations"
          value={stats.activeViolations}
          icon={ShieldAlert}
          iconClassName="text-red-600"
          className="bg-red-50 border-red-100"
          description="Open Sanction Cases"
        />
        <StatCard
          title="Pending Audit"
          value={stats.pendingReview}
          icon={FileSearch}
          iconClassName="text-blue-600"
          description="Submissions pending review"
        />
        <StatCard
          title="Compliance Rate"
          value={stats.totalSubmissions ? Math.round((stats.approved / stats.totalSubmissions) * 100) : 0}
          icon={CheckCircle}
          iconClassName="text-green-600"
          description="% of approved submissions"
        />
        <StatCard
          title="High Risk Stations"
          value={riskStations.filter((s: any) => s.riskScore > 50).length}
          icon={AlertTriangle}
          iconClassName="text-orange-600"
          description="Score > 50"
        />
      </div>

      {/* Row 2: Map & Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">

        {/* Left: Risk Map (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Live Risk Map</h3>
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Live Updates</span>
          </div>
          <div className="flex-1 relative">
            <StationsMap stations={riskStations} />
            {/* Note: StationsMap might need enhancement to colorize pins by riskScore */}
          </div>
        </div>

        {/* Right: Priority Audit Queue (1 col) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Priority Audit Queue</h3>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {auditQueue.length === 0 ? (
              <p className="text-center text-gray-500 text-sm">No high-risk items pending.</p>
            ) : (
              auditQueue.map((item: any) => (
                <div key={item.id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-sm truncate">{item.station.name}</span>
                    <span className="text-xs font-bold text-red-600">Risk: {item.station.riskScore}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{item.company.name}</span>
                    <span>{new Date(item.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
            <button className="w-full text-center text-sm text-blue-600 font-medium mt-2 hover:underline">
              View Full Audit Queue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
