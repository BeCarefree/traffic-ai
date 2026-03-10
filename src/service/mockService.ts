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
}

export type SidebarItem = { key: MainPage; label: string }
export type TabItem = { key: DashboardTab; label: string }
export type DeviceRate = { name: string; rate: number; color: string }
export type RouteKpi = { label: string; value: string; sub: string }
export type DeviceRow = { id: string; name: string; location: string; status: string; heartbeat: string }
export type TimelineItem = { step: string; owner: string; time: string; state: string }
export type CmsTemplate = { id: string; title: string; channel: string; lastUsed: string }
export type DataSource = { source: string; update: string; lag: string; status: string }

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
    { key: 'dynamicSignal', label: '動態號控示範區' },
    { key: 'priorityPass', label: '優先通行示範區' },
    { key: 'dangerIntersection', label: '危險路口示範區' },
    { key: 'unsignalizedIntersection', label: '無號誌路口示範區' },
  ] as TabItem[],

  incidents: [
    { id: 'E-20260309-001', time: '2026-03-09 09:11', type: '人車事故', status: '處理中', location: '安一路 / 西定路', severity: '高' },
    { id: 'E-20260309-002', time: '2026-03-09 09:25', type: '忠一路壅塞', status: '新事件', location: '忠一路 / 愛三路', severity: '中' },
    { id: 'E-20260309-003', time: '2026-03-09 09:40', type: '施工影響', status: '已解除', location: '中華路 / 復旦路', severity: '低' },
    { id: 'E-20260309-004', time: '2026-03-09 10:02', type: '人車事故', status: '新事件', location: '孝三路 / 忠三路', severity: '高' },
    { id: 'E-20260309-005', time: '2026-03-09 10:15', type: '號誌異常', status: '處理中', location: '信一路 / 義一路', severity: '中' },
  ] as IncidentItem[],

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
        return '/media/image19.jpeg'
      case 'dangerIntersection':
        return '/media/image9.jpeg'
      case 'priorityPass':
        return '/media/image7.jpeg'
      default:
        return '/media/image5.png'
    }
  },
}
