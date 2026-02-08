// Stripe Integration - Payment Processing

export interface StripeConfig {
  publishableKey: string
  apiVersion: '2023-10-16' | '2024-12-18.acacia'
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  stripePriceId: string
  popular?: boolean
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    interval: 'month',
    features: [
      'Up to 100 active users',
      'Basic analytics',
      'Email support',
      'Standard integrations',
    ],
    stripePriceId: 'price_starter_monthly',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    interval: 'month',
    features: [
      'Unlimited users',
      'Advanced analytics & reports',
      'Priority support',
      'Custom integrations',
      'API access',
    ],
    stripePriceId: 'price_professional_monthly',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    interval: 'month',
    features: [
      'Everything in Professional',
      'Dedicated account manager',
      'Custom SLA',
      'On-premise deployment option',
      'White-label solution',
    ],
    stripePriceId: 'price_enterprise_monthly',
  },
]

// Free trial configuration
export const FREE_TRIAL_DAYS = 14

// Stripe checkout URL builder
export function getStripeCheckoutUrl(priceId: string, successUrl: string, cancelUrl: string): string {
  const params = new URLSearchParams({
    'price_id': priceId,
    'success_url': successUrl,
    'cancel_url': cancelUrl,
    'payment_method_types[]': 'card',
    'allow_promotion_codes': 'true',
    'billing_address_collection': 'auto',
    'customer_email': '',
  })
  
  return `https://checkout.stripe.com/pay/${params.toString()}`
}

// Customer portal URL builder
export function getCustomerPortalUrl(customerId: string, returnUrl: string): string {
  const params = new URLSearchParams({
    'customer': customerId,
    'return_url': returnUrl,
  })
  
  return `https://billing.stripe.com/p/session/${params.toString()}`
}

// Price formatter
export function formatPrice(price: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price)
}

// Calculate trial end date
export function getTrialEndDate(days: number = FREE_TRIAL_DAYS): Date {
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + days)
  return endDate
}

// Subscription status helpers
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete'

export function isSubscriptionActive(status: SubscriptionStatus): boolean {
  return ['active', 'trialing'].includes(status)
}

export function getStatusColor(status: SubscriptionStatus): string {
  const colors: Record<SubscriptionStatus, string> = {
    active: 'text-green-600 bg-green-100',
    trialing: 'text-blue-600 bg-blue-100',
    past_due: 'text-yellow-600 bg-yellow-100',
    canceled: 'text-gray-600 bg-gray-100',
    incomplete: 'text-red-600 bg-red-100',
  }
  return colors[status] || colors.incomplete
}
