import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * POST /api/charities/init
 * Initialize charities if they don't exist
 * This endpoint ensures default charities are seeded
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();

    // Check if charities already exist
    const { data: existingCharities } = await supabase
      .from('charities')
      .select('id')
      .limit(1);

    if (existingCharities && existingCharities.length > 0) {
      return NextResponse.json({
        message: 'Charities already initialized',
        count: existingCharities.length,
      });
    }

    // Seed default charities
    const defaultCharities = [
      {
        name: 'The First Tee',
        description: 'Building character in young people through golf.',
        category: 'Youth Development',
        impact_statement: 'Empowering youth through golf education and mentorship',
        is_featured: true,
        is_active: true,
      },
      {
        name: 'PGA Foundation',
        description: 'Providing golf opportunities for underrepresented communities.',
        category: 'Community Access',
        impact_statement: 'Making golf accessible to everyone regardless of background',
        is_featured: true,
        is_active: true,
      },
      {
        name: 'Golf Channel Foundation',
        description: 'Supporting junior golf and charitable causes.',
        category: 'Junior Golf',
        impact_statement: 'Developing the next generation of golfers',
        is_featured: false,
        is_active: true,
      },
      {
        name: 'The Genesis Foundation',
        description: 'Funding cancer research and community support.',
        category: 'Health & Research',
        impact_statement: 'Fighting cancer through research and community programs',
        is_featured: true,
        is_active: true,
      },
      {
        name: "St. Jude Children's Research Hospital",
        description: "Treating childhood cancer with world-class care.",
        category: 'Health & Children',
        impact_statement: "Curing childhood cancer and saving children's lives",
        is_featured: true,
        is_active: true,
      },
    ];

    const { data, error } = await supabase
      .from('charities')
      .insert(defaultCharities)
      .select();

    if (error) {
      console.error('[v0] Error seeding charities:', error);
      return NextResponse.json(
        { error: 'Failed to seed charities', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Charities initialized successfully',
      count: data?.length || 0,
      charities: data,
    });
  } catch (error: any) {
    console.error('[v0] Init charities error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize charities' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/charities/init
 * Check initialization status
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('charities')
      .select('id')
      .eq('is_active', true);

    if (error) {
      return NextResponse.json(
        { error: error.message, initialized: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      initialized: (data?.length || 0) > 0,
      charityCount: data?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, initialized: false },
      { status: 500 }
    );
  }
}
