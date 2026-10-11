'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Loader2, Play, Eye } from 'lucide-react';

interface DrawData {
  id: string;
  draw_date: string;
  status: 'scheduled' | 'generated' | 'published' | 'completed';
  prize_pool: number;
  winning_number_3: string;
  winning_number_4: string;
  winning_number_5: string;
  total_tickets: number;
  created_at: string;
}

export default function DrawsPage() {
  const [draws, setDraws] = useState<DrawData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchDraws();
  }, []);

  const fetchDraws = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('draws')
        .select('*')
        .order('draw_date', { ascending: false });

      if (error) throw error;
      setDraws(data || []);
    } catch (err) {
      console.error('[v0] Error fetching draws:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewDraw = async () => {
    try {
      setIsCreating(true);
      const nextMonthDate = new Date();
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

      const { error } = await supabase
        .from('draws')
        .insert({
          draw_date: nextMonthDate.toISOString().split('T')[0],
          status: 'scheduled',
          prize_pool: 0,
          total_tickets: 0,
        });

      if (error) throw error;
      fetchDraws();
    } catch (err) {
      console.error('[v0] Error creating draw:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'generated':
        return 'bg-yellow-100 text-yellow-800';
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Draws Management</h1>
          <p className="mt-2 text-muted-foreground">
            Create and manage monthly prize draws
          </p>
        </div>
        <Button onClick={createNewDraw} disabled={isCreating}>
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Draw'
          )}
        </Button>
      </div>

      {/* Draws Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Draws ({draws.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : draws.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">No draws created yet</p>
              <Button onClick={createNewDraw} className="mt-4">
                Create First Draw
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      Draw Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      Total Tickets
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      Prize Pool
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      Winners
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {draws.map((draw) => (
                    <tr key={draw.id} className="border-b border-border hover:bg-muted">
                      <td className="px-4 py-3 text-sm text-foreground">
                        {new Date(draw.draw_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusColor(draw.status)}`}>
                          {draw.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {draw.total_tickets}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        ${draw.prize_pool.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 text-xs">
                          <span className="rounded-lg bg-muted px-2 py-1">
                            5#: {draw.winning_number_5 || '-'}
                          </span>
                          <span className="rounded-lg bg-muted px-2 py-1">
                            4#: {draw.winning_number_4 || '-'}
                          </span>
                          <span className="rounded-lg bg-muted px-2 py-1">
                            3#: {draw.winning_number_3 || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {draw.status === 'scheduled' && (
                            <Button size="sm">
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
