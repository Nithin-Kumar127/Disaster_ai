-- Golf Charity Subscription Platform - Database Schema
-- Supabase PostgreSQL Database Initialization

-- ============================================================================
-- 1. USERS TABLE (extends Supabase auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
  subscription_status TEXT CHECK (subscription_status IN ('active', 'inactive', 'expired', 'cancelled')) DEFAULT 'inactive',
  subscription_tier TEXT CHECK (subscription_tier IN ('monthly', 'yearly', null)) DEFAULT NULL,
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  selected_charity_id UUID,
  charity_percentage NUMERIC(5,2) DEFAULT 10,
  total_winnings NUMERIC(10,2) DEFAULT 0,
  profile_image_url TEXT,
  bio TEXT,
  handicap NUMERIC(5,2),
  home_course TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- 2. CHARITIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  email TEXT,
  category TEXT,
  impact_statement TEXT,
  total_raised NUMERIC(12,2) DEFAULT 0,
  subscriber_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. CHARITY_ALLOCATIONS TABLE (tracks monthly contributions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS charity_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  month_year DATE NOT NULL,
  total_allocated NUMERIC(10,2) DEFAULT 0,
  subscriber_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. GOLF_SCORES TABLE (FIFO: max 5 scores per user)
-- ============================================================================
CREATE TABLE IF NOT EXISTS golf_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  score_date DATE NOT NULL,
  course_name TEXT,
  hole_count INTEGER DEFAULT 18,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. DRAWS TABLE (Monthly draws with results)
-- ============================================================================
CREATE TABLE IF NOT EXISTS draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_month DATE NOT NULL UNIQUE,
  draw_type TEXT CHECK (draw_type IN ('monthly', 'special')) DEFAULT 'monthly',
  status TEXT CHECK (status IN ('scheduled', 'executed', 'published', 'cancelled')) DEFAULT 'scheduled',
  
  -- Prize pool calculations (from subscription fees)
  total_prize_pool NUMERIC(12,2) DEFAULT 0,
  jackpot_amount NUMERIC(12,2) DEFAULT 0,
  four_number_pool NUMERIC(12,2) DEFAULT 0,
  three_number_pool NUMERIC(12,2) DEFAULT 0,
  
  -- Draw numbers (5 numbers for matching)
  winning_numbers INTEGER[] NOT NULL,
  
  -- Draw execution details
  executed_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  executed_by_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 6. DRAW_WINNERS TABLE (Winners per draw, per matching tier)
-- ============================================================================
CREATE TABLE IF NOT EXISTS draw_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  matched_numbers INTEGER[] NOT NULL,
  match_count INTEGER NOT NULL CHECK (match_count IN (3, 4, 5)),
  prize_amount NUMERIC(10,2) NOT NULL,
  proof_screenshot_url TEXT,
  verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  verified_by_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 7. DRAW_SIMULATIONS TABLE (Admin testing before publishing)
-- ============================================================================
CREATE TABLE IF NOT EXISTS draw_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  draw_month DATE,
  simulated_winning_numbers INTEGER[] NOT NULL,
  simulation_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 8. SUBSCRIPTIONS TABLE (Track subscription history)
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  status TEXT CHECK (status IN ('active', 'past_due', 'unpaid', 'cancelled', 'expired')) DEFAULT 'active',
  tier TEXT CHECK (tier IN ('monthly', 'yearly')) NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 9. AUDIT_LOG TABLE (Track admin actions and draw executions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_selected_charity_id ON users(selected_charity_id);
CREATE INDEX IF NOT EXISTS idx_golf_scores_user_id_date ON golf_scores(user_id, score_date DESC);
CREATE INDEX IF NOT EXISTS idx_golf_scores_user_id_created ON golf_scores(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_draws_draw_month ON draws(draw_month);
CREATE INDEX IF NOT EXISTS idx_draws_status ON draws(status);
CREATE INDEX IF NOT EXISTS idx_draw_winners_draw_id ON draw_winners(draw_id);
CREATE INDEX IF NOT EXISTS idx_draw_winners_user_id ON draw_winners(user_id);
CREATE INDEX IF NOT EXISTS idx_draw_winners_verification_status ON draw_winners(verification_status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_charity_allocations_charity_id_month ON charity_allocations(charity_id, month_year);
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id_created ON audit_log(admin_id, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE golf_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE charity_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_simulations ENABLE ROW LEVEL SECURITY;

-- Simple RLS: Users can only view their own profile
-- NOTE: Removed subqueries to prevent infinite recursion
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Golf scores: Users can only view/manage their own scores
DROP POLICY IF EXISTS "Users can view own scores" ON golf_scores;
CREATE POLICY "Users can view own scores" ON golf_scores
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own scores" ON golf_scores;
CREATE POLICY "Users can insert own scores" ON golf_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own scores" ON golf_scores;
CREATE POLICY "Users can update own scores" ON golf_scores
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own scores" ON golf_scores;
CREATE POLICY "Users can delete own scores" ON golf_scores
  FOR DELETE USING (auth.uid() = user_id);

-- Charities are readable by all authenticated users
DROP POLICY IF EXISTS "All users can view charities" ON charities;
CREATE POLICY "All users can view charities" ON charities
  FOR SELECT USING (auth.role() = 'authenticated');

-- Draw winners: Users can view their own
DROP POLICY IF EXISTS "Users can view own winners" ON draw_winners;
CREATE POLICY "Users can view own winners" ON draw_winners
  FOR SELECT USING (auth.uid() = user_id);

-- Subscriptions: Users can view their own
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Draws are readable by all authenticated users
DROP POLICY IF EXISTS "All authenticated users can view draws" ON draws;
CREATE POLICY "All authenticated users can view draws" ON draws
  FOR SELECT USING (auth.role() = 'authenticated');

-- Audit logs: Public read
DROP POLICY IF EXISTS "Public audit logs" ON audit_log;
CREATE POLICY "Public audit logs" ON audit_log
  FOR SELECT USING (TRUE);

-- Draw simulations: Allow all for now (will be restricted by application)
DROP POLICY IF EXISTS "Allow simulations access" ON draw_simulations;
CREATE POLICY "Allow simulations access" ON draw_simulations
  FOR ALL USING (TRUE);

-- ============================================================================
-- SEED DATA (Optional charities for demo)
-- ============================================================================
INSERT INTO charities (name, description, logo_url, category, impact_statement, is_featured) VALUES
  ('The First Tee', 'Building character in young people through golf.', NULL, 'Youth Development', 'Empowering youth through golf education and mentorship', TRUE),
  ('PGA Foundation', 'Providing golf opportunities for underrepresented communities.', NULL, 'Community Access', 'Making golf accessible to everyone regardless of background', TRUE),
  ('Golf Channel Foundation', 'Supporting junior golf and charitable causes.', NULL, 'Junior Golf', 'Developing the next generation of golfers', FALSE),
  ('The Genesis Foundation', 'Funding cancer research and community support.', NULL, 'Health & Research', 'Fighting cancer through research and community programs', TRUE),
  ('St. Jude Children''s Research Hospital', 'Treating childhood cancer with world-class care.', NULL, 'Health & Children', 'Curing childhood cancer and saving children''s lives', TRUE)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- ============================================================================

-- Function to enforce max 5 golf scores per user (FIFO)
CREATE OR REPLACE FUNCTION enforce_max_five_scores()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM golf_scores
  WHERE id IN (
    SELECT id FROM golf_scores
    WHERE user_id = NEW.user_id
    ORDER BY created_at ASC
    LIMIT (
      SELECT GREATEST(COUNT(*) - 4, 0) FROM golf_scores WHERE user_id = NEW.user_id
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS max_five_scores_trigger ON golf_scores;
CREATE TRIGGER max_five_scores_trigger
AFTER INSERT ON golf_scores
FOR EACH ROW
EXECUTE FUNCTION enforce_max_five_scores();

-- Function to update user winnings total
CREATE OR REPLACE FUNCTION update_user_winnings()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE users
    SET total_winnings = (
      SELECT COALESCE(SUM(prize_amount), 0)
      FROM draw_winners
      WHERE user_id = NEW.user_id AND verification_status = 'verified'
    )
    WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users
    SET total_winnings = (
      SELECT COALESCE(SUM(prize_amount), 0)
      FROM draw_winners
      WHERE user_id = OLD.user_id AND verification_status = 'verified'
    )
    WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_winnings_trigger ON draw_winners;
CREATE TRIGGER update_winnings_trigger
AFTER INSERT OR UPDATE OR DELETE ON draw_winners
FOR EACH ROW
EXECUTE FUNCTION update_user_winnings();

-- Function to track subscription changes in audit log
CREATE OR REPLACE FUNCTION audit_subscription_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (admin_id, action, table_name, record_id, changes)
    VALUES (
      auth.uid(),
      'UPDATE_SUBSCRIPTION',
      'subscriptions',
      NEW.id,
      jsonb_build_object(
        'old', row_to_json(OLD),
        'new', row_to_json(NEW)
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_subscription_changes_trigger ON subscriptions;
CREATE TRIGGER audit_subscription_changes_trigger
AFTER UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION audit_subscription_changes();

-- ============================================================================
-- GRANT PERMISSIONS (Supabase Role Management)
-- ============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
