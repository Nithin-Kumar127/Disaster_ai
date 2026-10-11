import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateStripeCustomer, createCheckoutSession, SUBSCRIPTION_PRICES } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const checkoutSchema = z.object({
  tier: z.enum(['monthly', 'yearly']),
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const supabase = getSupabaseAdmin();

    // Get user from token
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: userProfile } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', userData.user.id)
      .single();

    const body = await request.json();
    const { tier } = checkoutSchema.parse(body);

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(
      userData.user.id,
      userData.user.email || '',
      userProfile?.full_name || undefined
    );

    // Get price ID based on tier
    const priceId = tier === 'yearly' 
      ? SUBSCRIPTION_PRICES.yearly 
      : SUBSCRIPTION_PRICES.monthly;

    // Create checkout session
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`;
    const session = await createCheckoutSession(customerId, priceId, returnUrl);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Checkout failed' },
      { status: 500 }
    );
  }
}
