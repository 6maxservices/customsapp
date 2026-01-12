import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthContext';
import api from '../../lib/api';
import { commonText } from '../../lib/translations';
import { Plus, X, LayoutGrid, List as ListIcon, Map as MapIcon, Download, SlidersHorizontal, Sliders } from 'lucide-react';
import { Link } from 'react-router-dom';
import StationCard from './StationCard';
import SmartFilter, { FilterState } from '../../components/SmartFilter';
import StationsMap from './StationsMap';

export default function StationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('grid');
  const [selectedStations, setSelectedStations] = useState<Set<string>>(new Set());

  const isCustomsUser = user?.role.startsWith('CUSTOMS_') || user?.role === 'SYSTEM_ADMIN';

  // Filter State
  const [filters, setFilters] = useState<FilterState & { company: string, risk: string }>({
    search: '',
    status: 'ALL',
    region: '',
    company: '',
    risk: 'ALL'
  });

  // Create Station Form
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    amdika: '',
    installationType: '',
    lat: '',
    lng: ''
  });

  const { data: stations = [], isLoading } = useQuery({
    queryKey: ['stations'],
    queryFn: () => api.get('/stations').then((res) => res.data.stations),
  });

  const createMutation = useMutation({
    mutationFn: (newStation: any) => api.post('/stations', newStation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stations'] });
      setIsModalOpen(false);
      setFormData({ name: '', address: '', amdika: '', installationType: '', lat: '', lng: '' });
    },
    onError: (error) => {
      alert('Failed to create station.');
      console.error(error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.companyId) return;
    createMutation.mutate({
      ...formData,
      companyId: user.companyId,
      lat: formData.lat ? parseFloat(formData.lat) : null,
      lng: formData.lng ? parseFloat(formData.lng) : null
    });
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/stations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stations'] });
      setSelectedStations(new Set());
    }
  });

  // --- Filter Logic ---
  const filteredStations = useMemo(() => {
    if (!stations) return [];
    return stations.filter((s: any) => {
      // 1. Search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const match = s.name.toLowerCase().includes(q) ||
          s.amdika?.toLowerCase().includes(q) ||
          s.address?.toLowerCase().includes(q);
        if (!match) return false;
      }
      // 2. Status
      if (filters.status !== 'ALL') {
        const isCompliant = s.compliance?.status === 'COMPLIANT';
        if (filters.status === 'COMPLIANT' && !isCompliant) return false;
        if (filters.status === 'NON_COMPLIANT' && isCompliant) return false;
      }
      // 3. Region
      if (filters.region) {
        const region = (s.city || s.prefecture || '').trim();
        if (region !== filters.region) return false;
      }
      // 4. Company (Customs Only)
      if (filters.company) {
        if (!s.company?.name?.toLowerCase().includes(filters.company.toLowerCase())) return false;
      }
      // 5. Risk
      if (filters.risk !== 'ALL') {
        // Mock risk logic: 'HIGH' if !isActive or non-compliant, 'LOW' otherwise
        const isHighRisk = !s.isActive || s.compliance?.status !== 'COMPLIANT';
        if (filters.risk === 'HIGH' && !isHighRisk) return false;
        if (filters.risk === 'LOW' && isHighRisk) return false;
      }
      return true;
    });
  }, [stations, filters]);

  // Extract unique regions for filter
  const availableRegions = useMemo(() => {
    if (!stations) return [];
    const regions = new Set<string>();
    stations.forEach((s: any) => {
      if (s.city) regions.add(s.city.trim());
      if (s.prefecture) regions.add(s.prefecture.trim());
    });
    return Array.from(regions).sort();
  }, [stations]);

  // Bulk Selection
  const toggleSelection = (id: string, isSelected: boolean) => {
    const next = new Set(selectedStations);
    if (isSelected) next.add(id);
    else next.delete(id);
    setSelectedStations(next);
  };

  const handleBulkAction = (action: string) => {
    // In a real app, this would call an API
    alert(`Simulation: Bulk action '${action}' triggered for ${selectedStations.size} stations.`);
    setSelectedStations(new Set()); // clear after action
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isCustomsUser ? 'w-full' : 'max-w-7xl'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{isCustomsUser ? 'Global Station Registry' : commonText.stations}</h1>
          <p className="text-gray-500 mt-1">{filteredStations.length} stations found based on criteria.</p>
        </div>

        <div className="flex gap-2">
          {selectedStations.size > 0 && (
            <div className="flex items-center gap-2 mr-4 bg-blue-50 px-3 py-1 rounded-md border border-blue-100 animate-in fade-in transition-all">
              <span className="text-sm font-medium text-blue-700">{selectedStations.size} Selected</span>
              <button onClick={() => handleBulkAction('export')} className="p-1.5 hover:bg-blue-200 rounded text-blue-700" title="Export Data">
                <Download className="h-4 w-4" />
              </button>
              <button onClick={() => handleBulkAction('assign_task')} className="p-1.5 hover:bg-blue-200 rounded text-blue-700" title="Assign Generic Task">
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>
          )}

          {(user?.role === 'COMPANY_ADMIN' || user?.role === 'SYSTEM_ADMIN') && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Add Station</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="space-y-4 mb-4">
        <SmartFilter onFilterChange={(f) => setFilters(prev => ({ ...prev, ...f }))} availableRegions={availableRegions} />

        {/* Extended Filters for Customs */}
        {isCustomsUser && (
          <div className="flex gap-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100 items-center">
            <span className="text-sm font-bold text-blue-900 flex items-center gap-2">
              <Sliders className="h-4 w-4" /> Auditor Filters:
            </span>
            <input
              type="text"
              placeholder="Filter by Company..."
              className="px-3 py-1 text-sm border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              value={filters.company}
              onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
            />
            <select
              className="px-3 py-1 text-sm border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={filters.risk}
              onChange={(e) => setFilters(prev => ({ ...prev, risk: e.target.value }))}
            >
              <option value="ALL">All Risk Levels</option>
              <option value="HIGH">High Risk Only</option>
              <option value="LOW">Low Risk / Compliant</option>
            </select>
          </div>
        )}
      </div>

      {/* View Toggles */}
      <div className="flex justify-end items-center mb-4">
        <div className="inline-flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            title="List View"
          >
            <ListIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            title="Grid View"
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-md transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            title="Map View"
          >
            <MapIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {filteredStations.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">No stations found matching your filters.</p>
            <button onClick={() => setFilters({ search: '', status: 'ALL', region: '', company: '', risk: 'ALL' })} className="text-blue-600 mt-2 font-medium">Clear Filters</button>
          </div>
        ) : (
          <>
            {/* LIST VIEW */}
            {viewMode === 'list' && (
              <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 w-8">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) setSelectedStations(new Set(filteredStations.map((s: any) => s.id)));
                            else setSelectedStations(new Set());
                          }}
                          checked={filteredStations.length > 0 && selectedStations.size === filteredStations.length}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Station</th>
                      {isCustomsUser && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Badges</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStations.map((station: any) => (
                      <tr key={station.id} className={`hover:bg-gray-50 ${selectedStations.has(station.id) ? 'bg-blue-50' : ''}`}>
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedStations.has(station.id)}
                            onChange={(e) => toggleSelection(station.id, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{station.name}</div>
                          <div className="text-xs text-gray-500 font-mono">{station.amdika || '-'}</div>
                        </td>
                        {isCustomsUser && (
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-blue-900">
                              {station.company?.name || 'Unknown Co.'}
                            </div>
                            <div className="text-xs text-gray-500">{station.company?.taxId || 'AFM: -'}</div>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{station.city || station.prefecture || '-'}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]" title={station.address}>{station.address}</div>
                        </td>
                        <td className="px-6 py-4">
                          {station.compliance?.status === 'COMPLIANT' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></div>
                              Compliant
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <div className="h-1.5 w-1.5 rounded-full bg-red-500 mr-1.5"></div>
                              Non-Compliant
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {station.compliance?.badges?.map((b: string) => (
                              <span key={b} className="px-2 py-0.5 text-xs bg-orange-100 text-orange-800 rounded border border-orange-200">
                                {b === 'PENDING_REPORT' ? 'Pending Report' : b}
                              </span>
                            ))}
                            {(!station.compliance && station._count?.tasks > 0) && (
                              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">Legacy Tasks</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Link to={`/stations/${station.slug || station.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-900">
                            {isCustomsUser ? 'Audit Station' : 'View Details'}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}



            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStations.map((station: any) => (
                  <StationCard
                    key={station.id}
                    station={station}
                    selected={selectedStations.has(station.id)}
                    onSelect={toggleSelection}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
              </div>
            )}

            {/* MAP VIEW */}
            {viewMode === 'map' && (
              <StationsMap stations={filteredStations} />
            )}
          </>
        )}
      </div>

      {/* Create Station Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl scale-100 transition-transform">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-bold text-gray-900">Προσθήκη Νέου Πρατηρίου</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Όνομα Πρατηρίου *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="π.χ. Πρατήριο Αττικής 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Διεύθυνση</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Οδός, Αριθμός, Πόλη"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">AMDIKA</label>
                  <input
                    type="text"
                    value={formData.amdika}
                    onChange={e => setFormData({ ...formData, amdika: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Τύπος</label>
                  <input
                    type="text"
                    value={formData.installationType}
                    onChange={e => setFormData({ ...formData, installationType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lat}
                    onChange={e => setFormData({ ...formData, lat: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="e.g. 37.9838"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lng}
                    onChange={e => setFormData({ ...formData, lng: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="e.g. 23.7275"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Ακύρωση
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium shadow-sm transition-colors"
                >
                  {createMutation.isPending ? 'Αποθήκευση...' : 'Δημιουργία'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
