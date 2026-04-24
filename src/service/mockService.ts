// 從 mockData.json 讀取的類型定義
export type MainPage = 'dashboard' | 'devices' | 'incidentResponse' | 'cms' | 'dataMonitor'
export type DashboardTab = 'dynamicSignal' | 'priorityPass' | 'dangerIntersection' | 'unsignalizedIntersection'

export type IncidentItem = {
  id: string
  time: string
  type: string
  status: '已解除' | '處理中' | '新事件'
  location: string
  severity: '低' | '中' | '高'
  cctvHexId: string
  lat: number
  lng: number
}

export type SidebarItem = { key: MainPage; label: string }
export type TabItem = { key: DashboardTab; label: string }
export type DeviceRate = { name: string; rate: number; color: string }
export type RouteKpi = { label: string; value: string; sub: string }
export type DeviceRow = { id: string; name: string; location: string; status: string; heartbeat: string }
export type TimelineItem = { step: string; owner: string; time: string; state: string }
export type CmsTemplate = { id: string; title: string; channel: string; lastUsed: string }
export type DataSource = { source: string; update: string; lag: string; status: string }

export type DangerIntersection = {
  id: string
  name: string
  lat: number
  lng: number
  cctvHexId: string
  rank: number
}

export type ChartRange = '12h' | '24h' | '7d'

export type RightTurnCountPoint = { label: string; value: number; highlight: boolean }
export type RightTurnSpeedPoint = { label: string; speed: number; ratio: number; highlight: boolean }
export type PedestrianViolationPoint = { label: string; value: number; highlight: boolean }

export type IntersectionChartData = {
  rightTurnCount: RightTurnCountPoint[]
  rightTurnSpeed: RightTurnSpeedPoint[]
  pedestrianViolation: PedestrianViolationPoint[]
}

// 狀態分組排序順序
const STATUS_ORDER: IncidentItem['status'][] = ['處理中', '已解除', '新事件']

