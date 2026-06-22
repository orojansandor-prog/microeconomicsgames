import { useI18n } from '../../lib/i18n'
import { generateTable, solveMonopoly } from '../../engine/monopoly'
import type { MarketParams } from '../../engine/monopoly'

interface Props { params: MarketParams; highlightQ?: number }

export default function RevealTable({ params, highlightQ }: Props) {
  const { t } = useI18n()
  // Az optimum Q* és Q_versenypiaci mindig pontosan szerepeljen a táblában
  const sol = solveMonopoly(params)
  const rows = generateTable(params, 12, [sol.Q_monopoly, sol.Q_competitive])

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {['Q', 'P', 'TR', 'MR', 'MC', t('Profit', 'Profit')].map(h => (
              <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const isHighlight = highlightQ !== undefined && Math.abs(row.Q - highlightQ) < 0.05
            const isMax = row.profit === Math.max(...rows.map(r => r.profit))
            return (
              <tr key={i} className={`border-b border-slate-100 transition-colors ${isHighlight ? 'bg-amber-50' : isMax ? 'bg-green-50' : i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                <td className="px-4 py-2.5 font-mono font-medium text-slate-800">{row.Q}</td>
                <td className="px-4 py-2.5 font-mono text-slate-700">{row.P.toFixed(1)}</td>
                <td className="px-4 py-2.5 font-mono text-slate-700">{row.TR.toFixed(1)}</td>
                <td className={`px-4 py-2.5 font-mono ${row.MR === null ? 'text-slate-300' : row.MR < 0 ? 'text-red-500' : 'text-slate-700'}`}>
                  {row.MR === null ? '—' : row.MR.toFixed(1)}
                </td>
                <td className="px-4 py-2.5 font-mono text-green-600">{row.MC}</td>
                <td className={`px-4 py-2.5 font-mono font-semibold ${row.profit > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {row.profit.toFixed(1)}
                  {isMax && <span className="ml-1 text-xs">✓ max</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
