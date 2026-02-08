import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { ArrowLeft, Car, Lock, Mail, User, UserPlus } from 'lucide-react'
import { signUp } from '~/lib/auth/client'

const registerSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/register')({
  validateSearch: registerSearchSchema,
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const { redirect } = Route.useSearch()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signUp.email({
        name: `${firstName} ${lastName}`.trim(),
        email,
        password,
        callbackURL: redirect ?? '/dashboard',
      })

      if (result?.error) {
        setError(result.error.message || 'Registration failed. Please try again.')
        return
      }

      navigate({ to: redirect ?? '/dashboard', replace: true })
    } catch (err) {
      console.error('Registration error:', err)
      setError('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
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
              <UserPlus className="w-8 h-8 text-indigo-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Create Account</h1>
            <p className="text-gray-600 text-center mb-8">Start your free 14-day trial</p>

            {error ? (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      placeholder="John"
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder="Doe"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Create a password"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 bg-indigo-600"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Create Account
                  </>
                )}
              </button>
            </form>

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
