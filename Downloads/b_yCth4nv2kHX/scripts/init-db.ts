/**
 * Database Initialization Script
 * Run this via: npx ts-node scripts/init-db.ts
 * Or add to package.json: "db:init": "ts-node scripts/init-db.ts"
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...\n');

    // Read SQL schema
    const sqlPath = path.join(process.cwd(), 'scripts/supabase-init.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    // Send to Supabase SQL editor for execution
    // Note: You should run the SQL directly in Supabase Dashboard or use postgres client
    console.log('📋 SQL Schema loaded. Total length:', sqlContent.length, 'characters');
    console.log('\n⚠️  To initialize the database:');
    console.log('1. Go to: https://app.supabase.com/project/_/sql/new');
    console.log('2. Copy the contents of scripts/supabase-init.sql');
    console.log('3. Paste into the SQL editor and execute\n');

    // List charities from seed data
    const seedMatch = sqlContent.match(/INSERT INTO charities.*?ON CONFLICT/s);
    if (seedMatch) {
      console.log('✅ Seed data includes:');
      const charityMatch = seedMatch[0].match(/\('([^']+)'/g);
      if (charityMatch) {
        charityMatch.forEach(m => {
          const name = m.slice(2, -1);
          console.log(`   - ${name}`);
        });
      }
    }

    console.log('\n✅ Database initialization ready!');
    console.log('Execute the SQL schema in your Supabase dashboard to complete setup.\n');
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    process.exit(1);
  }
}

initializeDatabase();
