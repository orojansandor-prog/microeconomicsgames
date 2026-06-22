/**
 * NotationBox — Jelölések magyarázata
 * Minden szinten megmutatja az adott szintben használt rövidítéseket.
 * "Más tankönyvben" megjegyzéssel, mert a jelölések változnak.
 */

interface Notation {
  symbol: string          // pl. "PED"
  full: string            // pl. "Kereslet árrugalmassága"
  formula?: string        // pl. "ΔQd% / ΔP%"
  altSymbols?: string     // pl. "Ed, εd, η"
  note?: string           // rövid kiegészítés
}

interface Props {
  notations: Notation[]
  title?: string
}

export default function NotationBox({ notations, title }: Props) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">📐</span>
        <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
          {title ?? 'Jelölések magyarázata'}
        </span>
        <span className="text-xs text-slate-400 italic ml-1">— más tankönyvben eltérhet</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {notations.map(n => (
          <div key={n.symbol} className="flex items-start gap-2 bg-white rounded-xl border border-slate-100 px-3 py-2">
            <code className="text-sm font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 whitespace-nowrap flex-shrink-0 mt-0.5">
              {n.symbol}
            </code>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-800 leading-tight">{n.full}</div>
              {n.formula && (
                <div className="text-xs text-indigo-600 font-mono mt-0.5">{n.formula}</div>
              )}
              {n.altSymbols && (
                <div className="text-xs text-slate-400 mt-0.5">
                  Más tankönyvben: <span className="font-mono text-slate-500">{n.altSymbols}</span>
                </div>
              )}
              {n.note && (
                <div className="text-xs text-slate-500 mt-0.5 italic">{n.note}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
