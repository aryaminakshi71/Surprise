import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import {
  BarChart3,
  Bell,
  Car,
  Clock,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  ParkingCircle,
  Settings,
  Users,
  X,
} from 'lucide-react'
import { authClient } from '~/lib/auth/client'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Parking Spots', href: '/dashboard/spots', icon: <ParkingCircle className="w-5 h-5" /> },
  { label: 'Vehicles', href: '/dashboard/vehicles', icon: <Car className="w-5 h-5" /> },
  { label: 'Analytics', href: '/dashboard/analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Users', href: '/dashboard/users', icon: <Users className="w-5 h-5" /> },
  { label: 'Settings', href: '/dashboard/settings', icon: <Settings className="w-5 h-5" /> },
]

export function DashboardLayout({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: session, isPending } = authClient.useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [demoUser, setDemoUser] = useState<any>(null)

  // Check for demo mode
  useEffect(() => {
    const isDemoMode = localStorage.getItem('demo_mode') === 'true'
    if (isDemoMode) {
      const user = localStorage.getItem('user')
      if (user) {
        try {
          setDemoUser(JSON.parse(user))
        } catch {
          // Invalid user data, clear demo mode
          localStorage.removeItem('demo_mode')
          localStorage.removeItem('user')
        }
      }
    }
  }, [])

  useEffect(() => {
    // Skip auth check if in demo mode
    if (demoUser) return
    
    if (!isPending && !session?.user) {
      navigate({ to: '/login', replace: true })
    }
  }, [isPending, navigate, session?.user, demoUser])

  const handleLogout = async () => {
    // Check if demo mode
    if (demoUser) {
      localStorage.removeItem('demo_mode')
      localStorage.removeItem('user')
      localStorage.removeItem('isDemo')
      navigate({ to: '/', replace: true })
      return
    }
    
    await authClient.signOut()
    navigate({ to: '/', replace: true })
  }

  // Show loading only if not in demo mode and auth is pending
  if (!demoUser && (isPending || !session?.user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  // Use demo user or real session user
  const currentUser = demoUser || session?.user

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen ? (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      ) : null}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <Link to="/" className="flex items-center space-x-2 no-underline">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="text-lg font-bold text-white">ParkingPro</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors no-underline ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium bg-indigo-600">
                {currentUser?.name?.charAt(0) || currentUser?.firstName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {currentUser?.name || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || currentUser?.email?.split('@')[0]}
                </p>
                <p className="text-gray-400 text-sm truncate">{currentUser?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600 hover:text-gray-900">
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900 relative">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-600 rounded-full" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

export const dashboardStats = [
  { label: 'Total Spots', value: '150', change: 'Available: 45', icon: <ParkingCircle className="w-6 h-6" /> },
  { label: 'Active Vehicles', value: '105', change: '+8 today', icon: <Car className="w-6 h-6" /> },
  { label: 'Avg. Duration', value: '2.5 hrs', change: '+15 min', icon: <Clock className="w-6 h-6" /> },
  { label: 'Revenue Today', value: '$1,234', change: '+12%', icon: <DollarSign className="w-6 h-6" /> },
]
