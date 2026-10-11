import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { isAdmin } from '@/lib/auth';
import { executeMonthlyDraw, simulateDraw } from '@/lib/draw-engine';
import { sendAdminDrawNotification } from '@/lib/email';
import { z } from 'zod';

// Mark this route as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

const executeDrawSchema = z.object({
  drawMonth: z.string().regex(/^\d{4}-\d{2}-01$/),
  useWeighted: z.boolean().optional().default(false),
});

const simulateDrawSchema = z.object({
  drawMonth: z.string().regex(/^\d{4}-\d{2}-01$/),
  useWeighted: z.boolean().optional().default(false),
});

/**
 * GET /api/admin/draws
 * Get all draws (admin only)
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

    // Get draws
    const { data: draws, error } = await supabase
      .from('draws')
      .select('*')
      .order('draw_month', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch draws' },
        { status: 500 }
      );
    }

    return NextResponse.json({ draws });
  } catch (error: any) {
    console.error('Get draws error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get draws' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/draws/execute
 * Execute a monthly draw (admin only)
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

    // Check if admin
    const admin = await isAdmin(userData.user.id);
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Parse request
    const body = await request.json();
    const { drawMonth, useWeighted } = executeDrawSchema.parse(body);

    // Execute draw
    const result = await executeMonthlyDraw(new Date(drawMonth), useWeighted);

    // Send notification email
    try {
      const { data: adminUser } = await supabase
        .from('users')
        .select('email')
        .eq('id', userData.user.id)
        .single();

      if (adminUser?.email) {
        await sendAdminDrawNotification(
          adminUser.email,
          drawMonth,
          result.draw.id ? 0 : 0,
          result.totalPrizePool
        );
      }
    } catch (emailError) {
      console.error('Notification email error:', emailError);
    }

    // Log to audit
    await supabase
      .from('audit_log')
      .insert({
        admin_id: userData.user.id,
        action: 'EXECUTE_DRAW',
        table_name: 'draws',
        record_id: result.draw.id,
        changes: {
          drawMonth,
          winningNumbers: result.winningNumbers,
          useWeighted,
        },
      });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Execute draw error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to execute draw' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/draws/simulate
 * Simulate a draw without committing (admin only)
 */
export async function POST_SIMULATE(request: NextRequest) {
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

    // Parse request
    const body = await request.json();
    const { drawMonth, useWeighted } = simulateDrawSchema.parse(body);

    // Simulate draw
    const result = await simulateDraw(
      userData.user.id,
      new Date(drawMonth),
      useWeighted
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Simulate draw error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to simulate draw' },
      { status: 500 }
    );
  }
}
