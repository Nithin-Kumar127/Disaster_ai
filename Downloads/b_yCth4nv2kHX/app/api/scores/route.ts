import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { addGolfScore, getUserScores, getScoreStats } from '@/lib/golf-scores';
import { sendScoreConfirmationEmail } from '@/lib/email';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const addScoreSchema = z.object({
  score: z.number().int().min(1).max(45),
  scoreDate: z.string().date(),
  courseName: z.string().optional(),
});

/**
 * GET /api/scores
 * Get current user's golf scores
 */
export async function GET(request: NextRequest) {
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

    // Get scores and stats
    const scores = await getUserScores(userData.user.id);
    const stats = await getScoreStats(userData.user.id);

    return NextResponse.json({
      scores,
      stats,
    });
  } catch (error: any) {
    console.error('Get scores error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get scores' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/scores
 * Add a new golf score
 */
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

    // Validate request body
    const body = await request.json();
    const { score, scoreDate, courseName } = addScoreSchema.parse(body);

    // Check subscription status
    const { data: user } = await supabase
      .from('users')
      .select('subscription_status, email, full_name')
      .eq('id', userData.user.id)
      .single();

    if (user?.subscription_status !== 'active') {
      return NextResponse.json(
        { error: 'You must have an active subscription to add scores' },
        { status: 403 }
      );
    }

    // Add the score
    const newScore = await addGolfScore(
      userData.user.id,
      score,
      scoreDate,
      courseName
    );

    // Send confirmation email
    try {
      await sendScoreConfirmationEmail(
        user.email,
        user.full_name || 'Member',
        score,
        scoreDate
      );
    } catch (emailError) {
      console.error('Email send error:', emailError);
    }

    return NextResponse.json(
      { message: 'Score added successfully', score: newScore },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Add score error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to add score' },
      { status: 500 }
    );
  }
}
