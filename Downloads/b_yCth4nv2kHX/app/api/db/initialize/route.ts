import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

/**
 * POST /api/db/initialize
 * Execute database initialization SQL
 * This endpoint reads the SQL file and provides instructions for manual setup
 */
export async function POST(request: NextRequest) {
  try {
    const sqlPath = path.join(process.cwd(), 'scripts', 'supabase-init.sql');
    
    if (!fs.existsSync(sqlPath)) {
      return NextResponse.json(
        { 
          error: 'SQL file not found',
          message: 'The supabase-init.sql file is missing'
        },
        { status: 404 }
      );
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    
    console.log('[v0] Database initialization requested');
    
    return NextResponse.json({
      success: true,
      message: 'SQL schema provided. Please copy and paste into Supabase SQL Editor.',
      instructions: `
1. Go to https://supabase.com and sign in to your project
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy ALL the SQL content provided below
5. Paste it into the SQL editor
6. Click "Run" to execute
7. Wait for completion
8. Return to the app and refresh
      `,
      sqlLength: sqlContent.length,
      sqlContent: sqlContent,
      url: 'https://supabase.com/dashboard/project/_/sql/new'
    });
  } catch (error: any) {
    console.error('[v0] Database initialization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize database' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/db/initialize
 * Check if charities table exists
 */
export async function GET(request: NextRequest) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { 
          initialized: false,
          error: 'Missing Supabase credentials',
          message: 'NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set'
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try to query charities table
    const { data, error } = await supabase
      .from('charities')
      .select('count', { count: 'exact' });

    if (error) {
      console.error('[v0] Charities table check error:', error);
      return NextResponse.json({
        initialized: false,
        error: error.message,
        message: 'Database not initialized. Charities table does not exist.',
        nextSteps: 'POST to /api/db/initialize to get SQL setup instructions'
      });
    }

    // Check if charities exist
    const charityCount = data?.length || 0;

    return NextResponse.json({
      initialized: true,
      charityCount: charityCount,
      message: charityCount > 0 ? 'Database is ready!' : 'Database initialized but no charities seeded.',
      needsSeeding: charityCount === 0
    });
  } catch (error: any) {
    console.error('[v0] Database status check error:', error);
    return NextResponse.json(
      { 
        initialized: false,
        error: error.message || 'Failed to check database status'
      },
      { status: 500 }
    );
  }
}
