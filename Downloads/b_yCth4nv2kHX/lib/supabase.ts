import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Use non-null assertion for build-time compatibility
// Actual validation happens at runtime when these are used
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Export a singleton client instance for client-side use
// Validation happens at runtime when this is imported in a browser context
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export const getSupabase = () => {
  // Runtime validation - check if environment variables are actually available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.'
    );
  }
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

// Server-side client with service role key for admin operations
export const getSupabaseAdmin = () => {
  const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!adminKey || !url) {
    throw new Error(
      'Missing Supabase admin credentials. ' +
      'Please set SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in your environment.'
    );
  }
  return createClient<Database>(url, adminKey);
};
