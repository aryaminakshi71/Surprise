import { Link, useLocation } from '@tanstack/react-router'
import { LayoutDashboard, ParkingCircle, Car, BarChart3, Home } from 'lucide-react'

const navItems = [
  { label: 'Home', href: '/', icon: <Home className="w-5 h-5" /> },
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Reserve', href: '/reserve', icon: <ParkingCircle className="w-5 h-5" /> },
  { label: 'Vehicles', href: '/dashboard/vehicles', icon: <Car className="w-5 h-5" /> },
  { label: 'Analytics', href: '/dashboard/analytics', icon: <BarChart3 className="w-5 h-5" /> },
]

export function MobileNav() {
  const location = useLocation()

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 no-underline transition-colors ${
                isActive
                  ? 'text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className={`${isActive ? 'scale-110' : 'scale-100'} transition-transform`}>
                {item.icon}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
