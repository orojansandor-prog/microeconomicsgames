import { useState } from 'react'
import type { QuizQuestion } from '../engine/quiz'
import { useI18n } from '../lib/i18n'

interface Props {
  questions: QuizQuestion[]
  onComplete: (correctCount: number) => void
}

export default function QuizPanel({ questions, onComplete }: Props) {
  const { t } = useI18n()
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [confirmed, setConfirmed] = useState(false)

  const q = questions[idx]
  const isLast = idx === questions.length - 1

  const handleConfirm = () => {
    if (selected === null) return
    const correct = selected === q.correctIndex
    setConfirmed(true)
    const newAnswers = [...answers, correct]
    if (isLast) {
      setTimeout(() => onComplete(newAnswers.filter(Boolean).length), 800)
    } else {
      setTimeout(() => {
        setAnswers(newAnswers)
        setIdx(i => i + 1)
        setSelected(null)
        setConfirmed(false)
      }, 800)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">
          {t('Kérdés', 'Question')} {idx + 1} / {questions.length}
        </span>
        <span className="text-xs text-slate-400">+100 {t('pont helyes válaszonként', 'pts per correct answer')}</span>
      </div>

      <h3 className="text-base font-bold text-slate-900 leading-snug">
        {t(q.hu, q.en)}
      </h3>

      <div className="space-y-2">
        {q.options.map((opt, i) => {
          let cls = 'w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all '
          if (!confirmed) {
            cls += selected === i
              ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
              : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700'
          } else {
            if (i === q.correctIndex) cls += 'border-emerald-500 bg-emerald-50 text-emerald-900'
            else if (i === selected) cls += 'border-red-400 bg-red-50 text-red-800'
            else cls += 'border-slate-200 text-slate-400'
          }
          return (
            <button key={i} className={cls} disabled={confirmed}
              onClick={() => setSelected(i)}>
              <span className="mr-2 text-xs font-bold">{['A', 'B', 'C', 'D'][i]}.</span>
              {t(opt.hu, opt.en)}
            </button>
          )
        })}
      </div>

      {!confirmed && (
        <button
          onClick={handleConfirm}
          disabled={selected === null}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition-colors"
        >
          {t('Megerősítem', 'Confirm')}
        </button>
      )}
    </div>
  )
}
