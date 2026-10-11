'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BarChart3, Settings, Trophy, LogOut, Home, Heart, Shield, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: Home },
  { href: '/dashboard/scores', label: 'My Scores', icon: BarChart3 },
  { href: '/dashboard/winnings', label: 'Winnings', icon: Trophy },
  { href: '/dashboard/charity', label: 'Charity', icon: Heart },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          router.push('/signin');
          return;
        }

        // Check if user is admin
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        setIsAdmin(userData?.role === 'admin');
      } catch (error) {
        console.error('[v0] Auth check error:', error);
        router.push('/signin');
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAuth();
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/signin');
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/40 bg-sidebar">
        <div className="p-6 border-b border-border/40">
          <Link href="/" className="text-2xl font-bold text-primary">
            Golf Charity
          </Link>
        </div>

        <nav className="p-6 space-y-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <Button
                variant={pathname === href ? 'default' : 'ghost'}
                className={`w-full justify-start gap-3 ${
                  pathname === href ? 'bg-sidebar-primary text-sidebar-primary-foreground' : ''
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            </Link>
          ))}

          {isAdmin && (
            <div className="pt-4 border-t border-sidebar-border">
              <Link href="/admin">
                <Button
                  variant={pathname.startsWith('/admin') ? 'default' : 'ghost'}
                  className={`w-full justify-start gap-3 ${
                    pathname.startsWith('/admin') ? 'bg-sidebar-primary text-sidebar-primary-foreground' : ''
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </Button>
              </Link>
            </div>
          )}
        </nav>

        <div className="absolute bottom-6 left-6 right-6 flex gap-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
