import { createContext, useContext } from 'react'
import type { Lang } from './translations'

export type LanguageContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (text: string) => string
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
