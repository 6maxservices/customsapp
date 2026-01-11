import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Building2, CheckCircle, AlertCircle, Clock, Calendar } from 'lucide-react';
import { getCurrentPeriod, getLastCompletedPeriod, PeriodInfo } from '../../lib/periods';

// Components
import { StatCard } from '../../components/dashboard/StatCard';
import ComplianceChart from '../../components/dashboard/ComplianceChart';
import TaskListWidget from '../../components/dashboard/TaskListWidget';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import StationsMap from '../../features/stations/StationsMap';

export default function CompanyDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodInfo>(getLastCompletedPeriod());
  const [chartFilter, setChartFilter] = useState<'ALL' | 'COMPLIANT' | 'NON_COMPLIANT'>('ALL');

  // Fetch Data
  const { data: stations = [] } = useQuery({
    queryKey: ['stations'],
    queryFn: () => api.get('/stations').then((res) => res.data.stations),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then((res) => res.data.tasks),
  });

  // Since we don't have a real API for historical snapshots per period yet,
  // we will simulate the "Period Filter" by assuming the current status is relevant 
  // but logically we would filter `submissions` by periodId.
  // For the MVP demonstration of the UI, we use the current station compliance status.

  // BI Metrics Calculation
  const metrics = useMemo(() => {
    const total = stations.length;
    const compliant = stations.filter((s: any) => s.compliance?.status === 'COMPLIANT').length;
    const nonCompliant = stations.filter((s: any) => s.compliance?.status !== 'COMPLIANT').length;
    const pendingTasks = tasks.filter((t: any) => t.status === 'OPEN').length;

    return { total, compliant, nonCompliant, pendingTasks };
  }, [stations, tasks]);

  // Filtered Stations for Map & List (based on Chart interaction)
  const filteredStations = useMemo(() => {
    let result = stations;
    if (chartFilter === 'COMPLIANT') {
      result = result.filter((s: any) => s.compliance?.status === 'COMPLIANT');
    } else if (chartFilter === 'NON_COMPLIANT') {
      result = result.filter((s: any) => s.compliance?.status !== 'COMPLIANT');
    }
    return result;
  }, [stations, chartFilter]);

  return (
    <div className="w-full space-y-6">

      {/* Top Bar: Title & Global Period Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Πίνακας Ελέγχου Εταιρείας</h1>
          <p className="text-gray-500 mt-1">Επισκόπηση συμμόρφωσης και εργασιών</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm">
          <Calendar className="h-5 w-5 text-gray-500 ml-2" />
          <select
            className="bg-transparent border-none text-sm font-semibold text-gray-700 focus:ring-0 cursor-pointer"
            value={selectedPeriod.label}
            onChange={(e) => {
              // In a real app, looking up period by label is fragile, best to use ID. 
              // Creating a dummy switch for demo purposes or just resetting to current/last.
              if (e.target.value.includes('Current')) setSelectedPeriod(getCurrentPeriod());
              else setSelectedPeriod(getLastCompletedPeriod());
            }}
          >
            <option value={getLastCompletedPeriod().label}>{getLastCompletedPeriod().label} (Completed)</option>
            <option value={getCurrentPeriod().label}>{getCurrentPeriod().label} (Current)</option>
          </select>
        </div>
      </div>

      {/* Row 1: BI Metrics (StatCards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Stations"
          value={metrics.total}
          icon={Building2}
          trend={{ value: 0, label: 'Stable', positive: true }}
        />
        <StatCard
          title="Compliant"
          value={metrics.compliant}
          icon={CheckCircle}
          iconClassName="text-green-500"
          description={`${((metrics.compliant / (metrics.total || 1)) * 100).toFixed(0)}% Rate`}
        />
        <StatCard
          title="Non-Compliant"
          value={metrics.nonCompliant}
          icon={AlertCircle}
          iconClassName="text-red-500"
          trend={{ value: 12, label: 'vs last period', positive: false }}
        />
        <StatCard
          title="Pending Actions"
          value={metrics.pendingTasks}
          icon={Clock}
          iconClassName="text-orange-500"
          className="ring-1 ring-orange-100 bg-orange-50/30"
        />
      </div>

      {/* Row 2: The 2x2 Grid (Middle Section) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: Compliance Chart (Interactive) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex flex-col h-[450px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Compliance Overview</h3>
            <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded-full text-gray-600">
              {selectedPeriod.label}
            </span>
          </div>
          <div className="flex-1 min-h-0">
            <ComplianceChart
              data={{ compliant: metrics.compliant, nonCompliant: metrics.nonCompliant }}
              activeFilter={chartFilter}
              onFilterChange={setChartFilter}
            />
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            Click a slice to filter the map below
          </p>
        </div>

        {/* Right: Widgets (Stacked) */}
        <div className="flex flex-col gap-6 h-[450px]">
          <div className="flex-1 min-h-0">
            <TaskListWidget />
          </div>
          <div className="flex-1 min-h-0">
            <ActivityFeed />
          </div>
        </div>
      </div>

      {/* Row 3: Map View */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-1 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-semibold text-gray-900">Geographic Distribution</h3>
          {chartFilter !== 'ALL' && (
            <button
              onClick={() => setChartFilter('ALL')}
              className="text-xs text-blue-600 font-medium hover:underline"
            >
              Clear Map Filter
            </button>
          )}
        </div>
        <div className="h-[400px] relative">
          <StationsMap stations={filteredStations} />
        </div>
      </div>

    </div>
  );
}
