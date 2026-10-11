import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/charities
 * Get all active charities
 */
export async function GET(request: NextRequest) {
  try {
    // Check if admin key is available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[v0] SUPABASE_SERVICE_ROLE_KEY not set');
      return NextResponse.json(
        { 
          error: 'Database not configured. Missing SUPABASE_SERVICE_ROLE_KEY',
          charities: [],
          message: 'Please set SUPABASE_SERVICE_ROLE_KEY in environment variables'
        },
        { status: 500 }
      );
    }

    const supabase = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');

    let query = supabase
      .from('charities')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('name', { ascending: true });

    // Filter by featured if requested
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[v0] Charities query error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to fetch charities from database',
          details: error.message,
          charities: []
        },
        { status: 500 }
      );
    }

    // Client-side search filtering
    let charities = data || [];
    if (search) {
      const searchLower = search.toLowerCase();
      charities = charities.filter(
        c =>
          c.name.toLowerCase().includes(searchLower) ||
          c.description?.toLowerCase().includes(searchLower) ||
          c.category?.toLowerCase().includes(searchLower)
      );
    }

    console.log('[v0] Charities retrieved:', charities.length);
    return NextResponse.json({
      charities,
      total: charities.length,
    });
  } catch (error: any) {
    console.error('[v0] Get charities error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to get charities',
        details: error.stack,
        charities: []
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/charities/:id
 * Get single charity by ID
 */
export async function GET_SINGLE(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const id = pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: 'Charity ID required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('charities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Charity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Get charity error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get charity' },
      { status: 500 }
    );
  }
}
