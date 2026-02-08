import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '~/components/dashboard/dashboard-layout'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react'

export const Route = createFileRoute('/dashboard/analytics')({
  component: AnalyticsPage,
})

// Sample data for charts
const occupancyData = [
  { time: '6AM', occupied: 12, available: 88 },
  { time: '9AM', occupied: 75, available: 25 },
  { time: '12PM', occupied: 92, available: 8 },
  { time: '3PM', occupied: 68, available: 32 },
  { time: '6PM', occupied: 45, available: 55 },
  { time: '9PM', occupied: 18, available: 82 },
]

const revenueByLot = [
  { name: 'Downtown', revenue: 4560 },
  { name: 'Airport', revenue: 8920 },
  { name: 'Mall', revenue: 3240 },
]

const spotTypeDistribution = [
  { name: 'Standard', value: 120, color: '#6366f1' },
  { name: 'Compact', value: 45, color: '#8b5cf6' },
  { name: 'EV Charging', value: 30, color: '#10b981' },
  { name: 'Handicap', value: 30, color: '#f59e0b' },
]

const weeklyTrends = [
  { day: 'Mon', vehicles: 145, revenue: 2890 },
  { day: 'Tue', vehicles: 152, revenue: 3040 },
  { day: 'Wed', vehicles: 148, revenue: 2960 },
  { day: 'Thu',  vehicles: 165, revenue: 3300 },
  { day: 'Fri', vehicles: 178, revenue: 3560 },
  { day: 'Sat', vehicles: 142, revenue: 2840 },
  { day: 'Sun', vehicles: 125, revenue: 2500 },
]

function AnalyticsPage() {
  return (
    <DashboardLayout title="Analytics">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Avg Occupancy"
          value="78%"
          change="+5.2%"
          icon={<Activity className="w-5 h-5" />}
          trend="up"
        />
        <MetricCard
          title="Daily Vehicles"
          value="145"
          change="+12"
          icon={<Users className="w-5 h-5" />}
          trend="up"
        />
        <MetricCard
          title="Daily Revenue"
          value="$2,890"
          change="+8.4%"
          icon={<DollarSign className="w-5 h-5" />}
          trend="up"
        />
        <MetricCard
          title="Peak Hour"
          value="12 PM"
          change="92% full"
          icon={<TrendingUp className="w-5 h-5" />}
          trend="neutral"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Occupancy Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Occupancy Trend (Today)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={occupancyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="occupied" stroke="#6366f1" strokeWidth={2} />
              <Line type="monotone" dataKey="available" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Location */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Location</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByLot}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Bar dataKey="revenue" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spot Type Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spot Types</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={spotTypeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {spotTypeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Trends */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" orientation="left" stroke="#6366f1" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="vehicles" fill="#6366f1" name="Vehicles" />
              <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  )
}

function MetricCard({ title, value, change, icon, trend }: {
  title: string
  value: string
  change: string
  icon: React.ReactNode
  trend: 'up' | 'down' | 'neutral'
}) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
          {icon}
        </div>
        <span className={`text-sm font-medium ${trendColor}`}>{change}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
      <p className="text-sm text-gray-600 mt-1">{title}</p>
    </div>
  )
}

