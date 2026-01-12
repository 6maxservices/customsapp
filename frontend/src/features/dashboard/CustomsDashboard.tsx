import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Building2, AlertTriangle, FileText, CheckCircle, Search, ArrowRight } from 'lucide-react';
import { StatCard } from '../../components/dashboard/StatCard';
import StationsMap from '../../features/stations/StationsMap';
import ReviewQueueWidget from '../../components/dashboard/ReviewQueueWidget';

export default function CustomsDashboard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'ALL' | 'HIGH_RISK'>('ALL');
  const [companySearch, setCompanySearch] = useState('');

  // Fetch ALL stations with safety check
  const { data: stations = [], isLoading: isLoadingStations, error: stationsError } = useQuery({
    queryKey: ['stations', 'all'],
    queryFn: () => api.get('/stations').then((res) => {
      return Array.isArray(res.data.stations) ? res.data.stations : [];
    }),
  });

  // Fetch Pending Submissions
  const { data: submissions = [], isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['submissions', 'pending'],
    queryFn: () => api.get('/submissions?status=SUBMITTED').then((res) => {
      return Array.isArray(res.data.submissions) ? res.data.submissions : [];
    }),
  });

  // Fetch Companies
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.get('/companies').then(res => res.data.companies || [])
  });

  const metrics = useMemo(() => {
    if (!Array.isArray(stations)) return { totalStations: 0, highRisk: 0, pendingReviews: 0, avgAuditTime: 0 };
    const totalStations = stations.length;
    const highRisk = stations.filter((s: any) => (s.riskScore && s.riskScore > 70) || s.isActive === false).length;
    const pendingReviews = Array.isArray(submissions) ? submissions.length : 0;
    const avgAuditTime = 2.4;

    return { totalStations, highRisk, pendingReviews, avgAuditTime };
  }, [stations, submissions]);

  const mapStations = useMemo(() => {
    if (!Array.isArray(stations)) return [];
    if (filter === 'HIGH_RISK') {
      return stations.filter((s: any) => (s.riskScore && s.riskScore > 70) || s.isActive === false);
    }
    return stations;
  }, [stations, filter]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((c: any) =>
      c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
      c.taxId.includes(companySearch)
    );
  }, [companies, companySearch]);

  // Loading State
  if (isLoadingStations || isLoadingSubmissions) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (stationsError) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-lg border border-red-100 m-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-900">System Error</h3>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-white border border-red-200 text-red-700 rounded shadow-sm">Retry</button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* --- Section 1: National Oversight --- */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">National Control Center</h1>
          <p className="text-gray-500 mt-1">Oversight & Compliance Monitoring</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Pending Reviews" value={metrics.pendingReviews} icon={FileText} iconClassName="text-blue-600" className="bg-blue-50/50" />
          <StatCard title="High Risk Stations" value={metrics.highRisk} icon={AlertTriangle} iconClassName="text-red-600" className="bg-red-50/50" />
          <StatCard title="Avg Audit Time" value={`${metrics.avgAuditTime} days`} icon={CheckCircle} />
          <StatCard title="Total Network" value={metrics.totalStations} icon={Building2} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[500px]">
            <ReviewQueueWidget submissions={Array.isArray(submissions) ? submissions : []} />
          </div>
          <div className="h-[500px] bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-900">National Risk Map</h3>
              <div className="flex gap-2">
                <button onClick={() => setFilter('ALL')} className={`text-xs px-2 py-1 rounded ${filter === 'ALL' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-gray-500 hover:bg-gray-100'}`}>All</button>
                <button onClick={() => setFilter('HIGH_RISK')} className={`text-xs px-2 py-1 rounded ${filter === 'HIGH_RISK' ? 'bg-red-100 text-red-700 font-bold' : 'text-gray-500 hover:bg-gray-100'}`}>High Risk</button>
              </div>
            </div>
            <div className="flex-1 relative">
              <StationsMap stations={mapStations} />
            </div>
          </div>
        </div>
      </div>

      {/* --- Section 2: Company Registry --- */}
      <div className="border-t border-gray-200 pt-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Registered Companies</h2>
            <p className="text-gray-500 mt-1">Select a company to view their compliance dashboard</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search company..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full md:w-64"
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company: any) => (
            <div
              key={company.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer p-6 group"
              onClick={() => navigate(`/companies/${company.id}/dashboard`)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-600">
                  {company.taxId}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {company.name}
              </h3>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                <span className="text-gray-500">View Dashboard</span>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1" />
              </div>
            </div>
          ))}
          {filteredCompanies.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No companies found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
