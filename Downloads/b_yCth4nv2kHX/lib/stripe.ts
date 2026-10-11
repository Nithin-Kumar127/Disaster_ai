import Stripe from 'stripe';
import { getSupabaseAdmin } from './supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20',
});

export const SUBSCRIPTION_PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY || 'price_monthly',
  yearly: process.env.STRIPE_PRICE_YEARLY || 'price_yearly',
};

/**
 * Create a Stripe customer for a user
 */
export async function createStripeCustomer(
  userId: string,
  email: string,
  fullName?: string
) {
  const customer = await stripe.customers.create({
    email,
    name: fullName || undefined,
    metadata: {
      userId,
    },
  });

  // Store customer ID in database
  const supabase = getSupabaseAdmin();
  await supabase
    .from('users')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId);

  return customer;
}

/**
 * Get or create Stripe customer
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  fullName?: string
) {
  const supabase = getSupabaseAdmin();

  // Check if customer already exists
  const { data: user } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  if (user?.stripe_customer_id) {
    return user.stripe_customer_id;
  }

  // Create new customer
  const customer = await createStripeCustomer(userId, email, fullName);
  return customer.id;
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  returnUrl: string
) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: returnUrl,
    subscription_data: {
      metadata: {
        paymentFor: 'golfCharity',
      },
    },
  });

  return session;
}

/**
 * Get subscription details from Stripe
 */
export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Update subscription tier (monthly to yearly or vice versa)
 */
export async function updateSubscriptionTier(
  subscriptionId: string,
  newPriceId: string
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  if (!subscription.items.data[0]) {
    throw new Error('No subscription items found');
  }

  return stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
  });
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(event: Stripe.Event) {
  const supabase = getSupabaseAdmin();

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      // Get user by customer ID
      const { data: customers } = await stripe.customers.search({
        query: `metadata['userId']`,
      });

      const customer = await stripe.customers.retrieve(customerId);
      const userId = (customer.metadata?.userId as string) || '';

      if (!userId) break;

      // Determine tier and status
      const priceId = subscription.items.data[0]?.price.id;
      const tier =
        priceId === SUBSCRIPTION_PRICES.yearly ? 'yearly' : 'monthly';
      const status = subscription.status as any;

      // Update user subscription
      await supabase
        .from('users')
        .update({
          subscription_status: status === 'active' ? 'active' : 'inactive',
          subscription_tier: tier,
          stripe_subscription_id: subscription.id,
          subscription_start_date: new Date(
            subscription.current_period_start * 1000
          ).toISOString(),
          subscription_end_date: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
        })
        .eq('id', userId);

      // Also update subscriptions table
      await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_price_id: priceId,
          status: status as any,
          tier,
          amount_cents: subscription.items.data[0]?.price.unit_amount || 0,
          current_period_start: new Date(
            subscription.current_period_start * 1000
          ).toISOString(),
          current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
        });

      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const customer = await stripe.customers.retrieve(customerId);
      const userId = (customer.metadata?.userId as string) || '';

      if (!userId) break;

      // Update subscription status to cancelled
      await supabase
        .from('users')
        .update({
          subscription_status: 'cancelled',
        })
        .eq('id', userId);

      await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);

      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const customer = await stripe.customers.retrieve(customerId);
      const userId = (customer.metadata?.userId as string) || '';

      if (!userId || !invoice.subscription) break;

      // Update subscription status to active
      await supabase
        .from('users')
        .update({
          subscription_status: 'active',
        })
        .eq('id', userId);

      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const customer = await stripe.customers.retrieve(customerId);
      const userId = (customer.metadata?.userId as string) || '';

      if (!userId) break;

      // Update subscription status to past_due
      await supabase
        .from('users')
        .update({
          subscription_status: 'expired',
        })
        .eq('id', userId);

      break;
    }
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
) {
  try {
    return stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return null;
  }
}
