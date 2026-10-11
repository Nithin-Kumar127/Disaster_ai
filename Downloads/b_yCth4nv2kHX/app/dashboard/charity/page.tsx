'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Charity {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  category?: string;
}

interface UserCharity {
  charityId: string;
  charity?: Charity;
  allocation_percentage: number;
}

export default function CharityPage() {
  const [loading, setLoading] = useState(true);
  const [userCharity, setUserCharity] = useState<UserCharity | null>(null);
  const [charity, setCharity] = useState<Charity | null>(null);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    fetchUserCharity();
  }, []);

  async function fetchUserCharity() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        toast.error('Not authenticated');
        return;
      }

      setUserId(session.user.id);

      // Get user's selected charity
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('selected_charity_id, charity_percentage')
        .eq('id', session.user.id)
        .single() as { data: { selected_charity_id: string | null; charity_percentage: number } | null; error: any };

      if (userError) {
        console.error('[v0] Error fetching user charity:', userError);
        toast.error('Failed to load charity information');
        return;
      }

      // Get charity details
      let charityData: Charity | null = null;
      if (userData?.selected_charity_id) {
        const { data: charityInfo, error: charityError } = await supabase
          .from('charities')
          .select('id, name, description, logo_url, category')
          .eq('id', userData.selected_charity_id)
          .single() as { data: Charity | null; error: any };

        if (charityError) {
          console.error('[v0] Error fetching charity details:', charityError);
        } else {
          charityData = charityInfo;
        }
      }

      const allocationData = { charity_id: userData?.selected_charity_id, charities: charityData };
      const allocationError = null;

      if (allocationData && allocationData.charities) {
        const charityData = allocationData.charities;
        setUserCharity({
          charityId: allocationData.charity_id || '',
          charity: charityData,
          allocation_percentage: 10,
        });
        setCharity(charityData);
      }
    } catch (error) {
      console.error('[v0] Error:', error);
      toast.error('Failed to load charity');
    } finally {
      setLoading(false);
    }
  }

  async function handleChangeCharity() {
    // This would navigate to a charity selection dialog
    toast.info('Charity change feature coming soon');
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
        <h1 className="text-3xl font-bold text-foreground">My Charity</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your selected charity
        </p>
      </div>

      {charity ? (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  {charity.name}
                </CardTitle>
                <CardDescription>{charity.category}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">{charity.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-sm text-foreground mb-2">Contribution</h3>
                <Badge variant="outline" className="text-sm">
                  10% of subscription
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground mb-2">Status</h3>
                <Badge className="bg-primary text-primary-foreground">Active</Badge>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-foreground mb-2">How Your Contribution Helps</h3>
              <p className="text-sm text-muted-foreground">
                10% of your monthly subscription fee is donated directly to {charity.name}. 
                This helps support their mission and make a real impact in the community.
              </p>
            </div>

            <div className="pt-4 border-t border-border">
              <Button 
                variant="outline" 
                onClick={handleChangeCharity}
                className="w-full"
              >
                Change Charity
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
              <p className="text-muted-foreground">No charity selected yet</p>
              <p className="text-xs text-muted-foreground">
                You'll select a charity during signup
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
