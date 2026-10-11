import { getSupabaseAdmin } from './supabase';
import bcrypt from 'bcryptjs';

export type UserRole = 'user' | 'admin';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create a new user with email and password via Supabase Auth
 */
export async function signUpUser(
  email: string,
  password: string,
  fullName?: string
) {
  const supabase = getSupabaseAdmin();

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email
  });

  if (authError) {
    throw new Error(`Auth signup failed: ${authError.message}`);
  }

  if (!authData.user) {
    throw new Error('User creation failed');
  }

  // Create user profile in public.users table
  const { error: profileError } = await getSupabaseAdmin()
    .from('users')
    .insert({
      email,
      full_name: fullName || null,
      role: 'user',
      subscription_status: 'inactive',
      charity_percentage: 10,
    });

  if (profileError) {
    throw new Error(`Profile creation failed: ${profileError.message}`);
  }

  return authData.user;
}

/**
 * Sign in user with email and password
 */
export async function signInUser(email: string, password: string) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Sign in failed: ${error.message}`);
  }

  return data;
}

/**
 * Get current user by auth token
 */
export async function getCurrentUser(token: string) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.auth.getUser(token);

  if (error) {
    throw new Error(`Failed to get user: ${error.message}`);
  }

  return data.user;
}

/**
 * Get user profile from public.users table
 */
export async function getUserProfile(userId: string) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch user profile: ${error.message}`);
  }

  return data;
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, updates: Record<string, any>) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  return data;
}

/**
 * Verify user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const user = await getUserProfile(userId);
    return user.role === 'admin';
  } catch {
    return false;
  }
}

/**
 * Sign out user
 */
export async function signOutUser(token: string) {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`Sign out failed: ${error.message}`);
  }
}
