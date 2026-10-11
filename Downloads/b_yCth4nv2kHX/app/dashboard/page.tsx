'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Heart, Trophy, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  subscription_status?: string;
  subscription_tier?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalScores: 0,
    averageScore: 0,
    totalWinnings: 0,
    subscriptionStatus: 'inactive',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch stats only after profile is loaded
  useEffect(() => {
    if (profile) {
      fetchStats();
    }
  }, [profile]);

  async function fetchProfile() {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push('/signin');
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (userError) {
        // PGRST116 = no rows found in Supabase
        if (userError.code === 'PGRST116') {
          toast.error('Profile not found. Please contact support.');
        } else {
          console.error('[v0] Error fetching profile:', userError);
          toast.error('Failed to load profile');
        }
        return;
      }

      setProfile(userData);
    } catch (error) {
      console.error('[v0] Error:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user?.id) return;

      // Fetch scores
      const { data: scoresData, error: scoresError } = await supabase
        .from('golf_scores')
        .select('score')
        .eq('user_id', session.user.id);

      if (scoresError) {
        console.error('[v0] Error fetching scores:', scoresError);
        return;
      }

      // Fetch winnings
      const { data: winnersData, error: winnersError } = await supabase
        .from('draw_winners')
        .select('prize_amount')
        .eq('user_id', session.user.id)
        .eq('verification_status', 'verified');

      if (winnersError) {
        console.error('[v0] Error fetching winnings:', winnersError);
        return;
      }

      const totalWinnings = (winnersData || []).reduce(
        (sum: number, w: any) => sum + (w.prize_amount || 0),
        0
      );
      const scores = scoresData || [];
      const avgScore =
        scores.length > 0
          ? scores.reduce((sum: number, s: any) => sum + (s.score || 0), 0) / scores.length
          : 0;

      setStats({
        totalScores: scores.length,
        averageScore: avgScore,
        totalWinnings,
        subscriptionStatus: profile?.subscription_status || 'inactive',
      });
    } catch (error) {
      console.error('[v0] Error fetching stats:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Welcome, {profile?.full_name || 'Member'}!
        </h1>
        <p className="text-muted-foreground">
          {profile?.subscription_status === 'active'
            ? 'Your subscription is active. Keep recording scores to enter the monthly draws!'
            : 'Subscribe now to start entering our monthly draws.'}
        </p>
      </div>

      {/* Subscription Status Banner */}
      {profile?.subscription_status !== 'active' && (
        <Card className="border-accent/50 bg-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Subscribe to Get Started</h3>
                <p className="text-sm text-muted-foreground">
                  Upgrade to an active subscription to enter draws and support your chosen charity.
                </p>
              </div>
              <Button className="bg-primary hover:bg-primary/90">Subscribe Now</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Total Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.totalScores}</div>
            <p className="text-xs text-muted-foreground mt-1">Stableford scores recorded</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.averageScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">Your average Stableford</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              Total Winnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">${stats.totalWinnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Prize money earned</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" />
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={profile?.subscription_status === 'active' ? 'default' : 'secondary'}
              className="capitalize"
            >
              {profile?.subscription_status || 'Inactive'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              {profile?.subscription_tier
                ? `${profile.subscription_tier.charAt(0).toUpperCase() + profile.subscription_tier.slice(1)} Plan`
                : 'No plan'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Record a Score</CardTitle>
            <CardDescription>Add your latest Stableford score</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/scores?action=add">
              <Button className="w-full bg-primary hover:bg-primary/90">Add New Score</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Charity Information</CardTitle>
            <CardDescription>View your selected charity details</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4 text-foreground font-medium">
              Supporting charitable giving
            </p>
            <Link href="/dashboard/charity">
              <Button variant="outline" className="w-full">View Details</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Next Draw */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Next Draw</CardTitle>
          <CardDescription>Information about the upcoming monthly draw</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Draw Month</p>
              <p className="text-lg font-semibold text-foreground">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Jackpot (5-Number)</p>
                <p className="text-lg font-semibold text-primary">40%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">4-Number Match</p>
                <p className="text-lg font-semibold text-primary">35%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">3-Number Match</p>
                <p className="text-lg font-semibold text-primary">25%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}