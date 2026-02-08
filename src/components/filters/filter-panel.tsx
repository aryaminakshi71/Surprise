import { useState } from 'react'
import { Filter, X } from 'lucide-react'

export interface FilterState {
  status: string[]
  type: string[]
  search: string
}

interface FilterPanelProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  statusOptions: { value: string; label: string }[]
  typeOptions: { value: string; label: string }[]
}

export function FilterPanel({
  filters,
  onFiltersChange,
  statusOptions,
  typeOptions,
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleStatus = (status: string) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status]
    onFiltersChange({ ...filters, status: newStatuses })
  }

  const toggleType = (type: string) => {
    const newTypes = filters.type.includes(type)
      ? filters.type.filter((t) => t !== type)
      : [...filters.type, type]
    onFiltersChange({ ...filters, type: newTypes })
  }

  const clearFilters = () => {
    onFiltersChange({ status: [], type: [], search: '' })
  }

  const hasActiveFilters = filters.status.length > 0 || filters.type.length > 0 || filters.search !== ''

  return (
    <div className="mb-6">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
              {filters.status.length + filters.type.length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Content */}
      <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${isOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear all
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              placeholder="Spot number, plate..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(option.value)}
                    onChange={() => toggleStatus(option.value)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="space-y-2">
              {typeOptions.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.type.includes(option.value)}
                    onChange={() => toggleType(option.value)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
