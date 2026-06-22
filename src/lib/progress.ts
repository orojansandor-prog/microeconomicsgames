import { supabase } from './supabase'

export interface ProgressRecord {
  game_slug: string
  level_id: number
  completed: boolean
  best_price?: number
  best_profit?: number
  attempts: number
  completed_at?: string
}

export async function saveProgress(
  gameSlug: string,
  levelId: number,
  data: { completed?: boolean; bestPrice?: number; bestProfit?: number }
) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('user_progress').upsert({
    user_id: user.id,
    game_slug: gameSlug,
    level_id: levelId,
    completed: data.completed ?? false,
    best_price: data.bestPrice,
    best_profit: data.bestProfit,
    completed_at: data.completed ? new Date().toISOString() : undefined,
    attempts: 1,
  }, {
    onConflict: 'user_id,game_slug,level_id',
    ignoreDuplicates: false,
  })
}

export async function loadProgress(gameSlug: string): Promise<ProgressRecord[]> {
  const { data } = await supabase
    .from('user_progress')
    .select('*')
    .eq('game_slug', gameSlug)
  return data || []
}
