import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import { getGame } from '../lib/games-registry'
import Navbar from '../components/Navbar'

export default function SupplyDemandPage() {
  const { t } = useI18n()
  const game = getGame('supply-demand')!

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link to="/dashboard" className="hover:text-indigo-600">{t('Játékok', 'Games')}</Link>
          <span>›</span>
          <span className="text-slate-700 font-medium">{t(game.titleHu, game.titleEn)}</span>
        </div>
        <div className="text-5xl mb-3">{game.icon}</div>
        <h1 className="text-3xl font-extrabold text-slate-900">{t(game.titleHu, game.titleEn)}</h1>
        <p className="text-slate-500 mt-2 mb-2 text-base">{t(game.descHu, game.descEn)}</p>
        <p className="text-slate-400 text-sm mb-10 italic">
          {t('Alapszintű mikroökonómia — az egyensúlytól a beavatkozásokig', 'Introductory microeconomics — from equilibrium to interventions')}
        </p>

        <div className="flex flex-col gap-3">
          {game.levels.map((level, i) => (
            <Link key={level.id} to={`/games/supply-demand/level/${level.id}`}
              className="group flex items-center gap-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md p-5 transition-all">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${i === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                {level.id}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900">{t(level.titleHu, level.titleEn)}</div>
                <div className="text-sm text-slate-500 mt-0.5">{t(level.descHu, level.descEn)}</div>
              </div>
              <span className="text-slate-300 group-hover:text-indigo-400 text-lg transition-colors">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
