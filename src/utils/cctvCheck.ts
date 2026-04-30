/**
 * CCTV 連線檢查工具
 *
 *  1. Worker pool 限制同時 ≤ 5 個 probe（避免瀏覽器 per-host queue timeout
 *     把後到的請求活活餓死）
 *  2. 每個 probe 的 timeout 拉長到 12s
 *  3. 只用 Image() 探測 — 與實際 <img> render 同源、可靠度最高。
 *     不再用 fetch(no-cors) 後備，因為 opaque response 即使 server 回 404
 *     也不會丟 error，會造成 false positive。
 *  4. 結果存進 sessionStorage（TTL 5 分鐘），重新整理同分頁不用重新 probe
 */

// v3: 改用 /snapshot endpoint。部分相機（例如 1c8ebc07 忠一路/孝二路）在裸 URL
// 回傳 multipart MJPEG，<img> 標籤無法渲染導致 probe false negative；/snapshot
// 永遠回單張 JPEG，跨相機行為一致。版號升級以失效舊的誤判 cache。
const CACHE_KEY = 'cctv_check_v3'
const CACHE_TTL_MS = 5 * 60 * 1000
const PROBE_TIMEOUT_MS = 12_000

const cctvUrl = (hexId: string) => `https://cctv.klcg.gov.tw/${hexId}/snapshot`

type CacheEntry = { ok: boolean; t: number }
type CacheStore = Record<string, CacheEntry>

function readCache(): CacheStore {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return {}
    const obj = JSON.parse(raw) as CacheStore
    return obj && typeof obj === 'object' ? obj : {}
  } catch {
    return {}
  }
}

function writeCache(cache: CacheStore): void {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // 忽略 quota / disabled storage 錯誤
  }
}

function getCached(hexId: string): boolean | null {
  const cache = readCache()
  const entry = cache[hexId]
  if (!entry) return null
  if (Date.now() - entry.t > CACHE_TTL_MS) return null
  return entry.ok
}

function setCached(hexId: string, ok: boolean): void {
  const cache = readCache()
  cache[hexId] = { ok, t: Date.now() }
  writeCache(cache)
}

export function clearCctvCacheFor(hexIds: string[]): void {
  const cache = readCache()
  for (const id of hexIds) delete cache[id]
  writeCache(cache)
}

/** 主檢測：用 Image() 試載入，可靠性最高（與實際 <img> render 行為一致） */
function probeImage(hexId: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.referrerPolicy = 'no-referrer'
    let settled = false

    const finish = (ok: boolean) => {
      if (settled) return
      settled = true
      img.onload = null
      img.onerror = null
      clearTimeout(timer)
      // 中斷可能尚未完成的請求
      img.src = ''
      resolve(ok)
    }

    const timer = setTimeout(() => finish(false), PROBE_TIMEOUT_MS)
    img.onload = () => finish(true)
    img.onerror = () => finish(false)
    img.src = cctvUrl(hexId)
  })
}

async function probeOne(hexId: string): Promise<boolean> {
  const cached = getCached(hexId)
  if (cached !== null) return cached

  const ok = await probeImage(hexId)
  setCached(hexId, ok)
  return ok
}

export type CancelToken = { cancelled: boolean }
export type CheckProgress = { done: number; total: number }

/**
 * 用 worker pool 限制並發數量，避免瀏覽器 per-host queue 把後到的請求 timeout
 * 拖死。
 */
export async function checkCctvBatch<T extends { cctvHexId: string }>(
  items: T[],
  options: {
    concurrency?: number
    onProgress?: (p: CheckProgress) => void
    cancel?: CancelToken
  } = {},
): Promise<boolean[]> {
  const { concurrency = 5, onProgress, cancel } = options
  const total = items.length
  const results: boolean[] = new Array(total).fill(false)
  if (total === 0) return results

  onProgress?.({ done: 0, total })

  let nextIdx = 0
  let done = 0

  async function worker(): Promise<void> {
    while (nextIdx < total) {
      if (cancel?.cancelled) return
      const i = nextIdx++
      results[i] = await probeOne(items[i].cctvHexId)
      done++
      if (!cancel?.cancelled) onProgress?.({ done, total })
    }
  }

  const workerCount = Math.min(concurrency, total)
  await Promise.all(Array.from({ length: workerCount }, () => worker()))
  return results
}
