export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'user' | 'admin';
          subscription_status: 'active' | 'inactive' | 'expired' | 'cancelled';
          subscription_tier: 'monthly' | 'yearly' | null;
          subscription_start_date: string | null;
          subscription_end_date: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          selected_charity_id: string | null;
          charity_percentage: number;
          total_winnings: number;
          profile_image_url: string | null;
          bio: string | null;
          handicap: number | null;
          home_course: string | null;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Row']>;
      };
      charities: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          logo_url: string | null;
          website_url: string | null;
          email: string | null;
          category: string | null;
          impact_statement: string | null;
          total_raised: number;
          subscriber_count: number;
          is_featured: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['charities']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['charities']['Row']>;
      };
      golf_scores: {
        Row: {
          id: string;
          user_id: string;
          score: number;
          score_date: string;
          course_name: string | null;
          hole_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['golf_scores']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['golf_scores']['Row']>;
      };
      draws: {
        Row: {
          id: string;
          draw_month: string;
          draw_type: 'monthly' | 'special';
          status: 'scheduled' | 'executed' | 'published' | 'cancelled';
          total_prize_pool: number;
          jackpot_amount: number;
          four_number_pool: number;
          three_number_pool: number;
          winning_numbers: number[];
          executed_at: string | null;
          published_at: string | null;
          executed_by_admin_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['draws']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['draws']['Row']>;
      };
      draw_winners: {
        Row: {
          id: string;
          draw_id: string;
          user_id: string;
          matched_numbers: number[];
          match_count: 3 | 4 | 5;
          prize_amount: number;
          proof_screenshot_url: string | null;
          verification_status: 'pending' | 'verified' | 'rejected';
          verified_by_admin_id: string | null;
          verified_at: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['draw_winners']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['draw_winners']['Row']>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string | null;
          stripe_price_id: string | null;
          status: 'active' | 'past_due' | 'unpaid' | 'cancelled' | 'expired';
          tier: 'monthly' | 'yearly';
          amount_cents: number;
          currency: string;
          current_period_start: string | null;
          current_period_end: string | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['subscriptions']['Row']>;
      };
      charity_allocations: {
        Row: {
          id: string;
          charity_id: string;
          month_year: string;
          total_allocated: number;
          subscriber_count: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['charity_allocations']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['charity_allocations']['Row']>;
      };
      draw_simulations: {
        Row: {
          id: string;
          admin_id: string;
          draw_month: string | null;
          simulated_winning_numbers: number[];
          simulation_results: Record<string, any> | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['draw_simulations']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['draw_simulations']['Row']>;
      };
      audit_log: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          table_name: string | null;
          record_id: string | null;
          changes: Record<string, any> | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['audit_log']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['audit_log']['Row']>;
      };
    };
  };
};
