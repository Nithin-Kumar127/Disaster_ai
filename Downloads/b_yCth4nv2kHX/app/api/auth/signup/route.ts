import { NextRequest, NextResponse } from 'next/server';
import { signUpUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendWelcomeEmail } from '@/lib/email';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2),
  charityId: z.string().uuid(),
  charityPercentage: z.number().min(10).max(100).default(10),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, charityId, charityPercentage } =
      signupSchema.parse(body);

    // Create user
    const user = await signUpUser(email, password, fullName);

    // Get charity details
    const supabase = getSupabaseAdmin();
    const { data: charity } = await supabase
      .from('charities')
      .select('name')
      .eq('id', charityId)
      .single();

    // Update user with charity selection
    await supabase
      .from('users')
      .update({
        selected_charity_id: charityId,
        charity_percentage: charityPercentage,
      })
      .eq('id', user.id);

    // Send welcome email
    try {
      await sendWelcomeEmail(email, fullName, charity?.name || 'Our Charity');
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Don't fail signup if email fails
    }

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Signup failed' },
      { status: 500 }
    );
  }
}
