import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ResponsiveContainer
} from 'recharts'
import { COST_SCHEDULE } from '../../../engine/costs'
import type { CostRow } from '../../../engine/costs-scenarios'

interface Props {
  mode: 'tc' | 'mc' | 'averages' | 'profit'
  highlightQ?: number
  marketPrice?: number
  showReveal?: boolean
  schedule?: CostRow[]
  // for dynamic reference lines in reveal
  qMinMC?: number
  qMinAVC?: number
  qMinATC?: number
}

export default function CostsChart({
  mode, highlightQ, marketPrice = 60, showReveal,
  schedule: scheduleProp, qMinMC, qMinAVC, qMinATC,
}: Props) {
  const schedule = scheduleProp ?? COST_SCHEDULE
  const data = schedule.map(row => ({
    Q: row.Q,
    TC: row.TC,
    FC: row.FC,
    VC: row.VC,
    MC: row.MC,
    ATC: row.ATC,
    AVC: row.AVC,
    AFC: row.AFC,
  }))

  const resolvedQMinMC = qMinMC ?? 5
  const resolvedQMinAVC = qMinAVC ?? 6
  const resolvedQMinATC = qMinATC ?? 7
  const minMCVal = schedule[resolvedQMinMC]?.MC ?? 21
  const minAVCVal = schedule[resolvedQMinAVC]?.AVC ?? 32
  const minATCVal = schedule[resolvedQMinATC]?.ATC ?? 47.3

  const tickStyle = { fontSize: 11, fill: '#94a3b8' }

  if (mode === 'tc') {
    const maxTC = Math.max(...schedule.map(r => r.TC))
    return (
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="Q" label={{ value: 'Q', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#94a3b8' }} tick={tickStyle} />
          <YAxis domain={[0, Math.ceil(maxTC / 100) * 100 + 50]} tick={tickStyle} />
          <Tooltip formatter={(v: unknown) => [`${v} Ft`, '']} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line dataKey="TC" name="TC" stroke="#334155" strokeWidth={2.5} dot={false} />
          <Line dataKey="VC" name="VC" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="5 3" />
          <Line dataKey="FC" name="FC" stroke="#f97316" strokeWidth={2} dot={false} strokeDasharray="8 4" />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  if (mode === 'mc') {
    return (
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data.slice(1)} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="Q" label={{ value: 'Q', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#94a3b8' }} tick={tickStyle} />
          <YAxis domain={[0, 160]} tick={tickStyle} />
          <Tooltip formatter={(v: unknown) => [`${v} Ft`, '']} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line dataKey="MC" name="MC (határköltség)" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3, fill: '#ef4444' }} />
          <ReferenceLine x={resolvedQMinMC} stroke="#ef4444" strokeDasharray="4 2"
            label={{ value: `min MC=${minMCVal}`, fill: '#ef4444', fontSize: 10, position: 'top' }} />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  if (mode === 'averages') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data.slice(1)} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="Q" label={{ value: 'Q', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#94a3b8' }} tick={tickStyle} />
          <YAxis domain={[0, 220]} tick={tickStyle} />
          <Tooltip formatter={(v: unknown) => [`${v} Ft`, '']} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line dataKey="ATC" name="ATC" stroke="#4f46e5" strokeWidth={2.5} dot={false} />
          <Line dataKey="AVC" name="AVC" stroke="#10b981" strokeWidth={2} dot={false} />
          <Line dataKey="AFC" name="AFC" stroke="#94a3b8" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
          <Line dataKey="MC" name="MC" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="3 2" />
          {showReveal && (
            <>
              <ReferenceLine x={resolvedQMinAVC} stroke="#10b981" strokeDasharray="3 2"
                label={{ value: `min AVC=${minAVCVal}`, fill: '#10b981', fontSize: 10, position: 'insideTopRight' }} />
              <ReferenceLine x={resolvedQMinATC} stroke="#4f46e5" strokeDasharray="3 2"
                label={{ value: `min ATC=${minATCVal}`, fill: '#4f46e5', fontSize: 10, position: 'insideTopLeft' }} />
            </>
          )}
          {!showReveal && (
            <>
              <ReferenceLine x={resolvedQMinAVC} stroke="#10b981" strokeDasharray="3 2"
                label={{ value: 'min AVC', fill: '#10b981', fontSize: 10, position: 'insideTopRight' }} />
              <ReferenceLine x={resolvedQMinATC} stroke="#4f46e5" strokeDasharray="3 2"
                label={{ value: 'min ATC', fill: '#4f46e5', fontSize: 10, position: 'insideTopLeft' }} />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    )
  }

  // profit mode
  const profitData = data.slice(1).map(row => ({
    ...row,
    P: marketPrice,
  }))
  const optQ = highlightQ ?? 8

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={profitData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="Q" label={{ value: 'Q', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#94a3b8' }} tick={tickStyle} />
        <YAxis domain={[0, 160]} tick={tickStyle} />
        <Tooltip formatter={(v: unknown) => [`${v} Ft`, '']} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line dataKey="MC" name="MC" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3, fill: '#ef4444' }} />
        <Line dataKey="P" name={`P = ${marketPrice} Ft`} stroke="#7c3aed" strokeWidth={2} strokeDasharray="6 3" dot={false} />
        {showReveal && (
          <ReferenceLine x={optQ} stroke="#7c3aed" strokeDasharray="4 2"
            label={{ value: `Q*=${optQ}`, fill: '#7c3aed', fontSize: 11, position: 'top' }} />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
