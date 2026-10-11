import { getSupabaseAdmin } from './supabase';
import { Database } from '@/types/database';

type Draw = Database['public']['Tables']['draws']['Row'];
type DrawWinner = Database['public']['Tables']['draw_winners']['Row'];
type GolfScore = Database['public']['Tables']['golf_scores']['Row'];

/**
 * Generate random winning numbers for a draw (5 numbers between 1-99)
 */
export function generateWinningNumbers(): number[] {
  const numbers = new Set<number>();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 99) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Generate weighted winning numbers based on user scores
 * Higher scores = higher chance of being drawn
 */
export async function generateWeightedWinningNumbers(): Promise<number[]> {
  const supabase = getSupabaseAdmin();

  // Fetch all recent scores
  const { data: scores, error } = await supabase
    .from('golf_scores')
    .select('score')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error || !scores || scores.length === 0) {
    // Fallback to random if no scores available
    return generateWinningNumbers();
  }

  // Weight distribution: higher scores get weighted to appear more in draws
  const weights = scores.map(s => s.score);
  const maxScore = Math.max(...weights);
  const normalizedWeights = weights.map(w => (w / maxScore) * 99 + 1);

  const numbers = new Set<number>();
  while (numbers.size < 5) {
    // Weighted random selection
    const randomIndex = Math.floor(Math.random() * normalizedWeights.length);
    const number = Math.floor(normalizedWeights[randomIndex]);
    numbers.add(Math.max(1, Math.min(99, number)));
  }

  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Match user scores against winning numbers
 */
export function matchUserScores(scores: GolfScore[], winningNumbers: number[]): {
  matchCount: number;
  matchedNumbers: number[];
} {
  const userNumbers = scores
    .map(s => s.score)
    .sort((a, b) => a - b);

  const matchedNumbers: number[] = [];
  let matchCount = 0;

  for (const userNumber of userNumbers) {
    if (winningNumbers.includes(userNumber)) {
      matchedNumbers.push(userNumber);
      matchCount++;
    }
  }

  return { matchCount, matchedNumbers };
}

/**
 * Get all active subscribers for a month
 */
export async function getActiveSubscribers(drawMonth: Date) {
  const supabase = getSupabaseAdmin();
  const monthStart = new Date(drawMonth.getFullYear(), drawMonth.getMonth(), 1);
  const monthEnd = new Date(drawMonth.getFullYear(), drawMonth.getMonth() + 1, 0);

  const { data, error } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active')
    .gte('current_period_start', monthStart.toISOString())
    .lte('current_period_end', monthEnd.toISOString());

  if (error) {
    throw new Error(`Failed to fetch subscribers: ${error.message}`);
  }

  return data || [];
}

/**
 * Calculate prize distribution for a draw
 */
export function calculatePrizeDistribution(totalPool: number) {
  return {
    jackpot: totalPool * 0.40,
    fourNumber: totalPool * 0.35,
    threeNumber: totalPool * 0.25,
  };
}

/**
 * Execute a monthly draw
 */
