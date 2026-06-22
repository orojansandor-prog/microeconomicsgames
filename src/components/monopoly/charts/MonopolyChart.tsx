import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer, Label
} from 'recharts'
import { useI18n } from '../../../lib/i18n'

interface Props {
  A: number
  B: number
  MC: number
  showMonopoly?: boolean
  showCompetitive?: boolean
  showDWL?: boolean
  playerPrice?: number
}

export default function MonopolyChart({
  A, B, MC,
  showMonopoly = true,
  showCompetitive = false,
  showDWL = false,
  playerPrice,
}: Props) {
  const { t } = useI18n()

  const Q_c = (A - MC) / B
  const Q_m = (A - MC) / (2 * B)
  const P_m = A - B * Q_m
  const qMax = Q_c * 1.1

  // Garantáljuk, hogy a kulcsos Q értékek pontosan szerepelnek az adatpontok közt
  const steps = 100
  const rawQ = Array.from({ length: steps + 1 }, (_, i) => (qMax * i) / steps)

  const keyQ: number[] = [Q_m, Q_c]
  if (playerPrice !== undefined) {
    const qP = (A - playerPrice) / B
    if (qP > 0 && qP < qMax) keyQ.push(qP)
  }

  const allQ = [...rawQ, ...keyQ]
    .sort((a, b) => a - b)
    .filter((q, i, arr) => i === 0 || Math.abs(q - arr[i - 1]) > 0.15)

  // ── Adatpontok ──────────────────────────────────────────────────────────
  // dwlBase + dwlFill: stacked Area a helyes DWL-háromszög rajzolásához.
  //   - dwlBase (transparent): 0 → MC alap, hogy a sárga fill MC-től induljon
  //   - dwlFill (sárga):       MC → demand (= demand − MC magasság)
  // undefined értékek a DWL-zónán kívül: Recharts "törést" kezel, nem rajzol.
  // FONTOS: egy tömbben vannak a fő data-val → a tooltip végig működik!
  const data = allQ.map(Q => {
    const demand = parseFloat(Math.max(0, A - B * Q).toFixed(2))
    const MR     = parseFloat(Math.max(-MC, A - 2 * B * Q).toFixed(2))
    const inDWL  = showDWL && Q >= Q_m - 0.01 && Q <= Q_c + 0.01
    return {
      Q:        parseFloat(Q.toFixed(2)),
      demand,
      MR,
      MC,
      // stacked DWL layer — undefined kívül, szám belül
      dwlBase: inDWL ? MC                              : undefined,
      dwlFill: inDWL ? parseFloat((demand - MC).toFixed(2)) : undefined,
    }
  })

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

          <XAxis dataKey="Q" type="number" domain={[0, 'dataMax']}>
            <Label
              value={t('Mennyiség (Q)', 'Quantity (Q)')}
              offset={-15} position="insideBottom"
              style={{ fontSize: 11, fill: '#94a3b8' }}
            />
          </XAxis>

          <YAxis domain={[-MC, A]}>
            <Label
              value={t('Ár (P)', 'Price (P)')}
              angle={-90} position="insideLeft" offset={10}
              style={{ fontSize: 11, fill: '#94a3b8' }}
            />
          </YAxis>

          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={((v: any, name: string) => {
              if (name === '__dwlBase' || name === '__dwlFill') return null
              return typeof v === 'number' ? [v.toFixed(1), name] : [String(v), name]
            }) as any}
            labelFormatter={v => `Q = ${Number(v).toFixed(1)}`}
          />
          <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />

          {/* ── DWL terület — stacked: 0→MC láthatatlan + MC→demand sárga ── */}
          {showDWL && (
            <>
              {/* Láthatatlan alap MC-szintig */}
              <Area
                dataKey="dwlBase"
                stackId="dwl"
                stroke="none"
                fill="transparent"
                legendType="none"
                name="__dwlBase"
                connectNulls={false}
                isAnimationActive={false}
              />
              {/* Sárga fill MC-től a keresleti görbéig */}
              <Area
                dataKey="dwlFill"
                stackId="dwl"
                stroke="none"
                fill="#fef08a"
                fillOpacity={0.85}
                name="DWL"
                legendType="square"
                connectNulls={false}
                isAnimationActive={false}
              />
            </>
          )}

          {/* Görbék — a fill után jönnek, hogy felettük legyenek */}
          <Line dataKey="demand" stroke="#6366f1" strokeWidth={2.5} dot={false} name={t('Kereslet (D)', 'Demand (D)')} isAnimationActive={false} />
          <Line dataKey="MR"     stroke="#f97316" strokeWidth={2}   dot={false} strokeDasharray="5 3" name="MR" isAnimationActive={false} />
          <Line dataKey="MC"     stroke="#22c55e" strokeWidth={2}   dot={false} name="MC" isAnimationActive={false} />

          {showMonopoly && (
            <>
              <ReferenceLine x={Q_m} stroke="#6366f1" strokeDasharray="4 4"
                label={{ value: `Q*=${Q_m.toFixed(0)}`, position: 'top', fontSize: 10, fill: '#6366f1' }} />
              <ReferenceLine y={P_m} stroke="#6366f1" strokeDasharray="4 4"
                label={{ value: `P*=${P_m.toFixed(0)}`, position: 'right', fontSize: 10, fill: '#6366f1' }} />
            </>
          )}

          {showCompetitive && (
            <ReferenceLine x={Q_c} stroke="#22c55e" strokeDasharray="4 4"
              label={{ value: `Qc=${Q_c.toFixed(0)}`, position: 'top', fontSize: 10, fill: '#22c55e' }} />
          )}

          {playerPrice !== undefined && (
            <ReferenceLine y={playerPrice} stroke="#f59e0b" strokeWidth={2}
              label={{ value: `${t('Te', 'You')}: ${playerPrice}`, position: 'right', fontSize: 10, fill: '#f59e0b' }} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