// Mock data
const mockData = {
  sidebarItems: [
    { key: 'dashboard', label: '交通監控儀表板' },
    { key: 'devices', label: '設備管理' },
    { key: 'incidentResponse', label: '事件反應管理' },
    { key: 'cms', label: '資訊發布管理' },
    { key: 'dataMonitor', label: '資料監控' },
  ] as SidebarItem[],

  dashboardTabs: [
    { key: 'dynamicSignal', label: '動態號控' },
    { key: 'priorityPass', label: '優先通行' },
    { key: 'dangerIntersection', label: '危險路口' },
    { key: 'unsignalizedIntersection', label: '無號誌路口' },
  ] as TabItem[],

  incidents: [
    // 處理中 (3)
    { id: 'E-20260309-001', time: '2026-03-09 09:11', type: '人車事故', status: '處理中', location: '忠一路 / 孝二路', severity: '高', cctvHexId: '1c8ebc07', lat: 25.12880, lng: 121.74130 },
    { id: 'E-20260309-002', time: '2026-03-09 09:25', type: '緊急車輛通行', status: '處理中', location: '愛三路 / 仁五路', severity: '中', cctvHexId: '24b2e625', lat: 25.12750, lng: 121.74350 },
    { id: 'E-20260309-003', time: '2026-03-09 09:33', type: '號誌異常', status: '處理中', location: '正信路 / 信一路', severity: '高', cctvHexId: '6972615b', lat: 25.13000, lng: 121.74500 },
    // 已解除 (7)
    { id: 'E-20260309-004', time: '2026-03-09 09:40', type: '人車事故', status: '已解除', location: '孝二路 / 忠四路', severity: '高', cctvHexId: '70cf7bac', lat: 25.12580, lng: 121.74180 },
    { id: 'E-20260309-005', time: '2026-03-09 09:55', type: '緊急車輛通行', status: '已解除', location: '信二路 / 義四路', severity: '中', cctvHexId: '5dc09fe8', lat: 25.12680, lng: 121.74520 },
    { id: 'E-20260309-006', time: '2026-03-09 10:02', type: '人車事故', status: '已解除', location: '仁二路 / 愛六路', severity: '低', cctvHexId: '05c7e2d9', lat: 25.12820, lng: 121.74250 },
    { id: 'E-20260309-007', time: '2026-03-09 10:15', type: '未依規定讓車', status: '已解除', location: '安一路 / 西定路', severity: '低', cctvHexId: '108ffee4', lat: 25.12780, lng: 121.73750 },
    { id: 'E-20260309-008', time: '2026-03-09 10:28', type: '違反號誌/標誌管制', status: '已解除', location: '忠一路 / 孝四路', severity: '中', cctvHexId: '10afbef6', lat: 25.12700, lng: 121.73950 },
    { id: 'E-20260309-009', time: '2026-03-09 10:35', type: '人車事故', status: '已解除', location: '中正路/正濱路', severity: '中', cctvHexId: '8edd00b1', lat: 25.13350, lng: 121.75300 },
    { id: 'E-20260309-010', time: '2026-03-09 10:42', type: '施工影響', status: '已解除', location: '中山二路36巷', severity: '低', cctvHexId: 'a22c3d9d', lat: 25.13200, lng: 121.74000 },
    // 新事件 (5)
    { id: 'E-20260309-011', time: '2026-03-09 10:50', type: '號誌異常', status: '新事件', location: '中山一路 / 忠一路', severity: '高', cctvHexId: '4e6b2984', lat: 25.12980, lng: 121.74050 },
    { id: 'E-20260309-012', time: '2026-03-09 10:58', type: '施工影響', status: '新事件', location: '中山一路 / 成功二路', severity: '中', cctvHexId: 'bf0ed2e8', lat: 25.13080, lng: 121.73950 },
    { id: 'E-20260309-013', time: '2026-03-09 11:05', type: '人車事故', status: '新事件', location: '仁一路 / 愛三路', severity: '高', cctvHexId: 'ae1a88db', lat: 25.12820, lng: 121.74300 },
    { id: 'E-20260309-014', time: '2026-03-09 11:12', type: '緊急車輛通行', status: '新事件', location: '中正路 / 信一路', severity: '中', cctvHexId: '65d97b22', lat: 25.13150, lng: 121.74580 },
    { id: 'E-20260309-015', time: '2026-03-09 11:20', type: '未依規定讓車', status: '新事件', location: '北寧路 / 祥豐路', severity: '低', cctvHexId: '582d9c95', lat: 25.13500, lng: 121.76200 },
  ] as IncidentItem[],

  // 座標經 OpenStreetMap Overpass API 驗證，為實際兩條路的交叉節點。
  dangerIntersections: [
    { id: 'DI-01', name: '忠一路 / 孝二路',   lat: 25.1309619, lng: 121.7409682, cctvHexId: '1c8ebc07', rank: 1 },
    { id: 'DI-02', name: '愛三路 / 仁五路',   lat: 25.1269448, lng: 121.7417032, cctvHexId: '24b2e625', rank: 2 },
    { id: 'DI-03', name: '仁二路 / 愛三路',   lat: 25.1295154, lng: 121.7434003, cctvHexId: '6972615b', rank: 3 },
    { id: 'DI-04', name: '孝二路 / 忠四路',   lat: 25.1283421, lng: 121.7392339, cctvHexId: '70cf7bac', rank: 4 },
    { id: 'DI-05', name: '信二路 / 義四路',   lat: 25.1300303, lng: 121.7483585, cctvHexId: '5dc09fe8', rank: 5 },
    { id: 'DI-06', name: '安一路 / 西定路',   lat: 25.1316335, lng: 121.7354372, cctvHexId: '108ffee4', rank: 6 },
    { id: 'DI-07', name: '忠一路 / 孝四路',   lat: 25.1315328, lng: 121.7396819, cctvHexId: '10afbef6', rank: 7 },
    { id: 'DI-08', name: '中正路 / 正濱路',   lat: 25.1518792, lng: 121.7702085, cctvHexId: '8edd00b1', rank: 8 },
    { id: 'DI-09', name: '中山一路 / 忠一路', lat: 25.1323044, lng: 121.7384897, cctvHexId: '4e6b2984', rank: 9 },
    { id: 'DI-10', name: '中正路 / 信一路',   lat: 25.1312877, lng: 121.7434160, cctvHexId: '65d97b22', rank: 10 },
  ] as DangerIntersection[],

  deviceRates: [
    { name: 'CMS', rate: 84, color: 'var(--ok)' },
    { name: 'CCTV', rate: 50, color: 'var(--danger)' },
    { name: 'VD', rate: 65, color: 'var(--warn)' },
    { name: 'TC', rate: 100, color: 'var(--ok)' },
  ] as DeviceRate[],

  routeKpi: [
    { label: '路段 V/C 指數', value: '0.77', sub: '基隆市區' },
    { label: '即時旅行速率', value: '38.9 km/h', sub: '基隆市區' },
    { label: '路網壅塞比例', value: '43.2%', sub: '基隆市區' },
  ] as RouteKpi[],

  deviceRows: [
    { id: 'D-001', name: 'CCTV-1', location: '安一路', status: '正常', heartbeat: '2026-03-09 10:10' },
    { id: 'D-002', name: 'CMS-2', location: '孝三路', status: '異常', heartbeat: '2026-03-09 10:11' },
    { id: 'D-003', name: 'CCTV-3', location: '信一路', status: '正常', heartbeat: '2026-03-09 10:12' },
    { id: 'D-004', name: 'CMS-4', location: '中華路', status: '離線', heartbeat: '2026-03-09 10:13' },
    { id: 'D-005', name: 'CCTV-5', location: '安一路', status: '正常', heartbeat: '2026-03-09 10:14' },
    { id: 'D-006', name: 'CMS-6', location: '孝三路', status: '異常', heartbeat: '2026-03-09 10:15' },
    { id: 'D-007', name: 'CCTV-7', location: '信一路', status: '正常', heartbeat: '2026-03-09 10:16' },
    { id: 'D-008', name: 'CMS-8', location: '中華路', status: '正常', heartbeat: '2026-03-09 10:17' },
    { id: 'D-009', name: 'CCTV-9', location: '安一路', status: '正常', heartbeat: '2026-03-09 10:18' },
    { id: 'D-010', name: 'CMS-10', location: '孝三路', status: '正常', heartbeat: '2026-03-09 10:19' },
    { id: 'D-011', name: 'CCTV-11', location: '信一路', status: '異常', heartbeat: '2026-03-09 10:20' },
    { id: 'D-012', name: 'CMS-12', location: '中華路', status: '異常', heartbeat: '2026-03-09 10:21' },
    { id: 'D-013', name: 'CCTV-13', location: '安一路', status: '正常', heartbeat: '2026-03-09 10:22' },
    { id: 'D-014', name: 'CMS-14', location: '孝三路', status: '正常', heartbeat: '2026-03-09 10:23' },
    { id: 'D-015', name: 'CCTV-15', location: '信一路', status: '正常', heartbeat: '2026-03-09 10:24' },
    { id: 'D-016', name: 'CMS-16', location: '中華路', status: '離線', heartbeat: '2026-03-09 10:25' },
    { id: 'D-017', name: 'CCTV-17', location: '安一路', status: '正常', heartbeat: '2026-03-09 10:26' },
    { id: 'D-018', name: 'CMS-18', location: '孝三路', status: '異常', heartbeat: '2026-03-09 10:27' },
    { id: 'D-019', name: 'CCTV-19', location: '信一路', status: '正常', heartbeat: '2026-03-09 10:28' },
    { id: 'D-020', name: 'CMS-20', location: '中華路', status: '正常', heartbeat: '2026-03-09 10:29' },
  ] as DeviceRow[],

  responseTimeline: [
    { step: '事件建立', owner: 'AI 引擎', time: '09:11:02', state: '完成' },
    { step: '通知值勤人員', owner: '系統', time: '09:11:18', state: '完成' },
    { step: 'CMS 文案建議', owner: 'AI 助理', time: '09:11:29', state: '完成' },
    { step: '人員覆核', owner: '值勤人員', time: '09:12:08', state: '進行中' },
  ] as TimelineItem[],

  cmsTemplates: [
    { id: 'T-001', title: '前方路口事故，請減速慢行', channel: 'CMS', lastUsed: '2026-03-09' },
    { id: 'T-002', title: '前方壅塞，建議改道', channel: 'CMS', lastUsed: '2026-03-08' },
    { id: 'T-003', title: '施工路段，注意安全', channel: 'CMS', lastUsed: '2026-03-05' },
  ] as CmsTemplate[],

  dataSources: [
    { source: '交通部 TDX', update: '每分鐘', lag: '18s', status: '正常' },
    { source: '基隆 TC 動態資料', update: '每分鐘', lag: '45s', status: '警告' },
    { source: 'AccuWeather', update: '每日', lag: '0s', status: '正常' },
    { source: 'Google Maps API', update: '每分鐘', lag: '120s', status: '異常' },
  ] as DataSource[],
}

