import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export type Lang = 'hu' | 'en'

interface I18nContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: (hu: string, en: string) => string
}

const I18nContext = createContext<I18nContextType>({
  lang: 'hu',
  setLang: () => {},
  t: (hu) => hu,
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('hu')
  const t = (hu: string, en: string) => lang === 'hu' ? hu : en
  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)
