import { useEffect, useState } from 'react'

interface Props {
  totalSeconds: number
  onExpire: () => void
  running: boolean
  onTick?: (remaining: number) => void
}

export default function GameTimer({ totalSeconds, onExpire, running, onTick }: Props) {
  const [remaining, setRemaining] = useState(totalSeconds)

  useEffect(() => {
    if (!running) return
    if (remaining <= 0) { onExpire(); return }
    const id = setInterval(() => {
      setRemaining(r => {
        const next = r - 1
        onTick?.(next)
        if (next <= 0) { clearInterval(id); onExpire() }
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running, remaining <= 0])

  const pct = remaining / totalSeconds
  const color = remaining > 60 ? '#22c55e' : remaining > 30 ? '#f59e0b' : '#ef4444'
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  return (
    <div className="flex items-center gap-2">
      <svg width="36" height="36" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3" />
        <circle
          cx="18" cy="18" r="15" fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={`${2 * Math.PI * 15}`}
          strokeDashoffset={`${2 * Math.PI * 15 * (1 - pct)}`}
          strokeLinecap="round"
          transform="rotate(-90 18 18)"
          style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }}
        />
      </svg>
      <span className="text-lg font-black tabular-nums" style={{ color }}>
        {mins}:{secs.toString().padStart(2, '0')}
      </span>
    </div>
  )
}