// FNV-1a + xorshift hash for a deterministic PRNG seeded by a string.
function makeRng(seed: string): () => number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}

type RangeConfig = {
  bucketCount: number
  labelAt: (i: number) => string
  highlightAt: (i: number) => boolean
  // rush-hour-like shape: 0..1 weight per bucket
  weightAt: (i: number) => number
}

function getRangeConfig(range: ChartRange): RangeConfig {
  if (range === '12h') {
    // 12 hourly buckets ending at current hour (17:00)
    const startHour = 6
    const endHour = 17
    const count = endHour - startHour + 1 // 12
    return {
      bucketCount: count,
      labelAt: (i) => `${String(startHour + i).padStart(2, '0')}:00`,
      highlightAt: (i) => i >= count - 5 && i <= count - 2, // mid-evening rush
      weightAt: (i) => {
        const hour = startHour + i
        // morning bump 7-9, evening bump 16-18
        const m = Math.exp(-Math.pow((hour - 8) / 1.6, 2))
        const e = Math.exp(-Math.pow((hour - 17) / 1.8, 2))
        return 0.2 + 0.8 * Math.max(m, e)
      },
    }
  }
  if (range === '24h') {
    return {
      bucketCount: 24,
      labelAt: (i) => String(i).padStart(2, '0'),
      highlightAt: (i) => i >= 16 && i <= 19,
      weightAt: (i) => {
        const m = Math.exp(-Math.pow((i - 8) / 1.8, 2))
        const e = Math.exp(-Math.pow((i - 17) / 1.8, 2))
        return 0.1 + 0.9 * Math.max(m, e)
      },
    }
  }
  // 7d — past 7 days ending today (2026-04-24)
  const days = ['04/18', '04/19', '04/20', '04/21', '04/22', '04/23', '04/24']
  return {
    bucketCount: 7,
    labelAt: (i) => days[i],
    highlightAt: (i) => i === 6,
    weightAt: (i) => {
      // weekdays higher than weekends. 04/18 = Sat, 04/19 = Sun, 04/20-04/24 = Mon-Fri
      const isWeekend = i === 0 || i === 1
      return isWeekend ? 0.55 : 0.9
    },
  }
}

