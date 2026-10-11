'use client';

import { useEffect, useState } from 'react';
import { Bell, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function AdminHeader() {
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getAdminInfo = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user?.email) {
          setAdminEmail(session.user.email);
        }
      } catch (error) {
        console.error('[v0] Error fetching admin info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getAdminInfo();
  }, []);

  return (
    <header className="border-b border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Admin Panel</h2>
          <p className="text-sm text-muted-foreground">
            Manage your Golf Charity Platform
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button className="rounded-lg p-2 hover:bg-muted">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </button>

          <div className="flex items-center gap-2 rounded-lg px-4 py-2 hover:bg-muted">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {!isLoading && adminEmail ? adminEmail : 'Admin'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
