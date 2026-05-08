export type Lang = 'zh' | 'en' | 'es419'
type NonZhLang = 'en' | 'es419'

export const translations: Record<string, Partial<Record<NonZhLang, string>>> = {
  // App / topbar
  '交通控制決策輔助平台': {
    en: 'Traffic Control Decision Support Platform',
    es419: 'Plataforma de Apoyo para la Toma de Decisiones de Control de Tráfico',
  },

  // Sidebar
  '交通監控儀表板': { en: 'Traffic Monitoring Dashboard', es419: 'Panel de Monitoreo de Tráfico' },
  '設備管理': { en: 'Device Management', es419: 'Gestión de Dispositivos' },
  '事件反應管理': { en: 'Incident Response', es419: 'Respuesta a Incidentes' },
  '資訊發布管理': { en: 'Information Publishing', es419: 'Publicación de Información' },
  '資料監控': { en: 'Data Monitoring', es419: 'Monitoreo de Datos' },

  // Dashboard tabs
  '動態號控': { en: 'Dynamic Signal Control', es419: 'Control Dinámico de Semáforos' },
  '動態號控列表': { en: 'Dynamic Signal Control List', es419: 'Lista de Control Dinámico de Semáforos' },
  '優先通行': { en: 'Priority Pass', es419: 'Paso Prioritario' },
  '優先通行列表': { en: 'Priority Pass List', es419: 'Lista de Paso Prioritario' },
  '危險路口': { en: 'Dangerous Intersections', es419: 'Intersecciones Peligrosas' },
  '無號誌路口': { en: 'Unsignalized Intersections', es419: 'Intersecciones sin Semáforo' },

  // Incident statuses
  '處理中': { en: 'Processing', es419: 'En proceso' },
  '已解除': { en: 'Resolved', es419: 'Resuelto' },
  '新事件': { en: 'New', es419: 'Nuevo' },

  // Incident types
  '人車事故': { en: 'Vehicle-Pedestrian Accident', es419: 'Accidente entre Vehículo y Peatón' },
  '緊急車輛通行': { en: 'Emergency Vehicle Passage', es419: 'Paso de Vehículo de Emergencia' },
  '號誌異常': { en: 'Signal Malfunction', es419: 'Falla de Semáforo' },
  '施工影響': { en: 'Construction Impact', es419: 'Impacto por Obras' },
  '未依規定讓車': { en: 'Failure to Yield', es419: 'No Ceder el Paso' },
  '違反號誌/標誌管制': { en: 'Signal/Sign Violation', es419: 'Infracción de Semáforo/Señal' },
  '壅塞事件': { en: 'Congestion Event', es419: 'Evento de Congestión' },

  // Severity
  '高': { en: 'High', es419: 'Alta' },
  '中': { en: 'Medium', es419: 'Media' },
  '低': { en: 'Low', es419: 'Baja' },

  // Device statuses
  '正常': { en: 'Normal', es419: 'Normal' },
  '異常': { en: 'Faulty', es419: 'Con falla' },
  '離線': { en: 'Offline', es419: 'Desconectado' },

  // Data source statuses
  '警告': { en: 'Warning', es419: 'Advertencia' },

  // Update frequency
  '每分鐘': { en: 'Every minute', es419: 'Cada minuto' },
  '每日': { en: 'Daily', es419: 'Diario' },

  // Data sources
  '交通部 TDX': { en: 'MOTC TDX', es419: 'TDX del MOTC' },
  '基隆 TC 動態資料': { en: 'Keelung TC Dynamic Data', es419: 'Datos Dinámicos de TC de Keelung' },

  // Route KPI
  '路段 V/C 指數': { en: 'Road V/C Index', es419: 'Índice V/C del Tramo' },
  '即時旅行速率': { en: 'Real-time Travel Speed', es419: 'Velocidad de Viaje en Tiempo Real' },
  '路網壅塞比例': { en: 'Network Congestion Ratio', es419: 'Proporción de Congestión de la Red' },
  '基隆市區': { en: 'Keelung City', es419: 'Ciudad de Keelung' },

  // Dashboard messages
  '正在檢測危險路口 CCTV 連線...': {
    en: 'Checking dangerous intersection CCTV connections...',
    es419: 'Verificando conexiones de CCTV en intersecciones peligrosas...',
  },
  '目前沒有可用的危險路口 CCTV 即時影像': {
    en: 'No dangerous intersection CCTV streams available',
    es419: 'No hay transmisiones de CCTV disponibles para intersecciones peligrosas',
  },
  '正在檢測 CCTV 連線狀態...': { en: 'Checking CCTV connection status...', es419: 'Verificando estado de conexión de CCTV...' },
  '目前沒有可用的 CCTV 即時影像': { en: 'No CCTV streams available', es419: 'No hay transmisiones de CCTV disponibles' },
  '重新檢查': { en: 'Recheck', es419: 'Volver a verificar' },
  '危險路口排名': { en: 'Dangerous Intersection Ranking', es419: 'Ranking de Intersecciones Peligrosas' },
  '即時事件通報列表': { en: 'Real-time Incident List', es419: 'Lista de Incidentes en Tiempo Real' },
  'AI 決策輔助': { en: 'AI Decision Support', es419: 'Apoyo de Decisión con IA' },
  '同意執行': { en: 'Approve', es419: 'Aprobar' },
  '前往事件反應管理': { en: 'Go to Incident Response', es419: 'Ir a Respuesta a Incidentes' },
  '忽略': { en: 'Ignore', es419: 'Ignorar' },
  '無號誌路口排名': { en: 'Unsignalized Intersection Ranking', es419: 'Ranking de Intersecciones sin Semáforo' },
  '點擊切換到此路口': { en: 'Click to switch to this intersection', es419: 'Haz clic para cambiar a esta intersección' },
  'CCTV 目前無法連線': { en: 'CCTV is currently unavailable', es419: 'CCTV no está disponible actualmente' },
  '點擊影像可放大檢視': { en: 'Click image to enlarge', es419: 'Haz clic en la imagen para ampliar' },
  'CCTV 即時影像': { en: 'CCTV Live Stream', es419: 'Transmisión en Vivo de CCTV' },
  '即時影像': { en: 'Live Stream', es419: 'Transmisión en Vivo' },
  '即時影像（放大）': { en: 'Live Stream (Enlarged)', es419: 'Transmisión en Vivo (Ampliada)' },
  '關閉': { en: 'Close', es419: 'Cerrar' },
  '導航至此路口': { en: 'Navigate to this intersection', es419: 'Navegar a esta intersección' },
  '排名': { en: 'Rank', es419: 'Posición' },
  '建議操作：於附近 CMS 發布「前方路口發生事故，請減速通行」。':
    {
      en: 'Suggested action: publish "Accident ahead, please slow down" on nearby CMS.',
      es419: 'Acción sugerida: publicar "Accidente adelante, reduzca la velocidad" en CMS cercanos.',
    },

  // Cms page
  'CMS 文案模板與發布歷程（dummy）。': {
    en: 'CMS templates and publishing history (dummy).',
    es419: 'Plantillas de CMS e historial de publicación (dummy).',
  },
  '模板編號': { en: 'Template ID', es419: 'ID de Plantilla' },
  '文案內容': { en: 'Content', es419: 'Contenido' },
  '渠道': { en: 'Channel', es419: 'Canal' },
  '最後使用': { en: 'Last Used', es419: 'Último Uso' },
  '文案預覽': { en: 'Content Preview', es419: 'Vista Previa del Contenido' },
  '前方路口發生事故，請減速慢行並留意改道資訊。':
    {
      en: 'Accident ahead — please slow down and watch for detour info.',
      es419: 'Accidente adelante: reduzca la velocidad y preste atención a la información de desvío.',
    },
  '發布歷程': { en: 'Publishing History', es419: 'Historial de Publicación' },
  '發布至': { en: 'Published to', es419: 'Publicado en' },
  'CMS 設備示意': { en: 'CMS Device Illustration', es419: 'Ilustración de Dispositivo CMS' },
  '前方路口事故，請減速慢行': { en: 'Accident ahead — please slow down', es419: 'Accidente adelante: reduzca la velocidad' },
  '前方壅塞，建議改道': { en: 'Congestion ahead — detour suggested', es419: 'Congestión adelante: se sugiere desvío' },
  '施工路段，注意安全': { en: 'Construction zone — drive safely', es419: 'Zona de obras: conduzca con precaución' },

  // DataMonitor page
  '資料來源連線狀態、更新延遲與錯誤示意（dummy）。': {
    en: 'Data source connection status, update lag, and error illustration (dummy).',
    es419: 'Estado de conexión de fuentes de datos, retraso de actualización e ilustración de errores (dummy).',
  },
  '資料來源': { en: 'Data Source', es419: 'Fuente de Datos' },
  '更新頻率': { en: 'Update Frequency', es419: 'Frecuencia de Actualización' },
  '延遲': { en: 'Lag', es419: 'Retraso' },
  '狀態': { en: 'Status', es419: 'Estado' },
  '錯誤與告警': { en: 'Errors & Alerts', es419: 'Errores y Alertas' },
  'Google Maps API 延遲超過閾值（120s）': {
    en: 'Google Maps API lag exceeded threshold (120s)',
    es419: 'El retraso de la API de Google Maps superó el umbral (120s)',
  },
  'TC 動態資料暫時抖動（已恢復）': {
    en: 'TC dynamic data briefly jittered (recovered)',
    es419: 'Los datos dinámicos de TC presentaron inestabilidad temporal (recuperado)',
  },
  'CCTV-06 影像串流中斷（處理中）': {
    en: 'CCTV-06 video stream interrupted (processing)',
    es419: 'La transmisión de video de CCTV-06 se interrumpió (en proceso)',
  },
  'AI 事故分析示意': { en: 'AI Accident Analysis Illustration', es419: 'Ilustración de Análisis de Accidentes con IA' },

  // Devices page
  '本頁提供 20 筆以上 dummy 設備資料，涵蓋正常、異常與離線狀態。': {
    en: 'This page lists 20+ dummy device records covering Normal, Faulty, and Offline statuses.',
    es419: 'Esta página muestra más de 20 registros dummy de dispositivos, incluyendo estados Normal, Con falla y Desconectado.',
  },
  '設備編號': { en: 'Device ID', es419: 'ID de Dispositivo' },
  '設備名稱': { en: 'Device Name', es419: 'Nombre del Dispositivo' },
  '位置': { en: 'Location', es419: 'Ubicación' },
  '最後心跳': { en: 'Last Heartbeat', es419: 'Último Latido' },

  // IncidentResponse page
  '顯示事件流程狀態與處理進度（dummy）。': {
    en: 'Shows incident workflow status and progress (dummy).',
    es419: 'Muestra el estado y el progreso del flujo de incidentes (dummy).',
  },
  '事件編號': { en: 'Incident ID', es419: 'ID de Incidente' },
  '事件類型': { en: 'Incident Type', es419: 'Tipo de Incidente' },
  '路口': { en: 'Intersection', es419: 'Intersección' },
  '指派人員': { en: 'Assignee', es419: 'Asignado a' },
  '流程時間軸': { en: 'Workflow Timeline', es419: 'Línea de Tiempo del Flujo' },
  '事故偵測示意': { en: 'Accident Detection Illustration', es419: 'Ilustración de Detección de Accidentes' },
  '待處理': { en: 'Pending', es419: 'Pendiente' },
  '已結案': { en: 'Closed', es419: 'Cerrado' },
  '值勤A': { en: 'Operator A', es419: 'Operador A' },
  '值勤B': { en: 'Operator B', es419: 'Operador B' },

  // Response timeline (mockService)
  '事件建立': { en: 'Incident Created', es419: 'Incidente Creado' },
  '通知值勤人員': { en: 'Notify Operator', es419: 'Notificar al Operador' },
  'CMS 文案建議': { en: 'CMS Content Suggestion', es419: 'Sugerencia de Contenido CMS' },
  '人員覆核': { en: 'Manual Review', es419: 'Revisión Manual' },
  'AI 引擎': { en: 'AI Engine', es419: 'Motor de IA' },
  '系統': { en: 'System', es419: 'Sistema' },
  'AI 助理': { en: 'AI Assistant', es419: 'Asistente de IA' },
  '值勤人員': { en: 'Operator', es419: 'Operador' },
  '完成': { en: 'Completed', es419: 'Completado' },
  '進行中': { en: 'In Progress', es419: 'En progreso' },

  // DangerCharts
  '近12小時': { en: 'Last 12h', es419: 'Últimas 12 h' },
  '近24小時': { en: 'Last 24h', es419: 'Últimas 24 h' },
  '近7天': { en: 'Last 7d', es419: 'Últimos 7 días' },
  '右轉車數量': { en: 'Right-Turn Vehicle Count', es419: 'Cantidad de Vehículos que Giran a la Derecha' },
  '右轉車輛速度與減速比例': { en: 'Right-Turn Speed & Deceleration Ratio', es419: 'Velocidad y Proporción de Desaceleración al Girar a la Derecha' },
  '未禮讓行人次數': { en: 'Pedestrian Yield Violations', es419: 'Incumplimientos de Prioridad al Peatón' },
  '次數': { en: 'Count', es419: 'Conteo' },
  '次': { en: 'Times', es419: 'Veces' },
  '車輛速度': { en: 'Vehicle Speed', es419: 'Velocidad del Vehículo' },
  '減速比例': { en: 'Deceleration Ratio', es419: 'Proporción de Desaceleración' },
  '速度': { en: 'Speed', es419: 'Velocidad' },
  '減速': { en: 'Decel', es419: 'Desacel.' },

  // Road performance & strategy effectiveness (dynamicSignal tab)
  '道路績效': { en: 'Road Performance', es419: 'Rendimiento Vial' },
  '上次策略成效量化評估': { en: 'Last Strategy Effectiveness', es419: 'Efectividad de la Última Estrategia' },
  '更新時間': { en: 'Updated', es419: 'Actualizado' },
  '通行時間': { en: 'Travel Time', es419: 'Tiempo de Viaje' },
  '繞行車流': { en: 'Bypass Traffic', es419: 'Tráfico de Desvío' },
  '重新整理': { en: 'Refresh', es419: 'Actualizar' },

  // Signal info card
  '號誌資訊': { en: 'Signal Info', es419: 'Información de Semáforo' },
  '編號': { en: 'ID', es419: 'ID' },
  '經緯度': { en: 'Coordinates', es419: 'Coordenadas' },
  '最後上線': { en: 'Last Online', es419: 'Última Conexión' },
  '手動': { en: 'Manual', es419: 'Manual' },
  '自動': { en: 'Auto', es419: 'Automático' },

  // Language switcher
  '繁體中文': { en: 'Traditional Chinese', es419: 'Chino Tradicional' },
  'English': { en: 'English', es419: 'Inglés' },
}

export function translate(text: string, lang: Lang): string {
  if (lang === 'zh') return text
  const row = translations[text]
  if (!row) return text
  if (lang === 'en') return row.en ?? text
  return row.es419 ?? row.en ?? text
}
