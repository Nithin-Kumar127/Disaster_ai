'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Trophy, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Winner {
  id: string;
  draw_id: string;
  user_id: string;
  match_type: string;
  prize_amount: number;
  proof_url?: string;
  status: 'pending' | 'verified' | 'paid' | 'rejected';
  created_at: string;
}

export default function WinningsPage() {
  const [loading, setLoading] = useState(true);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    fetchWinnings();
  }, []);

  async function fetchWinnings() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        toast.error('Not authenticated');
        return;
      }

      setUserId(session.user.id);

      // Get user's winnings
      const { data: winnersData, error: winnersError } = await supabase
        .from('draw_winners')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (winnersError) {
        console.error('[v0] Error fetching winnings:', winnersError);
        toast.error('Failed to load winnings');
        return;
      }

      setWinners(winnersData || []);

      // Calculate total winnings
      const total = (winnersData || []).reduce((sum, winner) => {
        if (winner.status === 'paid' || winner.status === 'verified') {
          return sum + (winner.prize_amount || 0);
        }
        return sum;
      }, 0);

      setTotalWinnings(total);
    } catch (error) {
      console.error('[v0] Error:', error);
      toast.error('Failed to load winnings');
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'verified':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
        <h1 className="text-3xl font-bold text-foreground">Winnings</h1>
        <p className="text-muted-foreground mt-2">
          Track your draw winnings and verify your wins
        </p>
      </div>

      {/* Total Winnings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Total Winnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary">
            ${totalWinnings.toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Total paid and verified prizes
          </p>
        </CardContent>
      </Card>

      {/* Winnings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Winnings</CardTitle>
          <CardDescription>
            {winners.length} draw{winners.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {winners.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto opacity-50 mb-2" />
              <p className="text-muted-foreground">No winnings yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Keep entering scores to increase your chances of winning
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Match Type</TableHead>
                    <TableHead>Prize Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {winners.map((winner) => (
                    <TableRow key={winner.id}>
                      <TableCell className="font-medium">
                        {winner.match_type}-Number Match
                      </TableCell>
                      <TableCell>${winner.prize_amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge 
                          className={`${getStatusColor(winner.status)} text-xs`}
                          variant="outline"
                        >
                          {winner.status.charAt(0).toUpperCase() + winner.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(winner.created_at)}
                      </TableCell>
                      <TableCell>
                        {winner.status === 'pending' && !winner.proof_url && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="gap-1"
                          >
                            <Upload className="w-4 h-4" />
                            Upload Proof
                          </Button>
                        )}
                        {winner.status === 'pending' && winner.proof_url && (
                          <span className="text-xs text-muted-foreground">Awaiting Review</span>
                        )}
                        {(winner.status === 'verified' || winner.status === 'paid') && (
                          <span className="text-xs text-green-600">Verified</span>
                        )}
                        {winner.status === 'rejected' && (
                          <span className="text-xs text-red-600">Rejected</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How Winnings Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>3-Number Match (25%):</strong> Win by matching 3 of the drawn numbers
          </p>
          <p>
            <strong>4-Number Match (35%):</strong> Win by matching 4 of the drawn numbers
          </p>
          <p>
            <strong>5-Number Match (40%):</strong> Win the jackpot by matching all 5 numbers
          </p>
          <p className="mt-4">
            When you win, you'll need to upload proof of your score. Admin will verify and process payment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
