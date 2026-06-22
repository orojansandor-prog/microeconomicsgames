import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer, Label
} from 'recharts'
import { useI18n } from '../../../lib/i18n'
import { solveEquilibrium } from '../../../engine/supply-demand'

interface Props {
  A: number
  Bd: number
  C: number
  Bs: number
  showEquilibrium?: boolean
  showCS?: boolean
  showPS?: boolean
  showDWL?: boolean
  playerPrice?: number
  playerQty?: number
  priceCeiling?: number
  priceFloor?: number
  taxBuyerPrice?: number
  taxSellerPrice?: number
  shiftedA?: number
  shiftedC?: number
}

export default function SupplyDemandChart({
  A, Bd, C, Bs,
  showEquilibrium = false,
  showCS = false,
  showPS = false,
  showDWL = false,
  playerPrice,
  playerQty,
  priceCeiling,
  priceFloor,
  taxBuyerPrice,
  taxSellerPrice,
  shiftedA,
  shiftedC,
}: Props) {
  const { t } = useI18n()

  const eq = solveEquilibrium({ A, Bd, C, Bs })
  const Qstar = eq.Q
  const Pstar = eq.P

  // Egyensúlyi pont automatikusan látható, ha leleplezési flag aktív
  const shouldShowEq =
    showEquilibrium ||
    showCS ||
    showPS ||
    showDWL ||
    priceCeiling !== undefined ||
    priceFloor !== undefined ||
    taxBuyerPrice !== undefined ||
    taxSellerPrice !== undefined

  const qMax = Qstar * 1.3

  const steps = 60
  const rawQ = Array.from({ length: steps + 1 }, (_, i) => (qMax * i) / steps)

  const extraQ: number[] = [Qstar]
  if (playerQty !== undefined && playerQty > 0 && playerQty < qMax) extraQ.push(playerQty)

  const allQ = [...rawQ, ...extraQ]
    .sort((a, b) => a - b)
    .filter((q, i, arr) => i === 0 || Math.abs(q - arr[i - 1]) > 0.1)

  const data = allQ.map(Q => {
    const pDemand = Math.max(0, A - Bd * Q)
    const pSupply = C + Bs * Q
    const row: Record<string, number> = {
      Q: parseFloat(Q.toFixed(2)),
      demand: parseFloat(pDemand.toFixed(2)),
      supply: parseFloat(pSupply.toFixed(2)),
    }

    if (showCS && Q <= Qstar + 0.05) {
      row.cs_top = parseFloat(pDemand.toFixed(2))
      row.cs_bottom = parseFloat(Pstar.toFixed(2))
    }
    if (showPS && Q <= Qstar + 0.05) {
      row.ps_top = parseFloat(Pstar.toFixed(2))
      row.ps_bottom = parseFloat(pSupply.toFixed(2))
    }
    if (shiftedA !== undefined) {
      row.demand_shifted = parseFloat(Math.max(0, shiftedA - Bd * Q).toFixed(2))
    }
    if (shiftedC !== undefined) {
      row.supply_shifted = parseFloat((shiftedC + Bs * Q).toFixed(2))
    }

    return row
  })

  let dwlData: typeof data = []
  if (showDWL) {
    const Qtraded = playerQty !== undefined ? playerQty : Qstar
    if (Qtraded < Qstar) {
      dwlData = data
        .filter(d => d.Q >= Qtraded - 0.1 && d.Q <= Qstar + 0.1)
        .map(d => ({
          ...d,
          dwl_top: parseFloat(Math.max(0, A - Bd * d.Q).toFixed(2)),
          dwl_bottom: parseFloat((C + Bs * d.Q).toFixed(2)),
        }))
    }
  }

  const yMin = Math.max(0, C - 10)
  const yMax = A + 5

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 10, right: 60, bottom: 30, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="Q" type="number" domain={[0, parseFloat(qMax.toFixed(1))]}>
            <Label
              value={t('Mennyiség (Q)', 'Quantity (Q)')}
              offset={-15}
              position="insideBottom"
              style={{ fontSize: 11, fill: '#94a3b8' }}
            />
          </XAxis>
          <YAxis domain={[yMin, yMax]}>
            <Label
              value={t('Ár (P)', 'Price (P)')}
              angle={-90}
              position="insideLeft"
              offset={10}
              style={{ fontSize: 11, fill: '#94a3b8' }}
            />
          </YAxis>
          <Tooltip
            formatter={(v: unknown) => (typeof v === 'number' ? v.toFixed(1) : String(v))}
            labelFormatter={v => `Q = ${v}`}
          />
          <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />

          {/* CS shaded area — indigo 30% */}
          {showCS && (
            <Area dataKey="cs_top" stroke="none" fill="#6366f1" fillOpacity={0.3} name="CS" legendType="square" />
          )}
          {showCS && (
            <Area dataKey="cs_bottom" stroke="none" fill="#ffffff" fillOpacity={1} legendType="none" />
          )}

          {/* PS shaded area — emerald 30% */}
          {showPS && (
            <Area dataKey="ps_top" stroke="none" fill="#10b981" fillOpacity={0.3} name="PS" legendType="square" />
          )}
          {showPS && (
            <Area dataKey="ps_bottom" stroke="none" fill="#ffffff" fillOpacity={1} legendType="none" />
          )}

          {/* DWL — yellow */}
          {showDWL && dwlData.length > 0 && (
            <Area data={dwlData} dataKey="dwl_top" stroke="none" fill="#fef08a" fillOpacity={0.75} name="DWL" legendType="square" />
          )}

          {/* Shifted curves — dashed */}
          {shiftedA !== undefined && (
            <Line dataKey="demand_shifted" stroke="#818cf8" strokeWidth={2} dot={false}
              strokeDasharray="6 3" name={t('Kereslet (új)', 'Demand (new)')} />
          )}
          {shiftedC !== undefined && (
            <Line dataKey="supply_shifted" stroke="#34d399" strokeWidth={2} dot={false}
              strokeDasharray="6 3" name={t('Kínálat (új)', 'Supply (new)')} />
          )}

          {/* Main curves */}
          <Line dataKey="demand" stroke="#6366f1" strokeWidth={2.5} dot={false}
            name={t('Kereslet (D)', 'Demand (D)')} />
          <Line dataKey="supply" stroke="#10b981" strokeWidth={2.5} dot={false}
            name={t('Kínálat (S)', 'Supply (S)')} />

          {/* Equilibrium */}
          {shouldShowEq && (
            <>
              <ReferenceLine x={parseFloat(Qstar.toFixed(1))} stroke="#6366f1" strokeDasharray="4 4"
                label={{ value: `Q*=${Qstar.toFixed(0)}`, position: 'top', fontSize: 12, fill: '#6366f1' }} />
              <ReferenceLine y={parseFloat(Pstar.toFixed(1))} stroke="#6366f1" strokeDasharray="4 4"
                label={{ value: `P*=${Pstar.toFixed(0)}`, position: 'right', fontSize: 12, fill: '#6366f1' }} />
            </>
          )}

          {/* Player guides — amber */}
          {playerPrice !== undefined && (
            <ReferenceLine y={playerPrice} stroke="#f59e0b" strokeWidth={2}
              label={{ value: `${t('Te', 'You')}: P=${playerPrice}`, position: 'right', fontSize: 12, fill: '#f59e0b' }} />
          )}
          {playerQty !== undefined && (
            <ReferenceLine x={playerQty} stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4"
              label={{ value: `Q=${playerQty}`, position: 'top', fontSize: 12, fill: '#f59e0b' }} />
          )}

          {/* Interventions */}
          {priceCeiling !== undefined && (
            <ReferenceLine y={priceCeiling} stroke="#ef4444" strokeWidth={2}
              label={{ value: t('Ársapka', 'Ceiling'), position: 'left', fontSize: 12, fill: '#ef4444' }} />
          )}
          {priceFloor !== undefined && (
            <ReferenceLine y={priceFloor} stroke="#f97316" strokeWidth={2}
              label={{ value: t('Árpadló', 'Floor'), position: 'left', fontSize: 12, fill: '#f97316' }} />
          )}

          {/* Tax lines */}
          {taxBuyerPrice !== undefined && (
            <ReferenceLine y={taxBuyerPrice} stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="5 3"
              label={{ value: `Pb=${taxBuyerPrice}`, position: 'right', fontSize: 12, fill: '#8b5cf6' }} />
          )}
          {taxSellerPrice !== undefined && (
            <ReferenceLine y={taxSellerPrice} stroke="#06b6d4" strokeWidth={1.5} strokeDasharray="5 3"
              label={{ value: `Ps=${taxSellerPrice}`, position: 'right', fontSize: 12, fill: '#06b6d4' }} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
