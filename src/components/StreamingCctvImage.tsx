import { useEffect, useState } from 'react'
import type { HTMLAttributeReferrerPolicy, MouseEvent as ReactMouseEvent } from 'react'

const FALLBACK_URL = 'https://tw.live/assets/maintenance.jpg'
const ERROR_BACKOFF_MS = 3000
// 連續失敗超過此次數才切到 maintenance 圖；單次抖動不會觸發。
const MAX_CONSECUTIVE_ERRORS = 3

type Props = {
  src: string
  alt: string
  className?: string
  title?: string
  intervalMs?: number
  paused?: boolean
  onClick?: (e: ReactMouseEvent<HTMLImageElement>) => void
  referrerPolicy?: HTMLAttributeReferrerPolicy
}

// 用快照輪詢 + 雙緩衝模擬即時影像：
// 1. 每 intervalMs 在背景以 new Image() 預載下一張快照
// 2. 預載完成才把可見 <img src> 換掉，避免閃爍
// 3. 連續失敗達門檻後 fallback 到 maintenance 圖
// 4. paused = true 時暫停輪詢，可見畫面保留最後一張
export function StreamingCctvImage({
  src,
  alt,
  className,
  title,
  intervalMs = 1000,
  paused = false,
  onClick,
  referrerPolicy,
}: Props) {
  const [displayedSrc, setDisplayedSrc] = useState<string>(() => `${src}?t=${Date.now()}`)
  const [showFallback, setShowFallback] = useState(false)

  // src 變更（切換到別的路口）時重置可見畫面與 fallback 狀態
  useEffect(() => {
    setShowFallback(false)
    setDisplayedSrc(`${src}?t=${Date.now()}`)
  }, [src])

  useEffect(() => {
    if (paused) return

    let cancelled = false
    let timer: number | null = null
    let consecutiveErrors = 0
    let pendingImg: HTMLImageElement | null = null

    const scheduleNext = (delay: number) => {
      if (cancelled) return
      timer = window.setTimeout(tick, delay)
    }

    const tick = () => {
      if (cancelled) return
      const url = `${src}?t=${Date.now()}`
      const img = new Image()
      pendingImg = img
      if (referrerPolicy) img.referrerPolicy = referrerPolicy
      img.onload = () => {
        if (cancelled) return
        consecutiveErrors = 0
        setShowFallback(false)
        setDisplayedSrc(url)
        scheduleNext(intervalMs)
      }
      img.onerror = () => {
        if (cancelled) return
        consecutiveErrors++
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          setShowFallback(true)
        }
        scheduleNext(ERROR_BACKOFF_MS)
      }
      img.src = url
    }

    // 第一次也照 intervalMs 排程；初始可見的那張已在 displayedSrc 載入中
    scheduleNext(intervalMs)

    return () => {
      cancelled = true
      if (timer !== null) clearTimeout(timer)
      if (pendingImg) {
        pendingImg.onload = null
        pendingImg.onerror = null
        // 中斷尚未完成的請求
        pendingImg.src = ''
      }
    }
  }, [src, intervalMs, paused, referrerPolicy])

  return (
    <img
      src={showFallback ? FALLBACK_URL : displayedSrc}
      alt={alt}
      className={className}
      title={title}
      onClick={onClick}
      referrerPolicy={referrerPolicy}
    />
  )
}
