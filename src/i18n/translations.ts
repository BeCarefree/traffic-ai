export type Lang = 'zh' | 'en'

export const translations: Record<string, string> = {
  // App / topbar
  '交通控制決策輔助平台': 'Traffic Control Decision Support Platform',

  // Sidebar
  '交通監控儀表板': 'Traffic Monitoring Dashboard',
  '設備管理': 'Device Management',
  '事件反應管理': 'Incident Response',
  '資訊發布管理': 'Information Publishing',
  '資料監控': 'Data Monitoring',

  // Dashboard tabs
  '動態號控': 'Dynamic Signal Control',
  '優先通行': 'Priority Pass',
  '危險路口': 'Dangerous Intersections',
  '無號誌路口': 'Unsignalized Intersections',

  // Incident statuses
  '處理中': 'Processing',
  '已解除': 'Resolved',
  '新事件': 'New',

  // Incident types
  '人車事故': 'Vehicle-Pedestrian Accident',
  '緊急車輛通行': 'Emergency Vehicle Passage',
  '號誌異常': 'Signal Malfunction',
  '施工影響': 'Construction Impact',
  '未依規定讓車': 'Failure to Yield',
  '違反號誌/標誌管制': 'Signal/Sign Violation',
  '壅塞事件': 'Congestion Event',

  // Severity
  '高': 'High',
  '中': 'Medium',
  '低': 'Low',

  // Device statuses
  '正常': 'Normal',
  '異常': 'Faulty',
  '離線': 'Offline',

  // Data source statuses
  '警告': 'Warning',

  // Update frequency
  '每分鐘': 'Every minute',
  '每日': 'Daily',

  // Data sources
  '交通部 TDX': 'MOTC TDX',
  '基隆 TC 動態資料': 'Keelung TC Dynamic Data',

  // Route KPI
  '路段 V/C 指數': 'Road V/C Index',
  '即時旅行速率': 'Real-time Travel Speed',
  '路網壅塞比例': 'Network Congestion Ratio',
  '基隆市區': 'Keelung City',

  // Dashboard messages
  '正在檢測危險路口 CCTV 連線...': 'Checking dangerous intersection CCTV connections...',
  '目前沒有可用的危險路口 CCTV 即時影像': 'No dangerous intersection CCTV streams available',
  '正在檢測 CCTV 連線狀態...': 'Checking CCTV connection status...',
  '目前沒有可用的 CCTV 即時影像': 'No CCTV streams available',
  '重新檢查': 'Recheck',
  '危險路口排名': 'Dangerous Intersection Ranking',
  '即時事件通報列表': 'Real-time Incident List',
  'AI 決策輔助': 'AI Decision Support',
  '同意執行': 'Approve',
  '前往事件反應管理': 'Go to Incident Response',
  '忽略': 'Ignore',
  '無號誌路口排名': 'Unsignalized Intersection Ranking',
  '點擊切換到此路口': 'Click to switch to this intersection',
  'CCTV 目前無法連線': 'CCTV is currently unavailable',
  '點擊影像可放大檢視': 'Click image to enlarge',
  'CCTV 即時影像': 'CCTV Live Stream',
  '即時影像': 'Live Stream',
  '即時影像（放大）': 'Live Stream (Enlarged)',
  '關閉': 'Close',
  '導航至此路口': 'Navigate to this intersection',
  '排名': 'Rank',
  '建議操作：於附近 CMS 發布「前方路口發生事故，請減速通行」。':
    'Suggested action: publish "Accident ahead, please slow down" on nearby CMS.',

  // Cms page
  'CMS 文案模板與發布歷程（dummy）。': 'CMS templates and publishing history (dummy).',
  '模板編號': 'Template ID',
  '文案內容': 'Content',
  '渠道': 'Channel',
  '最後使用': 'Last Used',
  '文案預覽': 'Content Preview',
  '前方路口發生事故，請減速慢行並留意改道資訊。':
    'Accident ahead — please slow down and watch for detour info.',
  '發布歷程': 'Publishing History',
  '發布至': 'Published to',
  'CMS 設備示意': 'CMS Device Illustration',
  '前方路口事故，請減速慢行': 'Accident ahead — please slow down',
  '前方壅塞，建議改道': 'Congestion ahead — detour suggested',
  '施工路段，注意安全': 'Construction zone — drive safely',

  // DataMonitor page
  '資料來源連線狀態、更新延遲與錯誤示意（dummy）。':
    'Data source connection status, update lag, and error illustration (dummy).',
  '資料來源': 'Data Source',
  '更新頻率': 'Update Frequency',
  '延遲': 'Lag',
  '狀態': 'Status',
  '錯誤與告警': 'Errors & Alerts',
  'Google Maps API 延遲超過閾值（120s）': 'Google Maps API lag exceeded threshold (120s)',
  'TC 動態資料暫時抖動（已恢復）': 'TC dynamic data briefly jittered (recovered)',
  'CCTV-06 影像串流中斷（處理中）': 'CCTV-06 video stream interrupted (processing)',
  'AI 事故分析示意': 'AI Accident Analysis Illustration',

  // Devices page
  '本頁提供 20 筆以上 dummy 設備資料，涵蓋正常、異常與離線狀態。':
    'This page lists 20+ dummy device records covering Normal, Faulty, and Offline statuses.',
  '設備編號': 'Device ID',
  '設備名稱': 'Device Name',
  '位置': 'Location',
  '最後心跳': 'Last Heartbeat',

  // IncidentResponse page
  '顯示事件流程狀態與處理進度（dummy）。':
    'Shows incident workflow status and progress (dummy).',
  '事件編號': 'Incident ID',
  '事件類型': 'Incident Type',
  '路口': 'Intersection',
  '指派人員': 'Assignee',
  '流程時間軸': 'Workflow Timeline',
  '事故偵測示意': 'Accident Detection Illustration',
  '待處理': 'Pending',
  '已結案': 'Closed',
  '值勤A': 'Operator A',
  '值勤B': 'Operator B',

  // Response timeline (mockService)
  '事件建立': 'Incident Created',
  '通知值勤人員': 'Notify Operator',
  'CMS 文案建議': 'CMS Content Suggestion',
  '人員覆核': 'Manual Review',
  'AI 引擎': 'AI Engine',
  '系統': 'System',
  'AI 助理': 'AI Assistant',
  '值勤人員': 'Operator',
  '完成': 'Completed',
  '進行中': 'In Progress',

  // DangerCharts
  '近12小時': 'Last 12h',
  '近24小時': 'Last 24h',
  '近7天': 'Last 7d',
  '右轉車數量': 'Right-Turn Vehicle Count',
  '右轉車輛速度與減速比例': 'Right-Turn Speed & Deceleration Ratio',
  '未禮讓行人次數': 'Pedestrian Yield Violations',
  '次數': 'Count',
  '次': 'Times',
  '車輛速度': 'Vehicle Speed',
  '減速比例': 'Deceleration Ratio',
  '速度': 'Speed',
  '減速': 'Decel',

  // Signal info card
  '號誌資訊': 'Signal Info',
  '編號': 'ID',
  '經緯度': 'Coordinates',
  '最後上線': 'Last Online',
  '手動': 'Manual',
  '自動': 'Auto',

  // Language switcher
  '繁體中文': 'Traditional Chinese',
  'English': 'English',
}

export function translate(text: string, lang: Lang): string {
  if (lang === 'zh') return text
  return translations[text] ?? text
}
