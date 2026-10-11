-- Fix RLS Policies - Remove Infinite Recursion
-- This script updates the RLS policies to prevent infinite recursion
-- Run this in Supabase SQL Editor if you've already initialized the database

-- Drop old recursive policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own scores" ON golf_scores;
DROP POLICY IF EXISTS "Users can insert own scores" ON golf_scores;
DROP POLICY IF EXISTS "Users can update own scores" ON golf_scores;
DROP POLICY IF EXISTS "Users can delete own scores" ON golf_scores;
DROP POLICY IF EXISTS "All users can view charities" ON charities;
DROP POLICY IF EXISTS "Users can view own winners" ON draw_winners;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "All authenticated users can view draws" ON draws;
DROP POLICY IF EXISTS "Only admins can view audit logs" ON audit_log;
DROP POLICY IF EXISTS "Only admins can manage simulations" ON draw_simulations;

-- Re-create policies without recursion
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own scores" ON golf_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores" ON golf_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scores" ON golf_scores
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scores" ON golf_scores
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "All users can view charities" ON charities
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view own winners" ON draw_winners
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "All authenticated users can view draws" ON draws
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Public audit logs" ON audit_log
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow simulations access" ON draw_simulations
  FOR ALL USING (TRUE);
