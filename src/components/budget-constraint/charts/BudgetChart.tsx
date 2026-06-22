/**
 * BudgetChart — X-Y tér grafikon
 * Mutatja: budget line(ák), IC görbék, optimum pont, játékos kosár
 * X tengely = X jószág mennyisége, Y tengely = Y jószág mennyisége
 */
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceDot,
  ResponsiveContainer,
  Label,
} from 'recharts'
import { useI18n } from '../../../lib/i18n'
import type { BCParams } from '../../../engine/budget-constraint'
import { icPoints, budgetY, xIntercept, yIntercept } from '../../../engine/budget-constraint'

interface BudgetLineSpec {
  params: BCParams
  color: string
  dash?: string
  name: string
}

interface ICSpec {
  U: number
  color: string
  dash?: string
  name: string
}

interface DotSpec {
  X: number
  Y: number
  color: string
  label: string
  emoji?: string
}

interface Props {
  params: BCParams
  // Budget line-ok
  budgetLines?: BudgetLineSpec[]
  // IC görbék
  curves?: ICSpec[]
  // Pontok (optimum, játékos kosár, stb.)
  dots?: DotSpec[]
  // Jelmagyarázat mutatása
  showLegend?: boolean
  height?: number
}

function buildICData(p: BCParams, U: number): Array<Record<string, number>> {
  const pts = icPoints(p, U, 100)
  return pts.map(pt => ({ X: pt.X, Y: pt.Y }))
}

export default function BudgetChart({
  params,
  budgetLines,
  curves,
  dots = [],
  showLegend = true,
  height = 320,
}: Props) {
  const { t } = useI18n()

  // Alapértelmezett: az átadott params budget line-ja
  const lines: BudgetLineSpec[] = budgetLines ?? [
    { params, color: '#6366f1', name: t('Költségvetési egyenes', 'Budget Line') },
  ]

  // Ha nincs budget line, a params-ból számítjuk az X/Y tartományt
  const xMax = lines.length > 0
    ? Math.max(...lines.map(l => xIntercept(l.params))) * 1.1
    : xIntercept(params) * 1.3
  const yMax = lines.length > 0
    ? Math.max(...lines.map(l => yIntercept(l.params))) * 1.1
    : yIntercept(params) * 1.3

  // Az összes adatpont egy közös X-skálán
  const steps = 100
  const xVals = Array.from({ length: steps + 1 }, (_, i) => parseFloat(((xMax * i) / steps).toFixed(3)))

  // Budget line adatsorok
  const budgetData = lines.map(bl => {
    const xInt = xIntercept(bl.params)
    return xVals.map(X => ({
      X,
      Y: X <= xInt ? parseFloat(budgetY(bl.params, X).toFixed(3)) : null,
    }))
  })

  // IC adatsorok (saját X-pontok, mert hiperbola)
  const icDataSets = (curves ?? []).map(ic => buildICData(params, ic.U))

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart margin={{ top: 15, right: 35, bottom: 35, left: 15 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

          <XAxis
            dataKey="X"
            type="number"
            domain={[0, parseFloat(xMax.toFixed(1))]}
            tickCount={8}
          >
            <Label
              value={`${t('Mennyiség:', 'Quantity:')} ${params.labelX} (egység)`}
              offset={-20}
              position="insideBottom"
              style={{ fontSize: 12, fill: '#94a3b8' }}
            />
          </XAxis>

          <YAxis
            dataKey="Y"
            type="number"
            domain={[0, parseFloat(yMax.toFixed(1))]}
            tickCount={7}
          >
            <Label
              value={`${params.labelY} (egység)`}
              angle={-90}
              position="insideLeft"
              offset={12}
              style={{ fontSize: 12, fill: '#94a3b8' }}
            />
          </YAxis>

          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={((v: any, name: string) => {
              if (v === null || v === undefined) return null
              return [typeof v === 'number' ? v.toFixed(2) : String(v), name]
            }) as any}
            labelFormatter={v => `${params.labelX}: ${Number(v).toFixed(2)}`}
          />

          {showLegend && <Legend verticalAlign="top" wrapperStyle={{ fontSize: 12 }} />}

          {/* Budget line-ok */}
          {lines.map((bl, i) => (
            <Line
              key={`bl-${i}`}
              data={budgetData[i]}
              dataKey="Y"
              stroke={bl.color}
              strokeWidth={2.5}
              strokeDasharray={bl.dash}
              dot={false}
              name={bl.name}
              connectNulls={false}
              isAnimationActive={false}
            />
          ))}

          {/* IC görbék */}
          {(curves ?? []).map((ic, i) => (
            <Line
              key={`ic-${i}`}
              data={icDataSets[i]}
              dataKey="Y"
              stroke={ic.color}
              strokeWidth={2}
              strokeDasharray={ic.dash ?? '5 3'}
              dot={false}
              name={ic.name}
              connectNulls={false}
              isAnimationActive={false}
            />
          ))}

          {/* Pontok */}
          {dots.map((d, i) => (
            <ReferenceDot
              key={`dot-${i}`}
              x={d.X}
              y={d.Y}
              r={6}
              fill={d.color}
              stroke="white"
              strokeWidth={2}
              label={{
                value: d.label,
                position: 'top',
                fontSize: 11,
                fill: d.color,
                fontWeight: 700,
              }}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
