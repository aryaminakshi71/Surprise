import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '~/components/dashboard/dashboard-layout'
import { FilterPanel, type FilterState } from '~/components/filters/filter-panel'
import { Plus } from 'lucide-react'

export const Route = createFileRoute('/dashboard/spots')({
  component: SpotsPage,
})

function SpotsPage() {
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    type: [],
    search: '',
  })

  const allSpots = [
    { id: 'A-01', zone: 'Zone A', status: 'available', type: 'standard', label: 'A-01' },
    { id: 'A-02', zone: 'Zone A', status: 'occupied', type: 'ev', label: 'A-02' },
    { id: 'B-04', zone: 'Zone B', status: 'reserved', type: 'standard', label: 'B-04' },
    { id: 'B-05', zone: 'Zone B', status: 'available', type: 'compact', label: 'B-05' },
    { id: 'C-01', zone: 'Zone C', status: 'maintenance', type: 'handicap', label: 'C-01' },
    { id: 'C-02', zone: 'Zone C', status: 'available', type: 'standard', label: 'C-02' },
  ]

  // Filter spots
  const filteredSpots = allSpots.filter((spot) => {
    if (filters.status.length > 0 && !filters.status.includes(spot.status)) return false
    if (filters.type.length > 0 && !filters.type.includes(spot.type)) return false
    if (filters.search && !spot.label.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  const statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'reserved', label: 'Reserved' },
    { value: 'maintenance', label: 'Maintenance' },
  ]

  const typeOptions = [
    { value: 'standard', label: 'Standard' },
    { value: 'compact', label: 'Compact' },
    { value: 'ev', label: 'EV Charging' },
    { value: 'handicap', label: 'Handicap' },
  ]

  return (
    <DashboardLayout title="Parking Spots">
      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">
          Showing {filteredSpots.length} of {allSpots.length} spots
        </p>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add Spot
        </button>
      </div>

      <FilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        statusOptions={statusOptions}
        typeOptions={typeOptions}
      />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spot</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSpots.length > 0 ? (
                filteredSpots.map((spot) => (
                  <tr key={spot.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{spot.label}</td>
                    <td className="px-6 py-4 text-gray-600">{spot.zone}</td>
                    <td className="px-6 py-4 text-gray-600 capitalize">{spot.type}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          spot.status === 'available'
                            ? 'bg-green-100 text-green-800'
                            : spot.status === 'reserved'
                              ? 'bg-yellow-100 text-yellow-800'
                              : spot.status === 'occupied'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {spot.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No spots match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
