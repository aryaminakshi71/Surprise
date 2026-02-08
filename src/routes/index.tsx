import { useEffect, useMemo, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Car,
  Zap,
  Shield,
  Globe,
  BarChart3,
  FileText,
  ChevronDown,
} from 'lucide-react'
import { CommandPalette } from '@shared/saas-core/components/ui'
import { NewsletterSignup } from '@shared/saas-core/components/landing'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

const features = [
  {
    icon: Car,
    title: 'Simple Operations',
    description: 'Launch workflows in minutes with guided setup.',
    badge: 'Simple',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Real-time insights with KPI dashboards and trends.',
    badge: 'Analytics',
  },
  {
    icon: Shield,
    title: 'Security',
    description: 'Role-based access with audit trails and alerts.',
    badge: 'Security',
  },
  {
    icon: Globe,
    title: 'API & Integrations',
    description: 'Connect your tools via a type-safe API.',
    badge: 'API',
  },
]

const pricingPlans = [
  {
    name: 'Free',
    price: 0,
    features: ['10 spots', 'Basic features', 'Community support', 'Mobile app'],
    popular: false,
  },
  {
    name: 'Starter',
    price: 29,
    features: ['50 spots', 'Basic reports', 'Email support', 'Real-time tracking'],
    popular: false,
  },
  {
    name: 'Professional',
    price: 79,
    features: ['200 spots', 'All features', 'Priority support', 'API access', 'Advanced analytics'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: ['Unlimited spots', 'All features', '24/7 support', 'Custom integrations', 'SLA'],
    popular: false,
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="border-b border-gray-200 pb-4">
      <button
        className="flex justify-between items-center w-full text-left font-semibold text-lg text-gray-800 hover:text-gray-900 transition-colors py-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ml-4 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen ? <p className="mt-2 text-gray-600 leading-relaxed">{answer}</p> : null}
    </div>
  )
}

function LandingPage() {
  const [commandOpen, setCommandOpen] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const appName = useMemo(
    () => import.meta.env.VITE_PUBLIC_APP_NAME ?? 'ParkingPro',
    []
  )

  useEffect(() => {
    setMounted(true)
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        setIsLoggedIn(true)
        navigate({ to: '/dashboard', replace: true })
      }
    } catch (error) {
      console.error('Error checking auth', error)
    }
  }, [navigate])

  const handleStripeCheckout = async (planKey: string) => {
    const pricingRedirect = `/?plan=${encodeURIComponent(planKey)}#pricing`
    if (checkoutLoading) return
    if (!isLoggedIn) {
      navigate({
        to: '/register',
        search: { redirect: pricingRedirect },
      })
      return
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      navigate({
        to: '/login',
        search: { redirect: pricingRedirect },
      })
      return
    }

    try {
      setCheckoutLoading(planKey)
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: planKey }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.url) window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setCheckoutLoading(null)
    }
  }

  if (mounted && isLoggedIn) return null

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100/50 sticky top-0 bg-white/90 backdrop-blur-xl shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2 no-underline">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">{appName}</span>
            </Link>
            <div className="flex items-center space-x-8">
              <a href="#features" className="text-gray-600 font-medium hover:text-gray-900 no-underline hidden md:block">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 font-medium hover:text-gray-900 no-underline hidden md:block">
                Pricing
              </a>
              <Link to="/reserve" className="text-gray-600 font-medium hover:text-gray-900 no-underline">
                Find Parking
              </Link>
              <Link to="/demo" className="text-gray-600 font-medium hover:text-gray-900 no-underline">
                Try Demo
              </Link>
              <Link to="/login" className="text-gray-600 font-medium hover:text-gray-900 no-underline">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-5 py-2.5 rounded-full shadow-sm border border-indigo-100/50 text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            <span>Smart Parking Management</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
            {appName} <span className="text-indigo-600">Made Simple</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-10 max-w-3xl mx-auto">
            Streamline parking operations with token management, real-time tracking, and automated payments.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/reserve"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700 transition-colors"
            >
              Reserve a spot
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              View dashboard
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">Powerful features for parking management</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-xl shadow-sm flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{feature.badge}</span>
                <h3 className="text-xl font-semibold text-gray-900 mt-3 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Simple APIs</h3>
              <p className="text-gray-600 text-sm">RESTful APIs with comprehensive documentation</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Multi-Language</h3>
              <p className="text-gray-600 text-sm">Support for 10+ languages and regional compliance</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Usage Analytics</h3>
              <p className="text-gray-600 text-sm">Real-time dashboards and detailed reports</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Enterprise Security</h3>
              <p className="text-gray-600 text-sm">SOC 2 aligned with audit trails</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">Simple Pricing</h2>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-2">Choose the plan that fits your lot</p>
            <div className="inline-flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-full text-sm font-medium text-indigo-600 mt-4">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"
                  fill="#6366f1"
                />
              </svg>
              <span>Secure payments powered by Stripe</span>
            </div>
          </div>
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                className={`bg-white rounded-xl p-8 ${
                  plan.popular
                    ? 'border-2 shadow-lg relative'
                    : 'border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300'
                }`}
                style={plan.popular ? { borderColor: '#6366f1' } : undefined}
              >
                {plan.popular ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold text-white rounded-full bg-indigo-600">
                    Popular
                  </div>
                ) : null}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                    {plan.price === 'Custom' ? 'Custom' : plan.price === 0 ? 'Free' : `$${plan.price}`}
                  </span>
                  {typeof plan.price === 'number' && plan.price > 0 ? (
                    <span className="text-gray-500">/month</span>
                  ) : null}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>
                {plan.price === 0 ? (
                  <Link
                    to="/register"
                    className="block w-full py-3.5 text-center rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-200 border border-gray-300 text-gray-700 hover:bg-gray-50 no-underline"
                  >
                    Get Started Free
                  </Link>
                ) : plan.price === 'Custom' ? (
                  <button
                    onClick={() => handleStripeCheckout('enterprise')}
                    disabled={checkoutLoading === 'enterprise'}
                    className="block w-full py-3.5 text-center rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-200 border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checkoutLoading === 'enterprise' ? 'Processing...' : 'Contact Sales'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleStripeCheckout(plan.name.toLowerCase())}
                    disabled={checkoutLoading === plan.name.toLowerCase()}
                    className={`block w-full py-3.5 text-center rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      plan.popular ? 'text-white bg-indigo-600 hover:bg-indigo-700' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {checkoutLoading === plan.name.toLowerCase() ? 'Processing...' : 'Subscribe with Stripe'}
                  </button>
                )}
                <p className="text-xs text-gray-500 text-center mt-3">Secure payment via Stripe</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">Stay Updated</h2>
          <p className="text-xl text-indigo-100 mb-8">Get parking management tips and product updates.</p>
          <NewsletterSignup />
          <p className="text-sm text-indigo-200 mt-4">No spam, unsubscribe anytime.</p>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">Everything you need to know</p>
          </div>
          <div className="space-y-4">
            {[
              {
                question: 'What is the free trial duration?',
                answer: 'Our free trial lasts for 14 days, no credit card required. You get full access to all features during the trial period.',
              },
              {
                question: 'Is my data secure?',
                answer: 'Yes, we are SOC 2 aligned and use encryption. Your data is stored securely and we never share it with third parties.',
              },
              {
                question: 'Can I cancel anytime?',
                answer: 'Yes, you can cancel your subscription at any time. There are no cancellation fees or long-term contracts.',
              },
              {
                question: 'Do you offer refunds?',
                answer: "We offer a 30-day money-back guarantee. If you're not satisfied, contact us within 30 days for a full refund.",
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit cards and PayPal. All payments are processed securely through Stripe.',
              },
              {
                question: 'Do you offer discounts for annual plans?',
                answer: 'Yes. Annual plans include 2 months free, which is a 17% discount compared to monthly billing.',
              },
            ].map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-16 border-t border-gray-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm">© 2026 {appName}. All rights reserved. Payments secured by Stripe.</p>
          <p className="text-xs text-gray-500 mt-2">Powered by Stripe for secure payments</p>
        </div>
      </footer>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  )
}
