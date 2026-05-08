import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { translate } from './translations'
import type { Lang } from './translations'
import { LanguageContext } from './languageContext'
import type { LanguageContextValue } from './languageContext'

const STORAGE_KEY = 'traffic-ai.lang'

function readInitialLang(): Lang {
  if (typeof window === 'undefined') return 'zh'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'zh' || stored === 'en' || stored === 'es419') {
    return stored
  }
  return 'zh'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang)

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang =
      lang === 'zh' ? 'zh-Hant' : lang === 'en' ? 'en' : 'es-419'
  }, [lang])

  const setLang = useCallback((next: Lang) => setLangState(next), [])

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      t: (text: string) => translate(text, lang),
    }),
    [lang, setLang],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
