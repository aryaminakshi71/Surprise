import React from 'react'

type ChartPoint = { name: string; value: number }

export function AnalyticsChart({ data }: { data: ChartPoint[] }) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Activity This Week</h2>
      <div className="flex items-end gap-4 h-64">
        {data.map((day) => (
          <div key={day.name} className="flex-1 flex flex-col items-center">
            <div className="w-full flex flex-col items-center">
              <div
                className="w-full bg-indigo-600 rounded-t"
                style={{ height: `${(day.value / maxValue) * 200}px` }}
              />
              <span className="text-xs text-gray-600 mt-2">{day.value}</span>
            </div>
            <span className="text-xs text-gray-500 mt-2">{day.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AnalyticsChart
