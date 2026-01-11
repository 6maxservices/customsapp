import React from 'react';
import { Search, X } from 'lucide-react';

export interface FilterState {
    search: string;
    status: 'ALL' | 'COMPLIANT' | 'NON_COMPLIANT';
    region: string; // '' for all
}

interface SmartFilterProps {
    onFilterChange: (filters: FilterState) => void;
    availableRegions: string[];
}

export default function SmartFilter({ onFilterChange, availableRegions }: SmartFilterProps) {
    const [filters, setFilters] = React.useState<FilterState>({
        search: '',
        status: 'ALL',
        region: ''
    });

    const handleChange = (key: keyof FilterState, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const reset = { search: '', status: 'ALL', region: '' } as FilterState;
        setFilters(reset);
        onFilterChange(reset);
    };

    const hasActiveFilters = filters.status !== 'ALL' || filters.region !== '' || filters.search !== '';

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
                {/* Search */}
                <div className="relative flex-1 w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                        placeholder="Search stations, AMDIKA, or address..."
                        value={filters.search}
                        onChange={(e) => handleChange('search', e.target.value)}
                    />
                </div>

                {/* Status Filter */}
                <div className="w-full md:w-auto">
                    <select
                        value={filters.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="COMPLIANT">✅ Compliant</option>
                        <option value="NON_COMPLIANT">❌ Non-Compliant</option>
                    </select>
                </div>

                {/* Region Filter */}
                <div className="w-full md:w-auto">
                    <select
                        value={filters.region}
                        onChange={(e) => handleChange('region', e.target.value)}
                        className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option value="">All Regions</option>
                        {availableRegions.map(r => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap"
                    >
                        <X className="h-4 w-4 mr-1" />
                        Clear Filters
                    </button>
                )}
            </div>
        </div>
    );
}
