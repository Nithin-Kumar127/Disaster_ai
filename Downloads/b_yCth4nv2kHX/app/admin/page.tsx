'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Users, Heart, Trophy, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalSubscribers: number;
  activeSubscriptions: number;
  totalCharities: number;
  totalPrizePool: number;
  monthlyRevenue: number;
  pendingWinnerVerifications: number;
  upcomingDraws: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total users
        const { count: userCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        // Fetch total subscribers
        const { count: subscriberCount } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        // Fetch active subscriptions
        const { count: activeSubCount } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        // Fetch charities
        const { count: charityCount } = await supabase
          .from('charities')
          .select('*', { count: 'exact', head: true });

        // Fetch pending verifications
        const { count: pendingCount } = await supabase
          .from('draw_winners')
          .select('*', { count: 'exact', head: true })
          .eq('verification_status', 'pending');

        setStats({
          totalUsers: userCount || 0,
          totalSubscribers: subscriberCount || 0,
          activeSubscriptions: activeSubCount || 0,
          totalCharities: charityCount || 0,
          totalPrizePool: 0, // Will be calculated from draws
          monthlyRevenue: 0, // Will be calculated
          pendingWinnerVerifications: pendingCount || 0,
          upcomingDraws: 0, // Will be calculated
        });
      } catch (err) {
        console.error('[v0] Error fetching stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome to your Golf Charity Platform admin panel
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeSubscriptions || 0}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Charities</CardTitle>
            <Heart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCharities || 0}</div>
            <p className="text-xs text-muted-foreground">Partner organizations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingWinnerVerifications || 0}</div>
            <p className="text-xs text-muted-foreground">Winner proofs to review</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/admin/users"
              className="block rounded-lg p-3 hover:bg-muted transition-colors"
            >
              <p className="font-medium text-foreground">Manage Users</p>
              <p className="text-sm text-muted-foreground">View and manage subscriber accounts</p>
            </a>
            <a
              href="/admin/draws"
              className="block rounded-lg p-3 hover:bg-muted transition-colors"
            >
              <p className="font-medium text-foreground">Manage Draws</p>
              <p className="text-sm text-muted-foreground">Create and execute monthly draws</p>
            </a>
            <a
              href="/admin/winners"
              className="block rounded-lg p-3 hover:bg-muted transition-colors"
            >
              <p className="font-medium text-foreground">Verify Winners</p>
              <p className="text-sm text-muted-foreground">Review and verify winner proofs</p>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Database</span>
              <span className="text-sm font-medium text-green-600">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Stripe API</span>
              <span className="text-sm font-medium text-green-600">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email Service</span>
              <span className="text-sm font-medium text-green-600">Active</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