export async function executeMonthlyDraw(drawMonth: Date, useWeighted = false) {
  const supabase = getSupabaseAdmin();
  const monthKey = `${drawMonth.getFullYear()}-${String(drawMonth.getMonth() + 1).padStart(2, '0')}-01`;

  try {
    // Check if draw already exists
    const { data: existingDraw } = await supabase
      .from('draws')
      .select()
      .eq('draw_month', monthKey)
      .single();

    if (existingDraw && existingDraw.status !== 'scheduled') {
      throw new Error(`Draw for ${monthKey} already executed`);
    }

    // Get total prize pool from subscriptions
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('amount_cents')
      .eq('status', 'active');

    const totalPool = (subscriptions || []).reduce((sum, sub) => sum + sub.amount_cents, 0) / 100;

    // Generate winning numbers
    const winningNumbers = useWeighted
      ? await generateWeightedWinningNumbers()
      : generateWinningNumbers();

    // Create draw record
    const { data: draw, error: drawError } = await supabase
      .from('draws')
      .upsert({
        draw_month: monthKey,
        draw_type: 'monthly',
        status: 'executed',
        total_prize_pool: totalPool,
        winning_numbers: winningNumbers,
        executed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (drawError) {
      throw new Error(`Failed to create draw: ${drawError.message}`);
    }

    // Get all active subscribers and their latest scores
    const { data: subscribers } = await supabase
      .from('users')
      .select('id')
      .eq('subscription_status', 'active');

    const prizes = calculatePrizeDistribution(totalPool);
    const winners: DrawWinner[] = [];

    // Check each subscriber for wins
    for (const subscriber of subscribers || []) {
      const { data: scores } = await supabase
        .from('golf_scores')
        .select('*')
        .eq('user_id', subscriber.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!scores || scores.length === 0) continue;

      const { matchCount, matchedNumbers } = matchUserScores(scores, winningNumbers);

      // Determine if winner
      if (matchCount === 5) {
        winners.push({
          id: crypto.randomUUID(),
          draw_id: draw.id,
          user_id: subscriber.id,
          matched_numbers: matchedNumbers,
          match_count: 5,
          prize_amount: prizes.jackpot,
          proof_screenshot_url: null,
          verification_status: 'pending',
          verified_by_admin_id: null,
          verified_at: null,
          paid_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } else if (matchCount === 4) {
        winners.push({
          id: crypto.randomUUID(),
          draw_id: draw.id,
          user_id: subscriber.id,
          matched_numbers: matchedNumbers,
          match_count: 4,
          prize_amount: prizes.fourNumber,
          proof_screenshot_url: null,
          verification_status: 'pending',
          verified_by_admin_id: null,
          verified_at: null,
          paid_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } else if (matchCount === 3) {
        winners.push({
          id: crypto.randomUUID(),
          draw_id: draw.id,
          user_id: subscriber.id,
          matched_numbers: matchedNumbers,
          match_count: 3,
          prize_amount: prizes.threeNumber,
          proof_screenshot_url: null,
          verification_status: 'pending',
          verified_by_admin_id: null,
          verified_at: null,
          paid_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }

    // Insert winners
    if (winners.length > 0) {
      const { error: winnersError } = await supabase
        .from('draw_winners')
        .insert(winners);

      if (winnersError) {
        throw new Error(`Failed to insert winners: ${winnersError.message}`);
      }
    }

    return {
      draw,
      winningNumbers,
      winnerCount: winners.length,
      totalPrizePool: totalPool,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Simulate a draw without committing results (for testing)
 */
export async function simulateDraw(adminId: string, drawMonth: Date, useWeighted = false) {
  const monthKey = `${drawMonth.getFullYear()}-${String(drawMonth.getMonth() + 1).padStart(2, '0')}-01`;
  const winningNumbers = useWeighted
    ? await generateWeightedWinningNumbers()
    : generateWinningNumbers();

  const supabase = getSupabaseAdmin();

  // Fetch all subscribers and their scores for simulation
  const { data: subscribers } = await supabase
    .from('users')
    .select('id')
    .eq('subscription_status', 'active');

  const simulationResults: any = {
    winningNumbers,
    matches: { 5: 0, 4: 0, 3: 0 },
    estimatedPrizes: {},
  };

  for (const subscriber of subscribers || []) {
    const { data: scores } = await supabase
      .from('golf_scores')
      .select('*')
      .eq('user_id', subscriber.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!scores || scores.length === 0) continue;

    const { matchCount } = matchUserScores(scores, winningNumbers);
    if (matchCount >= 3) {
      simulationResults.matches[matchCount as 3 | 4 | 5]++;
    }
  }

  // Save simulation
  const { data, error } = await supabase
    .from('draw_simulations')
    .insert({
      admin_id: adminId,
      draw_month: monthKey,
      simulated_winning_numbers: winningNumbers,
      simulation_results: simulationResults,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save simulation: ${error.message}`);
  }

  return { simulation: data, results: simulationResults };
}
