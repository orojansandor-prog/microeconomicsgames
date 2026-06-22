import { useEffect, useState } from 'react'
import { fetchLeaderboard, type LeaderboardRow, type LeaderboardResult } from '../lib/scores'
import { useI18n } from '../lib/i18n'
import { useAuth } from '../lib/auth'

interface Props {
  level: number
  refreshKey?: number
}

export default function Leaderboard({ level, refreshKey = 0 }: Props) {
  const { t } = useI18n()
  const { session } = useAuth()
  const [result, setResult] = useState<LeaderboardResult>({ top10: [], myEntry: null })
  const [loading, setLoading] = useState(true)

  const myEmail = session?.user?.email

  useEffect(() => {
    setLoading(true)
    fetchLeaderboard(level, myEmail).then(data => { setResult(data); setLoading(false) })
  }, [level, refreshKey, myEmail])

  if (loading) return (
    <div className="text-center py-8 text-slate-400 text-sm">{t('Betöltés…', 'Loading…')}</div>
  )
  if (result.top10.length === 0 && !result.myEntry) return (
    <div className="text-center py-8 text-slate-400 text-sm">{t('Még nincs eredmény ezen a szinten.', 'No scores yet for this level.')}</div>
  )

  function renderRow(row: LeaderboardRow, rank: number, isMe: boolean) {
    return (
      <tr key={rank} className={`border-b border-slate-50 ${isMe ? 'bg-indigo-50' : ''}`}>
        <td className="py-2.5 pr-2">
          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : <span className="text-slate-400">{rank}</span>}
        </td>
        <td className="py-2.5 font-medium text-slate-800 max-w-[120px] truncate">
          {row.user_email.split('@')[0]}
          {isMe && <span className="ml-1 text-xs text-indigo-600 font-bold">(Te)</span>}
        </td>
        <td className="py-2.5 text-right font-black text-slate-900">{row.score}</td>
        <td className="py-2.5 text-right text-slate-500 hidden sm:table-cell">{row.accuracy_points}</td>
        <td className="py-2.5 text-right text-slate-500 hidden sm:table-cell">{row.time_bonus}</td>
        <td className="py-2.5 text-right text-slate-500 hidden sm:table-cell">{row.quiz_points}</td>
      </tr>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-slate-500 border-b border-slate-100">
            <th className="pb-2 text-left w-8">#</th>
            <th className="pb-2 text-left">{t('Játékos', 'Player')}</th>
            <th className="pb-2 text-right">{t('Pont', 'Score')}</th>
            <th className="pb-2 text-right hidden sm:table-cell">{t('Pontosság', 'Accuracy')}</th>
            <th className="pb-2 text-right hidden sm:table-cell">{t('Idő', 'Time')}</th>
            <th className="pb-2 text-right hidden sm:table-cell">{t('Kvíz', 'Quiz')}</th>
          </tr>
        </thead>
        <tbody>
          {result.top10.map((row, i) => renderRow(row, i + 1, row.user_email === myEmail))}
          {result.myEntry && (
            <>
              <tr><td colSpan={6}><div className="border-t-2 border-dashed border-indigo-200 my-1" /></td></tr>
              {renderRow(result.myEntry.row, result.myEntry.rank, true)}
            </>
          )}
        </tbody>
      </table>
    </div>
  )
}
