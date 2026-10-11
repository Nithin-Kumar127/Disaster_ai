'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface GolfScore {
  id: string;
  score: number;
  score_date: string;
  course_name?: string;
  created_at: string;
}

export default function ScoresPage() {
  const router = useRouter();
  const [scores, setScores] = useState<GolfScore[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [newScore, setNewScore] = useState({
    score: '',
    scoreDate: new Date().toISOString().split('T')[0],
    courseName: '',
  });

  useEffect(() => {
    fetchUserAndScores();
  }, []);

  async function fetchUserAndScores() {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        router.push('/signin');
        return;
      }

      setUserId(session.user.id);
      await fetchScores(session.user.id);
    } catch (error) {
      console.error('[v0] Error:', error);
      toast.error('Failed to load scores');
      setLoading(false);
    }
  }

  async function fetchScores(userId: string) {
    try {
      const { data: scoresData, error: scoresError } = await supabase
        .from('golf_scores')
        .select('*')
        .eq('user_id', userId)
        .order('score_date', { ascending: false });

      if (scoresError) {
        console.error('[v0] Error fetching scores:', scoresError);
        toast.error('Failed to load scores');
        return;
      }

      setScores(scoresData || []);

      // Calculate stats
      if (scoresData && scoresData.length > 0) {
        const avgScore = scoresData.reduce((sum, s) => sum + (s.score || 0), 0) / scoresData.length;
        const maxScore = Math.max(...scoresData.map(s => s.score || 0));
        const minScore = Math.min(...scoresData.map(s => s.score || 0));

        setStats({
          count: scoresData.length,
          average: avgScore,
          highest: maxScore,
          lowest: minScore,
        });
      }
    } catch (error) {
      console.error('[v0] Error:', error);
      toast.error('Failed to load scores');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddScore(e: React.FormEvent) {
    e.preventDefault();

    if (!newScore.score || !newScore.scoreDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const scoreValue = parseInt(newScore.score);
    if (scoreValue < 1 || scoreValue > 45) {
      toast.error('Score must be between 1 and 45 (Stableford)');
      return;
    }

    try {
      setIsAdding(true);

      if (!userId) {
        toast.error('User not authenticated');
        return;
      }

      // Insert score into database
      const { error: insertError } = await supabase
        .from('golf_scores')
        .insert([{
          user_id: userId,
          score: scoreValue,
          score_date: newScore.scoreDate,
          course_name: newScore.courseName || null,
        }]);

      if (insertError) {
        console.error('[v0] Error adding score:', insertError);
        toast.error('Failed to add score');
        return;
      }

      toast.success('Score added successfully!');
      setNewScore({ score: '', scoreDate: new Date().toISOString().split('T')[0], courseName: '' });
      setIsAdding(false);
      await fetchScores(userId);
    } catch (error) {
      console.error('[v0] Error:', error);
      toast.error('An error occurred');
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDeleteScore(scoreId: string) {
    try {
      const { error } = await supabase
        .from('golf_scores')
        .delete()
        .eq('id', scoreId);

      if (error) {
        console.error('[v0] Error deleting score:', error);
        toast.error('Failed to delete score');
        return;
      }

      toast.success('Score deleted successfully');
      if (userId) {
        await fetchScores(userId);
      }
    } catch (error) {
      console.error('[v0] Error:', error);
      toast.error('Failed to delete score');
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
        <h1 className="text-4xl font-bold text-foreground mb-2">Your Stableford Scores</h1>
        <p className="text-muted-foreground">
          Record and track your golf scores. We keep your latest 5 scores for draw entries.
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{stats.count}</div>
              <p className="text-xs text-muted-foreground">Scores Recorded</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{stats.average.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Average</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{stats.highest}</div>
              <p className="text-xs text-muted-foreground">Best</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{stats.lowest}</div>
              <p className="text-xs text-muted-foreground">Lowest</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Score Form */}
      {isAdding && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle>Add New Score</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddScore} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Stableford Score *</FieldLabel>
                    <Input
                      type="number"
                      min="1"
                      max="45"
                      placeholder="e.g., 35"
                      value={newScore.score}
                      onChange={(e) => setNewScore({ ...newScore, score: e.target.value })}
                      required
                    />
                  </Field>
                </FieldGroup>

                <FieldGroup>
                  <Field>
                    <FieldLabel>Date *</FieldLabel>
                    <Input
                      type="date"
                      value={newScore.scoreDate}
                      onChange={(e) => setNewScore({ ...newScore, scoreDate: e.target.value })}
                      required
                    />
                  </Field>
                </FieldGroup>

                <FieldGroup>
                  <Field>
                    <FieldLabel>Course Name</FieldLabel>
                    <Input
                      type="text"
                      placeholder="Optional"
                      value={newScore.courseName}
                      onChange={(e) => setNewScore({ ...newScore, courseName: e.target.value })}
                    />
                  </Field>
                </FieldGroup>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Add Score
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!isAdding && (
        <Button onClick={() => setIsAdding(true)} className="bg-primary hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" />
          Add New Score
        </Button>
      )}

      {/* Scores Table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Your Latest Scores</CardTitle>
          <CardDescription>Most recent Stableford scores (max 5 displayed)</CardDescription>
        </CardHeader>
        <CardContent>
          {scores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No scores recorded yet. Add your first score to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scores.map((score) => (
                    <TableRow key={score.id}>
                      <TableCell>
                        {new Date(score.score_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-semibold text-primary">{score.score}</TableCell>
                      <TableCell>{score.course_name || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteScore(score.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="border-border/50 bg-secondary/30">
        <CardHeader>
          <CardTitle className="text-base">How Scores Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • <strong>Stableford System:</strong> Scores range from 1 (worst) to 45 (best)
          </p>
          <p>
            • <strong>Latest 5:</strong> We track your most recent 5 scores automatically
          </p>
          <p>
            • <strong>Draw Entry:</strong> Your scores are used for monthly prize draw matching
          </p>
          <p>
            • <strong>No Limits:</strong> Add as many scores as you want throughout the month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
