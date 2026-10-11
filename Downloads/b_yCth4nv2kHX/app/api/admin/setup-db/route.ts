import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// This endpoint initializes the database schema
// Should only be called once during setup
export async function POST(request: NextRequest) {
  try {
    // Verify admin setup key from environment
    const setupKey = request.headers.get('x-setup-key');
    const expectedKey = process.env.DATABASE_SETUP_KEY;
    
    if (!setupKey || setupKey !== expectedKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    
    // Read the SQL schema file
    const sqlPath = path.join(process.cwd(), 'scripts/supabase-init.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));

    const results = [];
    
    for (const statement of statements) {
      try {
        const { data, error } = await supabaseAdmin.rpc('exec', { p_sql: statement });
        
        if (error) {
          console.warn(`Statement warning: ${error.message}`);
          results.push({
            statement: statement.substring(0, 50),
            status: 'warning',
            message: error.message
          });
        } else {
          results.push({
            statement: statement.substring(0, 50),
            status: 'success',
            data
          });
        }
      } catch (err: any) {
        console.error(`Statement error: ${err.message}`);
        // Continue with next statement
        results.push({
          statement: statement.substring(0, 50),
          status: 'error',
          message: err.message
        });
      }
    }

    return NextResponse.json({
      message: 'Database setup initiated',
      results: results
    });
  } catch (error: any) {
    console.error('Database setup error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
