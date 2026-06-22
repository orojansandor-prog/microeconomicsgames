import { supabase } from './supabase'

export interface ScoreEntry {
  user_id: string
  user_email: string
  level: number          // 1-4 = monopoly, 5-8 = supply-demand (SD level N = score level N+4)
  score: number
  accuracy_points: number
  time_bonus: number
  quiz_points: number
  time_taken_seconds: number
  scenario_id: string
}

export interface LeaderboardRow {
  user_email: string
  score: number
  accuracy_points: number
  time_bonus: number
  quiz_points: number
  time_taken_seconds: number
  created_at: string
}

export interface LeaderboardResult {
  top10: LeaderboardRow[]
  myEntry: { row: LeaderboardRow; rank: number } | null  // null = user in top10 or has no score
}

export interface MyScoreRow {
  level: number
  score: number
  accuracy_points: number
  time_bonus: number
  quiz_points: number
  time_taken_seconds: number
  scenario_id: string
  created_at: string
}

export async function submitScore(entry: ScoreEntry): Promise<void> {
  await supabase.from('game_scores').insert(entry)
}

// Returns top 10 + current user's entry (with rank) if they're outside top 10
// level 1-4 = monopoly, level 5-8 = supply-demand
export async function fetchLeaderboard(level: number, myEmail?: string): Promise<LeaderboardResult> {
  const { data } = await supabase
    .from('game_scores')
    .select('user_email, score, accuracy_points, time_bonus, quiz_points, time_taken_seconds, created_at')
    .eq('level', level)
    .order('score', { ascending: false })
    .limit(500)

  if (!data) return { top10: [], myEntry: null }

  // Deduplicate: keep best score per user
  const seen = new Map<string, LeaderboardRow>()
  for (const row of data) {
    if (!seen.has(row.user_email) || row.score > seen.get(row.user_email)!.score) {
      seen.set(row.user_email, row as LeaderboardRow)
    }
  }

  // Full ranked list sorted by score desc
  const ranked = Array.from(seen.values()).sort((a, b) => b.score - a.score)
  const top10 = ranked.slice(0, 10)

  let myEntry: LeaderboardResult['myEntry'] = null
  if (myEmail) {
    const myIdx = ranked.findIndex(r => r.user_email === myEmail)
    if (myIdx >= 10) {
      myEntry = { row: ranked[myIdx], rank: myIdx + 1 }
    }
  }

  return { top10, myEntry }
}

// Returns all scores for the current user, newest first
export async function fetchMyScores(userId: string): Promise<MyScoreRow[]> {
  const { data } = await supabase
    .from('game_scores')
    .select('level, score, accuracy_points, time_bonus, quiz_points, time_taken_seconds, scenario_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)
  return (data as MyScoreRow[]) || []
}

export function calcAccuracyPoints(playerQ: number, optimalQ: number): number {
  const pct = Math.abs(playerQ - optimalQ) / optimalQ
  if (pct <= 0.02) return 500
  if (pct <= 0.05) return 420
  if (pct <= 0.10) return 320
  if (pct <= 0.20) return 200
  if (pct <= 0.30) return 100
  return 30
}

export function calcTimeBonus(secondsRemaining: number, totalSeconds = 120): number {
  return Math.round(Math.max(0, secondsRemaining / totalSeconds) * 300)
}

// Helper: convert score level to game name + display level
export function levelToGame(level: number): { game: string; displayLevel: number } {
  if (level >= 21) return { game: 'Rugalmasság', displayLevel: level - 20 }
  if (level >= 13) return { game: 'Fogyasztáselmélet', displayLevel: level - 12 }
  if (level >= 9)  return { game: 'Költségek', displayLevel: level - 8 }
  if (level >= 5)  return { game: 'Kereslet-kínálat', displayLevel: level - 4 }
  return { game: 'Monopólium', displayLevel: level }
}

export interface GlobalLeaderboardRow {
  user_email: string
  total: number
  gamesPlayed: number
}

// Összesített toplista: minden játékos legjobb eredményének összege, játékonként/szintenként
export async function fetchGlobalLeaderboard(): Promise<GlobalLeaderboardRow[]> {
  const { data } = await supabase
    .from('game_scores')
    .select('user_email, level, score')
    .order('score', { ascending: false })
    .limit(5000)

  if (!data) return []

  // Per user, per level: best score only
  const userLevelBest = new Map<string, Map<number, number>>()
  for (const row of (data as { user_email: string; level: number; score: number }[])) {
    if (!userLevelBest.has(row.user_email)) userLevelBest.set(row.user_email, new Map())
    const levels = userLevelBest.get(row.user_email)!
    if (!levels.has(row.level) || row.score > levels.get(row.level)!) {
      levels.set(row.level, row.score)
    }
  }

  return Array.from(userLevelBest.entries())
    .map(([user_email, levels]) => ({
      user_email,
      total: Array.from(levels.values()).reduce((s, v) => s + v, 0),
      gamesPlayed: levels.size,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
}

