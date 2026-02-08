import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { AlertCircle, ArrowLeft, Car, Lock, LogIn, Mail } from 'lucide-react'
import { signIn } from '~/lib/auth/client'

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { redirect } = Route.useSearch()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    if (!email || !password) {
      setError('Please enter both email and password')
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn.email({
        email,
        password,
        callbackURL: redirect ?? '/dashboard',
      })

      if (result?.error) {
        setError(result.error.message || 'Login failed. Please check your credentials.')
        return
      }

      navigate({ to: redirect ?? '/dashboard', replace: true })
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again.')
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
              <LogIn className="w-8 h-8 text-indigo-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Welcome Back</h1>
            <p className="text-gray-600 text-center mb-8">Sign in to your ParkingPro account</p>

            {error ? (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <Link
              to="/demo"
              className="w-full py-4 rounded-xl font-semibold border-2 border-gray-200 flex items-center justify-center gap-2 transition-all hover:border-gray-300 no-underline text-gray-700"
            >
              Try Demo Instead
            </Link>

            <p className="text-center text-gray-600 mt-6">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-medium text-indigo-600 no-underline hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
