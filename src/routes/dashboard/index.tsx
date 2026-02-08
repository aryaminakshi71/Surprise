import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Car, Activity, TrendingUp, DollarSign } from 'lucide-react'
import { DashboardLayout } from '~/components/dashboard/dashboard-layout'
import { parking } from '~/lib/api/client'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  // Check if demo mode
  const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('demo_mode') === 'true'

  // Fetch real stats from API (skip if demo mode)
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['parking', 'stats'],
    queryFn: () => parking.stats(),
    enabled: !isDemoMode,
  })

  // Show error toast if API fails
  if (error && !isDemoMode) {
    toast.error('Failed to load dashboard stats')
  }

  // Demo data fallback
  const displayStats = isDemoMode || !stats ? {
    totalSpots: 150,
    availableSpots: 45,
    occupiedSpots: 105,
    activeVehicles: 105,
    revenueToday: 0,
  } : stats

  const statsCards = [
    {
      label: 'Total Spots',
      value: displayStats.totalSpots,
      change: `${displayStats.availableSpots} available`,
      icon: <Activity className="w-6 h-6" />,
      color: 'indigo',
    },
    {
      label: 'Occupied',
      value: displayStats.occupiedSpots,
      change: `${Math.round((displayStats.occupiedSpots / displayStats.totalSpots) * 100)}% occupancy`,
      icon: <Car className="w-6 h-6" />,
      color: 'purple',
    },
    {
      label: 'Active Vehicles',
      value: displayStats.activeVehicles,
      change: isDemoMode ? '+8 today' : `${displayStats.activeVehicles} total`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'blue',
    },
    {
      label: 'Revenue Today',
      value: `$${(displayStats.revenueToday / 100).toFixed(0)}`,
      change: isDemoMode ? '+12%' : 'Today',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'green',
    },
  ]

  return (
    <DashboardLayout title="Dashboard">
      {isLoading && !isDemoMode ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center text-${stat.color}-600`}>
                    {stat.icon}
                  </div>
                  <span className={`text-${stat.color}-600 text-sm font-medium`}>{stat.change}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-600 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Entries</h2>
          <div className="space-y-4">
            {[
              { plate: 'ABC-1234', spot: 'A-12', time: '10 min ago', status: 'Parked' },
              { plate: 'XYZ-5678', spot: 'B-05', time: '25 min ago', status: 'Parked' },
              { plate: 'DEF-9012', spot: 'C-18', time: '45 min ago', status: 'Parked' },
            ].map((entry) => (
              <div key={entry.plate} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{entry.plate}</p>
                    <p className="text-sm text-gray-500">
                      Spot {entry.spot} - {entry.time}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                  {entry.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Parking Zones</h2>
          <div className="space-y-4">
            {[
              { zone: 'Zone A', total: 50, occupied: 42, revenue: '$456' },
              { zone: 'Zone B', total: 50, occupied: 38, revenue: '$389' },
              { zone: 'Zone C', total: 50, occupied: 25, revenue: '$278' },
            ].map((zone) => (
              <div key={zone.zone} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{zone.zone}</p>
                  <p className="text-sm text-gray-500">
                    {zone.occupied}/{zone.total} spots occupied
                  </p>
                </div>
                <span className="text-indigo-600 font-medium">{zone.revenue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
        </>
      )}
    </DashboardLayout>
  )
}
