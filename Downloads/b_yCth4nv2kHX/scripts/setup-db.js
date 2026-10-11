import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('Starting database setup...');

    // Read and execute the SQL script
    const fs = await import('fs');
    const path = await import('path');
    const scriptPath = path.join(process.cwd(), 'scripts/supabase-init.sql');
    const sql = fs.readFileSync(scriptPath, 'utf-8');

    // Split by semicolons and execute statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('execute_sql', { sql: statement });
        if (error) {
          console.warn(`Warning executing statement: ${error.message}`);
        } else {
          console.log(`✓ Executed: ${statement.substring(0, 50)}...`);
        }
      } catch (e) {
        console.warn(`Skipping statement: ${e.message}`);
      }
    }

    console.log('✓ Database setup completed!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
