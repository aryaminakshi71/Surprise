import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '~/components/dashboard/dashboard-layout'

export const Route = createFileRoute('/dashboard/vehicles')({
  component: VehiclesPage,
})

function VehiclesPage() {
  const vehicles = [
    { plate: 'ABC-1234', owner: 'John Doe', status: 'Parked', spot: 'A-12' },
    { plate: 'XYZ-5678', owner: 'Jane Smith', status: 'Reserved', spot: 'B-05' },
    { plate: 'DEF-9012', owner: 'Michael Chen', status: 'Exited', spot: 'C-18' },
  ]

  return (
    <DashboardLayout title="Vehicles">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spot</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {vehicles.map((vehicle) => (
              <tr key={vehicle.plate}>
                <td className="px-6 py-4 font-medium text-gray-900">{vehicle.plate}</td>
                <td className="px-6 py-4 text-gray-600">{vehicle.owner}</td>
                <td className="px-6 py-4 text-gray-600">{vehicle.spot}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vehicle.status === 'Parked'
                        ? 'bg-green-100 text-green-800'
                        : vehicle.status === 'Reserved'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {vehicle.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}
