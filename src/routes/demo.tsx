import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Car, Play, Sparkles } from 'lucide-react'

export const Route = createFileRoute('/demo')({
  component: DemoPage,
})

const features = [
  'Full access to all features',
  'Sample parking lot data pre-loaded',
  'No credit card required',
  'Demo resets after 24 hours',
]

function DemoPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleStartDemo = async () => {
    setIsLoading(true)

    const demoUser = {
      id: `demo-user-${Date.now()}`,
      email: 'demo@parkingpro.com',
      firstName: 'Demo',
      lastName: 'User',
      role: 'admin',
      isDemo: true,
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem('user', JSON.stringify(demoUser))
    localStorage.setItem('isDemo', 'true')
    localStorage.setItem('demo_mode', 'true')

    setTimeout(() => {
      navigate({ to: '/dashboard' })
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2 no-underline">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ParkingPro</span>
            </Link>
            <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 no-underline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-indigo-100">
              <Sparkles className="w-8 h-8 text-indigo-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Try ParkingPro Demo</h1>
            <p className="text-gray-600 text-center mb-8">Experience smart parking management</p>

            <div className="space-y-3 mb-8">
              {features.map((feature) => (
                <div key={feature} className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleStartDemo}
              disabled={isLoading}
              className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 bg-indigo-600"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Starting Demo...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start Demo
                </>
              )}
            </button>

            <p className="text-center text-gray-600 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-600 no-underline hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
