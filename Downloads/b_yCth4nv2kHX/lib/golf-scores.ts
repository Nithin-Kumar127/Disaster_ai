import { getSupabaseAdmin } from './supabase';
import { Database } from '@/types/database';

type GolfScore = Database['public']['Tables']['golf_scores']['Row'];

/**
 * Validate Stableford score (1-45)
 */
export function validateScore(score: number): boolean {
  return Number.isInteger(score) && score >= 1 && score <= 45;
}

/**
 * Add a new golf score for a user
 * Automatically maintains FIFO queue (max 5 scores)
 */
export async function addGolfScore(
  userId: string,
  score: number,
  scoreDate: string,
  courseName?: string
) {
  if (!validateScore(score)) {
    throw new Error('Invalid Stableford score. Must be between 1 and 45.');
  }

  const supabase = getSupabaseAdmin();

  // Get current scores count
  const { data: currentScores, error: fetchError } = await supabase
    .from('golf_scores')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (fetchError) {
    throw new Error(`Failed to fetch scores: ${fetchError.message}`);
  }

  // Check if we have 5 scores already
  if (currentScores && currentScores.length >= 5) {
    // Find the oldest score to delete (FIFO)
    const { data: oldestScores } = await supabase
      .from('golf_scores')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1);

    if (oldestScores && oldestScores[0]) {
      await supabase
        .from('golf_scores')
        .delete()
        .eq('id', oldestScores[0].id);
    }
  }

  // Insert new score
  const { data, error } = await supabase
    .from('golf_scores')
    .insert({
      user_id: userId,
      score,
      score_date: scoreDate,
      course_name: courseName || null,
      hole_count: 18,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add score: ${error.message}`);
  }

  return data;
}

/**
 * Get user's latest golf scores (max 5, in reverse chronological order)
 */
export async function getUserScores(userId: string): Promise<GolfScore[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('golf_scores')
    .select('*')
    .eq('user_id', userId)
    .order('score_date', { ascending: false })
    .limit(5);

  if (error) {
    throw new Error(`Failed to fetch scores: ${error.message}`);
  }

  return data || [];
}

/**
 * Get score statistics for a user
 */
export async function getScoreStats(userId: string) {
  const supabase = getSupabaseAdmin();

  const { data: scores, error } = await supabase
    .from('golf_scores')
    .select('score')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to fetch scores: ${error.message}`);
  }

  if (!scores || scores.length === 0) {
    return {
      count: 0,
      average: 0,
      highest: 0,
      lowest: 0,
    };
  }

  const scoreValues = scores.map(s => s.score);
  const sum = scoreValues.reduce((a, b) => a + b, 0);

  return {
    count: scores.length,
    average: Math.round((sum / scores.length) * 10) / 10,
    highest: Math.max(...scoreValues),
    lowest: Math.min(...scoreValues),
  };
}

/**
 * Update a golf score
 */
export async function updateGolfScore(
  scoreId: string,
  updates: {
    score?: number;
    scoreDate?: string;
    courseName?: string;
  }
) {
  if (updates.score !== undefined && !validateScore(updates.score)) {
    throw new Error('Invalid Stableford score. Must be between 1 and 45.');
  }

  const supabase = getSupabaseAdmin();

  const updateData: any = {};
  if (updates.score !== undefined) updateData.score = updates.score;
  if (updates.scoreDate !== undefined) updateData.score_date = updates.scoreDate;
  if (updates.courseName !== undefined) updateData.course_name = updates.courseName;
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('golf_scores')
    .update(updateData)
    .eq('id', scoreId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update score: ${error.message}`);
  }

  return data;
}

/**
 * Delete a golf score
 */
export async function deleteGolfScore(scoreId: string) {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('golf_scores')
    .delete()
    .eq('id', scoreId);

  if (error) {
    throw new Error(`Failed to delete score: ${error.message}`);
  }
}

/**
 * Get all users' scores for a specific date range
 * Used for analytics and draw engine
 */
export async function getScoresInDateRange(
  startDate: string,
  endDate: string
) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('golf_scores')
    .select('*')
    .gte('score_date', startDate)
    .lte('score_date', endDate)
    .order('score_date', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch scores: ${error.message}`);
  }

  return data || [];
}

/**
 * Calculate average score across all users
 * Used for platform statistics
 */
export async function getPlatformAverageScore(): Promise<number> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('golf_scores')
    .select('score');

  if (error || !data || data.length === 0) {
    return 0;
  }

  const sum = data.reduce((acc, row) => acc + row.score, 0);
  return Math.round((sum / data.length) * 10) / 10;
}
