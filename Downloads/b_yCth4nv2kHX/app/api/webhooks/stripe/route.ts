import { NextRequest, NextResponse } from 'next/server';
import { handleStripeWebhook, verifyWebhookSignature } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature, webhookSecret);

    if (!event) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    console.log(`[STRIPE] Processing event: ${event.type}`);
    await handleStripeWebhook(event);

    return NextResponse.json({
      received: true,
      eventType: event.type,
    });
  } catch (error: any) {
    console.error('[STRIPE] Webhook error:', error);

    // Always return 200 to acknowledge receipt to Stripe
    // Stripe will retry if we return 400+
    return NextResponse.json(
      { error: error.message },
      { status: 200 }
    );
  }
}
