import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const uploadProofSchema = z.object({
  winnerId: z.string().uuid(),
  proofUrl: z.string().url(),
});

/**
 * GET /api/winners
 * Get current user's winning records
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

    // Get user's wins
    const { data: winners, error } = await supabase
      .from('draw_winners')
      .select(`
        *,
        draw:draws(draw_month, winning_numbers)
      `)
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch winners' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const stats = {
      totalWins: winners?.length || 0,
      totalPrizeAmount: (winners || []).reduce((sum, w) => sum + w.prize_amount, 0),
      verifiedWins: (winners || []).filter(w => w.verification_status === 'verified').length,
      pendingVerification: (winners || []).filter(w => w.verification_status === 'pending').length,
    };

    return NextResponse.json({
      winners,
      stats,
    });
  } catch (error: any) {
    console.error('Get winners error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get winners' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/winners/upload-proof
 * Upload proof screenshot for a winning claim
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

    // Parse request
    const body = await request.json();
    const { winnerId, proofUrl } = uploadProofSchema.parse(body);

    // Verify winner belongs to user
    const { data: winner } = await supabase
      .from('draw_winners')
      .select('user_id')
      .eq('id', winnerId)
      .single();

    if (!winner || winner.user_id !== userData.user.id) {
      return NextResponse.json(
        { error: 'Winner not found or unauthorized' },
        { status: 403 }
      );
    }

    // Update winner with proof
    const { data: updated, error: updateError } = await supabase
      .from('draw_winners')
      .update({
        proof_screenshot_url: proofUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', winnerId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to upload proof' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Proof uploaded successfully',
      winner: updated,
    });
  } catch (error: any) {
    console.error('Upload proof error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to upload proof' },
      { status: 500 }
    );
  }
}
