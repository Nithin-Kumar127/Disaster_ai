'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { Loader2, Save, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  subscription_status?: string;
  charity_id?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        toast.error('Not authenticated');
        router.push('/signin');
        return;
      }

      // Get user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name')
        .eq('id', session.user.id)
        .single() as { data: { id: string; email: string; full_name: string | null } | null; error: any };

      if (userError) {
        console.error('[v0] Error fetching profile:', userError);
        toast.error('Failed to load profile');
        return;
      }

      setProfile(userData as UserProfile);
      setFormData({
        fullName: userData?.full_name || '',
        email: userData?.email || session.user.email || '',
      });
    } catch (error) {
      console.error('[v0] Error:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();

    if (!profile?.id) {
      toast.error('Profile not loaded');
      return;
    }

    try {
      setSaving(true);

      const updateResult = await (supabase as any)
        .from('users')
        .update({
          full_name: formData.fullName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (updateResult.error) {
        console.error('[v0] Error saving profile:', updateResult.error);
        toast.error('Failed to save profile');
        return;
      }

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('[v0] Error:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      router.push('/signin');
    } catch (error) {
      console.error('[v0] Error signing out:', error);
      toast.error('Failed to sign out');
    }
  }

  async function handleChangePassword() {
    toast.info('Password change functionality coming soon');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Full Name</FieldLabel>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed
                </p>
              </Field>
            </FieldGroup>

            <Button 
              type="submit" 
              disabled={saving}
              className="w-full gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Subscription Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>
            View your subscription status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-2">Current Plan</h3>
            <p className="text-sm text-muted-foreground capitalize">
              {profile?.subscription_status || 'Inactive'}
            </p>
          </div>
          <Button variant="outline" className="w-full">
            Manage Subscription
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Manage your account security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleChangePassword}
          >
            Change Password
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
          >
            Enable Two-Factor Authentication
          </Button>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full gap-2 text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
          <Button 
            variant="outline" 
            className="w-full text-destructive"
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* Help */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Have questions about your account? Check out our{' '}
            <a href="/help" className="text-primary hover:underline">
              help center
            </a>
          </p>
          <p>
            Or contact us at{' '}
            <a href="mailto:support@golfcharity.com" className="text-primary hover:underline">
              support@golfcharity.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
