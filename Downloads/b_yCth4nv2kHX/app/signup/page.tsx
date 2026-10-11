'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Charity {
  id: string;
  name: string;
  description?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [charityLoading, setCharityLoading] = useState(true);
  const [selectedCharity, setSelectedCharity] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadCharities();
  }, []);

  async function loadCharities() {
    try {
      setCharityLoading(true);
      const { data, error } = await supabase
        .from('charities')
        .select('id, name, description')
        .eq('is_active', true);

      if (error) {
        console.error('[v0] Error loading charities:', error);
        toast.error('Failed to load charities. Please try again.');
        return;
      }

      if (data) {
        setCharities(data);
        console.log('[v0] Loaded charities:', data.length);
      }
    } catch (error) {
      console.error('[v0] Error:', error);
      toast.error('Failed to load charities');
    } finally {
      setCharityLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    // Validate form
    if (!formData.fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    if (!formData.password) {
      toast.error('Please enter a password');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!selectedCharity) {
      toast.error('Please select a charity');
      return;
    }

    try {
      setLoading(true);

      // Sign up user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        console.error('[v0] Auth error:', authError);
        toast.error(authError.message || 'Failed to create account');
        return;
      }

      if (!authData.user?.id) {
        toast.error('Failed to create account');
        return;
      }

      // Create user profile in database
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: formData.email,
          full_name: formData.fullName,
          charity_id: selectedCharity,
          role: 'user',
          subscription_status: 'inactive',
        }]);

      if (profileError) {
        console.error('[v0] Profile error:', profileError);
        toast.error('Failed to create profile');
        // Try to clean up auth user if profile creation failed
        await supabase.auth.admin?.deleteUser(authData.user.id);
        return;
      }

      toast.success('Account created successfully! Please sign in.');
      router.push('/signin');
    } catch (error) {
      console.error('[v0] Signup error:', error);
      toast.error('An error occurred during signup');
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Join our golf charity platform and support your favorite causes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full Name */}
            <FieldGroup>
              <Field>
                <FieldLabel>Full Name</FieldLabel>
                <Input
                  type="text"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </Field>
            </FieldGroup>

            {/* Email */}
            <FieldGroup>
              <Field>
                <FieldLabel>Email Address</FieldLabel>
                <Input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </Field>
            </FieldGroup>

            {/* Password */}
            <FieldGroup>
              <Field>
                <FieldLabel>Password</FieldLabel>
                <Input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </Field>
            </FieldGroup>

            {/* Confirm Password */}
            <FieldGroup>
              <Field>
                <FieldLabel>Confirm Password</FieldLabel>
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </Field>
            </FieldGroup>

            {/* Charity Selection */}
            <FieldGroup>
              <Field>
                <FieldLabel>Select Your Charity</FieldLabel>
                {charityLoading ? (
                  <div className="flex items-center justify-center p-3 border border-border rounded-md bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Loading charities...</span>
                  </div>
                ) : charities.length === 0 ? (
                  <div className="flex items-center gap-2 p-3 border border-destructive/50 rounded-md bg-destructive/5">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <div>
                      <p className="text-sm font-semibold text-destructive">Database Not Ready</p>
                      <p className="text-xs text-muted-foreground">
                        Please initialize the database by running the SQL schema in Supabase.
                      </p>
                    </div>
                  </div>
                ) : (
                  <Select value={selectedCharity} onValueChange={setSelectedCharity} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a charity to support" />
                    </SelectTrigger>
                    <SelectContent>
                      {charities.map((charity) => (
                        <SelectItem key={charity.id} value={charity.id}>
                          {charity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </Field>
            </FieldGroup>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={loading || charities.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            {/* Sign In Link */}
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/signin" className="text-primary hover:underline font-semibold">
                Sign in here
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
