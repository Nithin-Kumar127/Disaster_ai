'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Loader2, Check, X } from 'lucide-react';

interface WinnerData {
  id: string;
  user_id: string;
  draw_id: string;
  match_type: '3-number' | '4-number' | '5-number';
  prize_amount: number;
  verification_status: 'pending' | 'approved' | 'rejected';
  proof_url: string | null;
  created_at: string;
  user?: {
    email: string;
    full_name: string | null;
  };
}

export default function WinnersPage() {
  const [winners, setWinners] = useState<WinnerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('draw_winners')
        .select(`
          *,
          user:user_id (email, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWinners(data || []);
    } catch (err) {
      console.error('[v0] Error fetching winners:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateWinnerStatus = async (
    winnerId: string,
    status: 'approved' | 'rejected'
  ) => {
    try {
      const { error } = await supabase
        .from('draw_winners')
        .update({ verification_status: status })
        .eq('id', winnerId);

      if (error) throw error;

      setWinners(
        winners.map((w) =>
          w.id === winnerId
            ? { ...w, verification_status: status }
            : w
        )
      );
    } catch (err) {
      console.error('[v0] Error updating winner status:', err);
    }
  };

  const filteredWinners = winners.filter((winner) => {
    if (statusFilter === 'all') return true;
    return winner.verification_status === statusFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrizeColor = (matchType: string) => {
    switch (matchType) {
      case '5-number':
        return 'bg-primary/10 text-primary font-bold';
      case '4-number':
        return 'bg-blue-100 text-blue-800';
      case '3-number':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Winner Verification</h1>
        <p className="mt-2 text-muted-foreground">
          Review and verify winner proof submissions
        </p>
      </div>

      {/* Status Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Winners List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredWinners.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">No winners found</p>
            </CardContent>
          </Card>
        ) : (
          filteredWinners.map((winner) => (
            <Card key={winner.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {winner.user?.email || 'Unknown User'}
                      </h3>
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${getPrizeColor(winner.match_type)}`}>
                        {winner.match_type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {winner.user?.full_name || 'N/A'}
                    </p>
                    <div className="grid gap-2 md:grid-cols-3 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Prize Amount</p>
                        <p className="text-lg font-bold text-primary">
                          ${winner.prize_amount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusColor(winner.verification_status)}`}>
                          {winner.verification_status}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Submission Date</p>
                        <p className="text-sm font-medium">
                          {new Date(winner.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {winner.proof_url && (
                      <div className="mb-4">
                        <p className="text-xs text-muted-foreground mb-2">Proof Submission</p>
                        <a
                          href={winner.proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          View Proof →
                        </a>
                      </div>
                    )}
                  </div>

                  {winner.verification_status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateWinnerStatus(winner.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateWinnerStatus(winner.id, 'rejected')}
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
