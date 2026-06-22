import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer, Cell
} from 'recharts'
import { useI18n } from '../../../lib/i18n'
import type { PEDProduct, PESIndustry, YEDProduct } from '../../../engine/elasticity-scenarios'

interface PEDProps {
  type: 'ped'
  products: PEDProduct[]
}

interface PESProps {
  type: 'pes'
  industries: PESIndustry[]
  shortEstimates?: number[]
  longEstimates?: number[]
}

interface XEDProps {
  type: 'xed_shift'
  direction?: 'left' | 'right'
}

interface YEDProps {
  type: 'yed'
  products: YEDProduct[]
}

type Props = PEDProps | PESProps | XEDProps | YEDProps

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPayload = any

export default function ElasticityChart(props: Props) {
  const { t } = useI18n()

  if (props.type === 'ped') {
    const data = props.products.map(p => ({
      name: p.emoji,
      absPED: Math.abs(p.ped),
      elastic: Math.abs(p.ped) >= 1,
      fullName: t(p.huName, p.enName),
    }))

    return (
      <div className="w-full">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 40, bottom: 10, left: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" domain={[0, 3]} tickCount={7} />
            <YAxis type="category" dataKey="name" width={40} tick={{ fontSize: 18 }} />
            <Tooltip
              formatter={(v: AnyPayload) => [Number(v).toFixed(2), '|PED|'] as [string, string]}
              labelFormatter={(_label: AnyPayload, payload: AnyPayload) =>
                (payload?.[0]?.payload?.fullName as string) ?? ''
              }
            />
            <ReferenceLine x={1} stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4"
              label={{ value: t('Rugalmassági határ', 'Elasticity threshold'), position: 'top', fontSize: 12, fill: '#ef4444' }} />
            <Bar dataKey="absPED" name="|PED|" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.elastic ? '#ef4444' : '#22c55e'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 justify-center mt-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" />
            {t('Rugalmatlan (|PED|<1)', 'Inelastic (|PED|<1)')}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />
            {t('Rugalmas (|PED|>1)', 'Elastic (|PED|>1)')}
          </span>
        </div>
      </div>
    )
  }

  if (props.type === 'pes') {
    const data = props.industries.map((ind, i) => ({
      name: ind.emoji,
      fullName: t(ind.huName, ind.enName),
      shortTrue: ind.shortRunPES,
      longTrue: ind.longRunPES,
      shortEst: props.shortEstimates?.[i],
      longEst: props.longEstimates?.[i],
    }))

    return (
      <div className="w-full">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 10, right: 60, bottom: 10, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 18 }} />
            <YAxis domain={[0, 14]} />
            <Tooltip
              formatter={(v: AnyPayload, name: AnyPayload) => [Number(v).toFixed(1), name as string] as [string, string]}
              labelFormatter={(_label: AnyPayload, payload: AnyPayload) =>
                (payload?.[0]?.payload?.fullName as string) ?? ''
              }
            />
            <Legend />
            <Bar dataKey="shortTrue" name={t('Rövid táv (valós)', 'Short run (true)')} fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="longTrue" name={t('Hosszú táv (valós)', 'Long run (true)')} fill="#22c55e" radius={[4, 4, 0, 0]} />
            {props.shortEstimates && (
              <Bar dataKey="shortEst" name={t('Rövid becslés', 'Short est.')} fill="#93c5fd" radius={[4, 4, 0, 0]} />
            )}
            {props.longEstimates && (
              <Bar dataKey="longEst" name={t('Hosszú becslés', 'Long est.')} fill="#86efac" radius={[4, 4, 0, 0]} />
            )}
            <ReferenceLine y={1} stroke="#f97316" strokeWidth={2} strokeDasharray="4 4"
              label={{ value: 'PES = 1', position: 'right', fontSize: 12, fill: '#f97316' }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (props.type === 'xed_shift') {
    const dir = props.direction ?? 'right'
    const isRight = dir === 'right'
    const color = isRight ? '#6366f1' : '#ef4444'
    const shiftX = isRight ? 60 : -60

    return (
      <div className="w-full flex justify-center">
        <svg viewBox="0 0 400 260" className="w-full max-w-md">
          {/* Axes */}
          <line x1="60" y1="220" x2="360" y2="220" stroke="#94a3b8" strokeWidth="2" />
          <line x1="60" y1="20" x2="60" y2="220" stroke="#94a3b8" strokeWidth="2" />
          <text x="370" y="224" fontSize="12" fill="#94a3b8">Q</text>
          <text x="55" y="15" fontSize="12" fill="#94a3b8">P</text>

          {/* Original demand curve D1 */}
          <line x1="100" y1="40" x2="300" y2="200" stroke="#6366f1" strokeWidth="2.5" />
          <text x="300" y="36" fontSize="12" fill="#6366f1" fontWeight="bold">D&#x2081;</text>

          {/* Shifted demand curve D2 */}
          <line x1={100 + shiftX} y1="40" x2={300 + shiftX} y2="200" stroke={color} strokeWidth="2.5" strokeDasharray="6 3" />
          <text x={300 + shiftX} y="36" fontSize="12" fill={color} fontWeight="bold">D&#x2082;</text>

          {/* Arrow */}
          <defs>
            <marker id="arrowhead-ec" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill={color} />
            </marker>
          </defs>
          <line
            x1={isRight ? 210 : 250} y1="120"
            x2={isRight ? 250 : 210} y2="120"
            stroke={color} strokeWidth="2"
            markerEnd="url(#arrowhead-ec)"
          />

          {/* Labels */}
          <text x="200" y="248" fontSize="11" fill="#64748b" textAnchor="middle">
            {isRight
              ? t('Helyettesito: B ara felno => A kereslete felno', 'Substitute: B price rises => A demand rises')
              : t('Komplementer: B ara felno => A kereslete csokkent', 'Complement: B price rises => A demand falls')
            }
          </text>
        </svg>
      </div>
    )
  }

  if (props.type === 'yed') {
    const sorted = [...props.products].sort((a, b) => a.yed - b.yed)
    const data = sorted.map(p => ({
      name: p.emoji,
      fullName: t(p.huName, p.enName),
      yed: p.yed,
      type: p.type,
    }))

    const colorMap: Record<string, string> = {
      inferior: '#ef4444',
      normal: '#3b82f6',
      luxury: '#8b5cf6',
    }

    return (
      <div className="w-full">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 40, bottom: 10, left: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" domain={[-2, 6]} />
            <YAxis type="category" dataKey="name" width={40} tick={{ fontSize: 18 }} />
            <Tooltip
              formatter={(v: AnyPayload) => [Number(v).toFixed(2), 'YED'] as [string, string]}
              labelFormatter={(_label: AnyPayload, payload: AnyPayload) =>
                (payload?.[0]?.payload?.fullName as string) ?? ''
              }
            />
            <ReferenceLine x={0} stroke="#94a3b8" strokeWidth={1} />
            <ReferenceLine x={1} stroke="#f97316" strokeWidth={2} strokeDasharray="4 4"
              label={{ value: 'YED = 1', position: 'top', fontSize: 12, fill: '#f97316' }} />
            <Bar dataKey="yed" name="YED" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={colorMap[entry.type]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 justify-center mt-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />
            {t('Inferior', 'Inferior')}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
            {t('Normal', 'Normal')}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-violet-500 inline-block" />
            {t('Luxus', 'Luxury')}
          </span>
        </div>
      </div>
    )
  }

  return null
}
