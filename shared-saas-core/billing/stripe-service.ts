import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    users: number;
    storage: number;
    apiCalls: number;
  };
}

export const PLANS: Record<string, Plan> = {
  free: {
    id: 'price_free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: ['Basic features', 'Email support'],
    limits: { users: 5, storage: 1000, apiCalls: 1000 },
  },
  starter: {
    id: 'price_starter',
    name: 'Starter',
    price: 29,
    interval: 'month',
    features: ['All Free features', '10GB storage', 'Priority support', 'Basic analytics'],
    limits: { users: 25, storage: 10000, apiCalls: 10000 },
  },
  professional: {
    id: 'price_professional',
    name: 'Professional',
    price: 99,
    interval: 'month',
    features: ['All Starter features', '100GB storage', '24/7 support', 'Advanced analytics', 'Custom integrations'],
    limits: { users: 100, storage: 100000, apiCalls: 100000 },
  },
  enterprise: {
    id: 'price_enterprise',
    name: 'Enterprise',
    price: 299,
    interval: 'month',
    features: ['All Professional features', 'Unlimited storage', 'Dedicated support', 'Custom development', 'SLA guarantee'],
    limits: { users: -1, storage: -1, apiCalls: -1 },
  },
};

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export class StripeService {
  async createCustomer(email: string, name: string, tenantId: string) {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: { tenantId },
    });

    return customer;
  }

  async createSubscription(customerId: string, planId: string) {
    const priceId = PLANS[planId]?.id;
    if (!priceId) throw new Error('Invalid plan');

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: 14,
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    return subscription;
  }

  async cancelSubscription(subscriptionId: string) {
    return stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  async resumeSubscription(subscriptionId: string) {
    return stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  }

  async getSubscription(subscriptionId: string) {
    return stripe.subscriptions.retrieve(subscriptionId);
  }

  async createCheckoutSession(customerId: string, planId: string, successUrl: string, cancelUrl: string) {
    const priceId = PLANS[planId]?.id;
    if (!priceId) throw new Error('Invalid plan');

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { planId },
    });

    return session;
  }

  async createBillingPortalSession(customerId: string, returnUrl: string) {
    return stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }
  }

  private async handleSubscriptionChange(subscription: Stripe.Subscription) {
    const tenantId = subscription.metadata?.tenantId;
    if (!tenantId) return;

    console.log(`Subscription ${subscription.id} changed for tenant ${tenantId}`);
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    console.log(`Invoice ${invoice.id} paid`);
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    console.log(`Invoice ${invoice.id} payment failed`);
  }

  async getInvoices(customerId: string, limit: number = 10) {
    return stripe.invoices.list({ customer: customerId, limit });
  }

  async getUpcomingInvoice(customerId: string) {
    return stripe.invoices.retrieveUpcoming({ customer: customerId });
  }
}

export const stripeService = new StripeService();
