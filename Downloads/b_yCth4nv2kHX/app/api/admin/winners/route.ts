import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { isAdmin } from '@/lib/auth';
import { sendVerificationStatusEmail } from '@/lib/email';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const verifyWinnerSchema = z.object({
  winnerId: z.string().uuid(),
  status: z.enum(['verified', 'rejected']),
  notes: z.string().optional(),
});

/**
 * GET /api/admin/winners
 * Get all winners pending verification (admin only)
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

    // Check if admin
    const admin = await isAdmin(userData.user.id);
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const status = request.nextUrl.searchParams.get('status') || 'pending';

    // Get winners
    const { data: winners, error } = await supabase
      .from('draw_winners')
      .select(`
        *,
        user:users(id, email, full_name),
        draw:draws(draw_month, winning_numbers)
      `)
      .eq('verification_status', status)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch winners' },
        { status: 500 }
      );
    }

    return NextResponse.json({ winners, total: winners?.length || 0 });
  } catch (error: any) {
    console.error('Get winners error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get winners' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/winners/:id
 * Verify or reject a winner's claim (admin only)
 */
export async function PATCH(request: NextRequest) {
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

    // Check if admin
    const admin = await isAdmin(userData.user.id);
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { winnerId, status, notes } = verifyWinnerSchema.parse(body);

    // Get winner details
    const { data: winner } = await supabase
      .from('draw_winners')
      .select('*, user:users(email, full_name)')
      .eq('id', winnerId)
      .single();

    if (!winner) {
      return NextResponse.json(
        { error: 'Winner not found' },
        { status: 404 }
      );
    }

    // Update winner status
    const { data: updated, error: updateError } = await supabase
      .from('draw_winners')
      .update({
        verification_status: status,
        verified_by_admin_id: userData.user.id,
        verified_at: new Date().toISOString(),
        paid_at: status === 'verified' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', winnerId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to verify winner' },
        { status: 500 }
      );
    }

    // Send notification email
    try {
      if (winner.user?.email) {
        await sendVerificationStatusEmail(
          winner.user.email,
          winner.user.full_name || 'Member',
          status,
          winner.prize_amount
        );
      }
    } catch (emailError) {
      console.error('Email send error:', emailError);
    }

    // Log audit
    await supabase
      .from('audit_log')
      .insert({
        admin_id: userData.user.id,
        action: `VERIFY_WINNER_${status.toUpperCase()}`,
        table_name: 'draw_winners',
        record_id: winnerId,
        changes: {
          status,
          notes,
        },
      });

    return NextResponse.json({
      message: `Winner ${status} successfully`,
      winner: updated,
    });
  } catch (error: any) {
    console.error('Verify winner error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to verify winner' },
      { status: 500 }
    );
  }
}