function buildChartData(intersectionId: string, range: ChartRange): IntersectionChartData {
  const cfg = getRangeConfig(range)
  const rng = makeRng(`${intersectionId}|${range}`)
  const jitter = (amt: number) => (rng() - 0.5) * amt

  // Intersection-specific bias so different crossings look different.
  const biasRng = makeRng(intersectionId)
  const countPeak = 350 + Math.floor(biasRng() * 300)   // 350..650
  const speedPeak = 12 + biasRng() * 10                  // 12..22 m/s
  const ratioPeak = 50 + biasRng() * 30                  // 50..80 %
  const pedPeak = 4 + Math.floor(biasRng() * 8)          // 4..12 times

  const rightTurnCount: RightTurnCountPoint[] = []
  const rightTurnSpeed: RightTurnSpeedPoint[] = []
  const pedestrianViolation: PedestrianViolationPoint[] = []

  for (let i = 0; i < cfg.bucketCount; i++) {
    const w = cfg.weightAt(i)
    const label = cfg.labelAt(i)
    const hl = cfg.highlightAt(i)

    const cnt = Math.max(5, Math.round(countPeak * w + jitter(countPeak * 0.25)))
    rightTurnCount.push({ label, value: cnt, highlight: hl })

    const spd = Math.max(1, +(speedPeak * w + jitter(4)).toFixed(0))
    const ratio = Math.min(95, Math.max(5, +(ratioPeak * (0.4 + w * 0.9) + jitter(10)).toFixed(0)))
    rightTurnSpeed.push({ label, speed: spd, ratio, highlight: hl })

    const ped = Math.max(0, Math.round(pedPeak * w + jitter(pedPeak * 0.6)))
    pedestrianViolation.push({ label, value: ped, highlight: hl })
  }

  return { rightTurnCount, rightTurnSpeed, pedestrianViolation }
}

// Mock service functions
export const mockService = {
  getSidebarItems(): SidebarItem[] {
    return mockData.sidebarItems
  },

  getDashboardTabs(): TabItem[] {
    return mockData.dashboardTabs
  },

  getIncidents(): IncidentItem[] {
    return mockData.incidents
  },

  getDangerIntersections(): DangerIntersection[] {
    return mockData.dangerIntersections
  },

  getIntersectionChartData(intersectionId: string, range: ChartRange): IntersectionChartData {
    return buildChartData(intersectionId, range)
  },

  getIncidentsByStatus(): { status: IncidentItem['status']; items: IncidentItem[] }[] {
    return STATUS_ORDER
      .map(status => ({
        status,
        items: mockData.incidents.filter(i => i.status === status),
      }))
      .filter(group => group.items.length > 0)
  },

  getDeviceRates(): DeviceRate[] {
    return mockData.deviceRates
  },

  getRouteKpi(): RouteKpi[] {
    return mockData.routeKpi
  },

  getDevices(): DeviceRow[] {
    return mockData.deviceRows
  },

  getResponseTimeline(): TimelineItem[] {
    return mockData.responseTimeline
  },

  getCmsTemplates(): CmsTemplate[] {
    return mockData.cmsTemplates
  },

  getDataSources(): DataSource[] {
    return mockData.dataSources
  },

  getMapImage(tab: DashboardTab): string {
    switch (tab) {
      case 'unsignalizedIntersection':
        return `${import.meta.env.BASE_URL}media/image19.jpeg`
      case 'dangerIntersection':
        return `${import.meta.env.BASE_URL}media/image9.jpeg`
      case 'priorityPass':
        return `${import.meta.env.BASE_URL}media/roadmap.png`
      default:
        return `${import.meta.env.BASE_URL}media/image5.png`
    }
  },
}
