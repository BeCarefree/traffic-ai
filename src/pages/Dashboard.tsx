import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { DangerIntersection, DashboardTab, IncidentItem } from '../service/mockService'
import { mockService } from '../service/mockService'
import { DangerCharts } from '../components/DangerCharts'
import { SignalInfoCard } from '../components/SignalInfoCard'
import { StreamingCctvImage } from '../components/StreamingCctvImage'
import { useLanguage } from '../i18n/languageContext'
import { checkCctvBatch, clearCctvCacheFor } from '../utils/cctvCheck'
import type { CancelToken, CheckProgress } from '../utils/cctvCheck'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const STATUS_CLASSNAME: Record<IncidentItem['status'], string> = {
  '處理中': 'processing',
  '已解除': 'resolved',
  '新事件': 'new',
}

const STATUS_ORDER: IncidentItem['status'][] = ['處理中', '已解除', '新事件']

// 取自 9 個基隆市區危險路口的幾何中心（DI-08 在八斗子另以平移檢視）
const KEELUNG_CENTER: [number, number] = [25.1303, 121.7415]
const DEFAULT_ZOOM = 16
const FLY_ZOOM = 17
const CCTV_CONCURRENCY = 5

type ActiveTarget =
  | { kind: 'incident'; item: IncidentItem }
  | { kind: 'intersection'; item: DangerIntersection }

export default function DashboardPage() {
  const { t, lang } = useLanguage()
  const [activeTab, setActiveTab] = useState<DashboardTab>('dangerIntersection')
  const allIncidents = useMemo(() => mockService.getIncidents(), [])
  const allDangerIntersections = useMemo(() => mockService.getDangerIntersections(), [])

  const isDangerTab = activeTab === 'dangerIntersection'

  // CCTV 連線檢查狀態
  const [incidentChecking, setIncidentChecking] = useState(true)
  const [incidentProgress, setIncidentProgress] = useState<CheckProgress>({ done: 0, total: 0 })
  const [availableIncidents, setAvailableIncidents] = useState<IncidentItem[]>([])

  const [dangerChecking, setDangerChecking] = useState(true)
  const [dangerProgress, setDangerProgress] = useState<CheckProgress>({ done: 0, total: 0 })
  const [availableIntersections, setAvailableIntersections] = useState<DangerIntersection[]>([])

  const incidentCancelRef = useRef<CancelToken>({ cancelled: false })
  const dangerCancelRef = useRef<CancelToken>({ cancelled: false })

  // Selections per flow
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null)
  const [navigatedIncident, setNavigatedIncident] = useState<IncidentItem | null>(null)
  const [selectedIntersection, setSelectedIntersection] = useState<DangerIntersection | null>(null)

  const [cctvExpanded, setCctvExpanded] = useState(false)
  // 動態號控 tab 中，路口號誌資訊卡的螢幕像素座標（隨地圖 pan/zoom 即時更新）
  const [signalCardPos, setSignalCardPos] = useState<{ x: number; y: number } | null>(null)

  // 動態號控 tab — 道路績效更新時間（按重新整理時切到「現在」）
  const [routeKpiUpdateTime, setRouteKpiUpdateTime] = useState<string>(
    () => mockService.getRouteKpiUpdateTime(),
  )
  const handleRefreshRouteKpi = useCallback(() => {
    const d = new Date()
    const p = (n: number) => String(n).padStart(2, '0')
    setRouteKpiUpdateTime(
      `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`,
    )
  }, [])

  const dashboardTabs = mockService.getDashboardTabs()
  const routeKpi = mockService.getRouteKpi()

  // Leaflet map refs
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.LayerGroup | null>(null)
  const priorityLayerRef = useRef<L.LayerGroup | null>(null)
  const activeMarkerRef = useRef<L.Marker | null>(null)
  const handleNavigateRef = useRef<(incident: IncidentItem) => void>(() => {})
  const handleSelectIntersectionRef = useRef<(i: DangerIntersection) => void>(() => {})

  // 即時事件依狀態分組（優先通行 / 無號誌路口 tab 使用）
  const incidentGroups = useMemo(() => {
    return STATUS_ORDER
      .map(status => ({
        status,
        items: availableIncidents.filter(i => i.status === status),
      }))
      .filter(group => group.items.length > 0)
  }, [availableIncidents])

  // 動態號控 tab 的扁平清單 — 不分組、按時間倒序（新事件在前）
  const flatIncidents = useMemo(() => {
    return [...availableIncidents].sort((a, b) => b.time.localeCompare(a.time))
  }, [availableIncidents])

  // 優先通行 tab — 固定顯示 3 個有 CCTV 的路口（從 availableIncidents 中篩選）
  const PRIORITY_IDS = useMemo(() => mockService.getPriorityPassIds(), [])
  const priorityIncidents = useMemo(() => {
    return PRIORITY_IDS
      .map(id => availableIncidents.find(i => i.id === id))
      .filter((i): i is IncidentItem => i != null)
  }, [availableIncidents, PRIORITY_IDS])

  const handleNavigate = useCallback((incident: IncidentItem) => {
    setNavigatedIncident(incident)
    setSelectedIncident(incident)
    setCctvExpanded(false)
  }, [])

  const handleSelectIntersection = useCallback((intersection: DangerIntersection) => {
    setSelectedIntersection(intersection)
    setCctvExpanded(false)
  }, [])

  handleNavigateRef.current = handleNavigate
  handleSelectIntersectionRef.current = handleSelectIntersection

  const activeTarget: ActiveTarget | null = useMemo(() => {
    if (isDangerTab) {
      return selectedIntersection ? { kind: 'intersection', item: selectedIntersection } : null
    }
    return navigatedIncident ? { kind: 'incident', item: navigatedIncident } : null
  }, [isDangerTab, selectedIntersection, navigatedIncident])

  // 路口名字保留中文（不翻譯）
  const activeLabel = activeTarget
    ? activeTarget.kind === 'incident'
      ? activeTarget.item.location
      : activeTarget.item.name
    : null

  const cctvImageUrl = activeTarget
    ? `https://cctv.klcg.gov.tw/${activeTarget.item.cctvHexId}/snapshot`
    : null

  // Step 1a: Probe incident CCTVs (callable for retry)
  const probeIncidents = useCallback(() => {
    incidentCancelRef.current.cancelled = true
    const cancel: CancelToken = { cancelled: false }
    incidentCancelRef.current = cancel

    setIncidentChecking(true)
    setIncidentProgress({ done: 0, total: allIncidents.length })

    checkCctvBatch(allIncidents, {
      concurrency: CCTV_CONCURRENCY,
      cancel,
      onProgress: (p) => {
        if (!cancel.cancelled) setIncidentProgress(p)
      },
    }).then((results) => {
      if (cancel.cancelled) return
      const available = allIncidents.filter((_, idx) => results[idx])
      setAvailableIncidents(available)
      setIncidentChecking(false)
    })
  }, [allIncidents])

  // Step 1b: Probe danger-intersection CCTVs (callable for retry)
  const probeIntersections = useCallback(() => {
    dangerCancelRef.current.cancelled = true
    const cancel: CancelToken = { cancelled: false }
    dangerCancelRef.current = cancel

    setDangerChecking(true)
    setDangerProgress({ done: 0, total: allDangerIntersections.length })

    checkCctvBatch(allDangerIntersections, {
      concurrency: CCTV_CONCURRENCY,
      cancel,
      onProgress: (p) => {
        if (!cancel.cancelled) setDangerProgress(p)
      },
    }).then((results) => {
      if (cancel.cancelled) return
      const available = allDangerIntersections.filter((_, idx) => results[idx])
      setAvailableIntersections(available)
      setDangerChecking(false)
    })
  }, [allDangerIntersections])

  // 啟動兩個檢測（mount 時各跑一次，cleanup 取消尚未完成的請求）
  useEffect(() => {
    probeIncidents()
    return () => { incidentCancelRef.current.cancelled = true }
  }, [probeIncidents])

  useEffect(() => {
    probeIntersections()
    return () => { dangerCancelRef.current.cancelled = true }
  }, [probeIntersections])

  // 「重新檢查」清除快取後重新 probe
  const handleRecheckIntersections = useCallback(() => {
    clearCctvCacheFor(allDangerIntersections.map(d => d.cctvHexId))
    probeIntersections()
  }, [allDangerIntersections, probeIntersections])

  const handleRecheckIncidents = useCallback(() => {
    clearCctvCacheFor(allIncidents.map(i => i.cctvHexId))
    probeIncidents()
  }, [allIncidents, probeIncidents])

  // Step 2: Initialize map (once)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const container = mapContainerRef.current

    const map = L.map(container, {
      center: KEELUNG_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 20,
      subdomains: 'abcd',
    }).addTo(map)

    markersRef.current = L.layerGroup().addTo(map)
    priorityLayerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    setTimeout(() => map.invalidateSize(), 100)

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize()
    })
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Step 3: Render markers based on active tab
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return

    markersRef.current.clearLayers()

    if (isDangerTab) {
      if (dangerChecking) return

      availableIntersections.forEach((d) => {
        const color = d.rank <= 3 ? '#ef4444' : d.rank <= 7 ? '#f59e0b' : '#22c55e'
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div class="marker-dot" style="background:${color};box-shadow:0 0 12px ${color}aa"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })

        const marker = L.marker([d.lat, d.lng], { icon })
          .bindTooltip(`${d.name}（${t('排名')} #${d.rank}）`, {
            permanent: false,
            direction: 'top',
            offset: [0, -14],
            className: 'map-tooltip',
          })
          .addTo(markersRef.current!)

        marker.on('click', () => {
          handleSelectIntersectionRef.current(d)
        })
      })

      if (availableIntersections.length > 0 && !selectedIntersection) {
        setTimeout(() => {
          handleSelectIntersectionRef.current(availableIntersections[0])
        }, 300)
      }
    } else {
      if (incidentChecking) return

      // 優先通行 tab 只顯示 3 個指定路口；其他 tab 顯示全部
      const incidentsToShow = activeTab === 'priorityPass' ? priorityIncidents : availableIncidents

      incidentsToShow.forEach((incident) => {
        const isProcessing = incident.status === '處理中'
        const isNew = incident.status === '新事件'
        const color = isProcessing ? '#f59e0b' : isNew ? '#ef4444' : '#22c55e'

        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div class="marker-dot" style="background:${color};box-shadow:0 0 12px ${color}aa"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })

        const marker = L.marker([incident.lat, incident.lng], { icon })
          .bindTooltip(incident.location, {
            permanent: false,
            direction: 'top',
            offset: [0, -14],
            className: 'map-tooltip',
          })
          .addTo(markersRef.current!)

        marker.on('click', () => {
          handleNavigateRef.current(incident)
        })
      })

      if (incidentsToShow.length > 0 && !navigatedIncident) {
        setTimeout(() => {
          handleNavigateRef.current(incidentsToShow[0])
        }, 300)
      }
    }

    // 優先通行 tab：在每個路口畫綠色圓環 + 救護車圖示
    if (priorityLayerRef.current) priorityLayerRef.current.clearLayers()
    if (activeTab === 'priorityPass' && priorityLayerRef.current) {
      const AMBULANCE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 36" width="48" height="36"><rect x="1" y="6" width="46" height="22" rx="4" fill="#fff" stroke="#ef4444" stroke-width="2"/><rect x="3" y="8" width="18" height="18" rx="2" fill="#ef4444"/><rect x="9" y="12" width="6" height="10" rx="1" fill="#fff"/><rect x="10.5" y="14" width="3" height="6" rx=".5" fill="#ef4444"/><path d="M21 14h14c4 0 7 3 7 7v5H21z" fill="#dbeafe" stroke="#3b82f6" stroke-width="1"/><circle cx="12" cy="30" r="4" fill="#334155" stroke="#fff" stroke-width="1.5"/><circle cx="36" cy="30" r="4" fill="#334155" stroke="#fff" stroke-width="1.5"/><rect x="38" y="18" width="4" height="2" rx="1" fill="#f59e0b"/><text x="30" y="22" font-size="7" font-weight="bold" fill="#ef4444" text-anchor="middle">➕</text></svg>`

      priorityIncidents.forEach((incident) => {
        // 綠色圓環 — 代表優先通行範圍區域
        const greenCircle = L.circle([incident.lat, incident.lng], {
          radius: 35,
          color: '#22c55e',
          weight: 4,
          opacity: 0.9,
          fillColor: '#22c55e',
          fillOpacity: 0.12,
          dashArray: '8 5',
          className: 'priority-circle',
        })
        greenCircle.addTo(priorityLayerRef.current!)

        // 救護車圖示 — 與路口同座標，用 pixel offset 定位在圓點右上方（保持距離不重疊）
        const ambulanceIcon = L.divIcon({
          className: 'ambulance-marker',
          html: AMBULANCE_SVG,
          iconSize: [48, 36],
          iconAnchor: [24, -10],  // 水平置中、垂直向下偏移，顯示在圓點正下方
        })
        const ambulanceMarker = L.marker(
          [incident.lat, incident.lng],
          { icon: ambulanceIcon, interactive: false },
        )
        ambulanceMarker.addTo(priorityLayerRef.current!)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDangerTab, availableIntersections, dangerChecking, availableIncidents, incidentChecking, activeTab, priorityIncidents, t])

  // Step 4: Fly to active target + render pulse marker
  useEffect(() => {
    if (!mapRef.current) return

    if (activeMarkerRef.current) {
      activeMarkerRef.current.remove()
      activeMarkerRef.current = null
    }

    if (!activeTarget) return

    const { lat, lng } = activeTarget.item
    // 路口名字保留中文（不翻譯）
    const label = activeTarget.kind === 'incident'
      ? activeTarget.item.location
      : activeTarget.item.name

    mapRef.current.flyTo([lat, lng], FLY_ZOOM, { duration: 0.8 })

    const onMoveEnd = () => {
      mapRef.current?.invalidateSize()
      mapRef.current?.off('moveend', onMoveEnd)
    }
    mapRef.current.on('moveend', onMoveEnd)

    const pulseIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div class="marker-pulse"></div><div class="marker-dot active"></div>`,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    })

    const activeMarker = L.marker([lat, lng], { icon: pulseIcon, zIndexOffset: 1000 })
      .addTo(mapRef.current)

    // 動態號控 tab：路口名稱已在號誌資訊卡的「位置」欄位 + CCTV 浮層中顯示，
    // 此處不再掛永久 tooltip，避免與號誌資訊卡互相重疊。
    if (activeTab !== 'dynamicSignal') {
      activeMarker.bindTooltip(label, {
        permanent: true,
        direction: 'top',
        offset: [0, -20],
        className: 'map-tooltip active-tooltip',
      })
    }

    activeMarkerRef.current = activeMarker
  }, [activeTarget, activeTab])

  // Step 5: 計算 SignalInfoCard 的像素位置，並隨地圖 pan/zoom 即時更新
  useEffect(() => {
    const map = mapRef.current
    if (!map || activeTab !== 'dynamicSignal' || !activeTarget || activeTarget.kind !== 'incident') {
      setSignalCardPos(null)
      return
    }

    const { lat, lng } = activeTarget.item
    const update = () => {
      const point = map.latLngToContainerPoint([lat, lng])
      setSignalCardPos({ x: point.x, y: point.y })
    }
    update()
    map.on('move zoom moveend zoomend', update)
    return () => {
      map.off('move zoom moveend zoomend', update)
    }
  }, [activeTarget, activeTab])

  // 取得當前選定事件的號誌資訊（只在動態號控 tab 顯示）
  const signalInfo = useMemo(() => {
    if (activeTab !== 'dynamicSignal' || !navigatedIncident) return null
    return mockService.getSignalInfo(navigatedIncident.id)
  }, [activeTab, navigatedIncident])

  // 策略成效隨 selectedIncident 變動 — 同事件固定數據、跨事件會變化
  const strategyEffects = useMemo(() => {
    if (activeTab !== 'dynamicSignal' || !selectedIncident) return []
    return mockService.getStrategyEffects(selectedIncident.id)
  }, [activeTab, selectedIncident])

  // 卡片靠近右邊界時自動翻到 marker 左側
  const signalCardSide: 'left' | 'right' = useMemo(() => {
    if (!signalCardPos || !mapContainerRef.current) return 'right'
    const containerWidth = mapContainerRef.current.clientWidth
    return signalCardPos.x + 260 > containerWidth ? 'left' : 'right'
  }, [signalCardPos])

  const chartsIntersectionId = isDangerTab
    ? (selectedIntersection ?? availableIntersections[0])?.id ?? null
    : null

  // Danger ranking list (top ranks, filter to available for click-through)
  const dangerRankList = useMemo(() => {
    if (!isDangerTab) return []
    const availableIds = new Set(availableIntersections.map(d => d.id))
    return [...allDangerIntersections]
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 5)
      .map(d => ({ ...d, available: availableIds.has(d.id) }))
  }, [isDangerTab, allDangerIntersections, availableIntersections])

  // 無號誌路口排名：把每筆對到 availableIncidents 中的事件，沒對到就標 disabled。
  const unsignalizedRankList = useMemo(() => {
    const ranks = mockService.getUnsignalizedRanks()
    const incidentMap = new Map(availableIncidents.map(i => [i.id, i]))
    return ranks.map(r => ({
      ...r,
      incident: incidentMap.get(r.incidentId) ?? null,
    }))
  }, [availableIncidents])

  return (
    <section className="page-grid">
      <div className="tabs">
        {dashboardTabs.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? 'tab-btn active' : 'tab-btn'}
            onClick={() => {
              setActiveTab(tab.key)
              // 切換 tab 時清除舊的選取狀態，避免前一個 tab 的標記殘留
              setNavigatedIncident(null)
              setSelectedIncident(null)
              setSelectedIntersection(null)
            }}
          >
            {t(tab.label)}
          </button>
        ))}
      </div>

      <div className="map-panel card">
        <div ref={mapContainerRef} className="leaflet-map-container" />

        {activeTarget && cctvImageUrl && activeLabel && (
          <div className="cctv-overlay">
            <div className="cctv-overlay-header">
              <span className="cctv-overlay-title">{activeLabel}</span>
              <button
                className="cctv-overlay-close"
                onClick={() => {
                  if (activeTarget.kind === 'intersection') setSelectedIntersection(null)
                  else setNavigatedIncident(null)
                  if (activeMarkerRef.current) {
                    activeMarkerRef.current.remove()
                    activeMarkerRef.current = null
                  }
                }}
                title={t('關閉')}
              >
                ✕
              </button>
            </div>
            <StreamingCctvImage
              src={cctvImageUrl}
              alt={`${activeLabel} ${t('即時影像')}`}
              className="cctv-overlay-image clickable"
              referrerPolicy="no-referrer"
              title={t('點擊影像可放大檢視')}
              onClick={() => setCctvExpanded(true)}
              paused={cctvExpanded}
            />
            <span className="cctv-overlay-label">{t('點擊影像可放大檢視')}</span>
          </div>
        )}

        {cctvExpanded && activeTarget && cctvImageUrl && activeLabel && (
          <div className="cctv-modal-backdrop" onClick={() => setCctvExpanded(false)}>
            <div className="cctv-modal" onClick={(e) => e.stopPropagation()}>
              <div className="cctv-modal-header">
                <span className="cctv-modal-title">{activeLabel} — {t('CCTV 即時影像')}</span>
                <button
                  className="cctv-modal-close"
                  onClick={() => setCctvExpanded(false)}
                  title={t('關閉')}
                >
                  ✕
                </button>
              </div>
              <StreamingCctvImage
                src={cctvImageUrl}
                alt={`${activeLabel} ${t('即時影像（放大）')}`}
                className="cctv-modal-image"
                referrerPolicy="no-referrer"
                onClick={() => setCctvExpanded(false)}
              />
            </div>
          </div>
        )}

        {/* 動態號控 tab：路口號誌資訊小視窗（隨地圖 pan/zoom 浮動） */}
        {signalInfo && signalCardPos && (
          <SignalInfoCard
            signal={signalInfo}
            pixelX={signalCardPos.x}
            pixelY={signalCardPos.y}
            side={signalCardSide}
          />
        )}
      </div>

      <div className="right-panel">
        {isDangerTab ? (
          <>
            {dangerChecking ? (
              <div className="card">
                <div className="cctv-checking">
                  <div className="cctv-checking-spinner" />
                  <span>
                    {t('正在檢測危險路口 CCTV 連線...')} {dangerProgress.done}/{dangerProgress.total}
                  </span>
                  <div className="cctv-progress-bar">
                    <div
                      className="cctv-progress-fill"
                      style={{
                        width: dangerProgress.total
                          ? `${(dangerProgress.done / dangerProgress.total) * 100}%`
                          : '0%',
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : availableIntersections.length === 0 ? (
              <div className="card">
                <div className="cctv-checking">
                  <span>{t('目前沒有可用的危險路口 CCTV 即時影像')}</span>
                  <button
                    type="button"
                    className="btn"
                    onClick={handleRecheckIntersections}
                  >
                    {t('重新檢查')}
                  </button>
                </div>
              </div>
            ) : chartsIntersectionId ? (
              <DangerCharts intersectionId={chartsIntersectionId} />
            ) : null}

            <div className="card">
              <h3>{t('危險路口排名')}</h3>
              <ol className="rank-list">
                {dangerRankList.map(d => (
                  <li key={d.id}>
                    <button
                      type="button"
                      className={'rank-link' + (!d.available ? ' disabled' : '')}
                      disabled={!d.available}
                      onClick={() => d.available && handleSelectIntersection(d)}
                      title={d.available ? t('點擊切換到此路口') : t('CCTV 目前無法連線')}
                    >
                      {d.name}
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </>
        ) : (
          <>
            <div className="card incident-list-card">
              <h3>
                {activeTab === 'dynamicSignal'
                  ? t('動態號控列表')
                  : activeTab === 'priorityPass'
                    ? t('優先通行列表')
                    : t('即時事件通報列表')}
              </h3>

              {incidentChecking ? (
                <div className="cctv-checking">
                  <div className="cctv-checking-spinner" />
                  <span>
                    {t('正在檢測 CCTV 連線狀態...')} {incidentProgress.done}/{incidentProgress.total}
                  </span>
                  <div className="cctv-progress-bar">
                    <div
                      className="cctv-progress-fill"
                      style={{
                        width: incidentProgress.total
                          ? `${(incidentProgress.done / incidentProgress.total) * 100}%`
                          : '0%',
                      }}
                    />
                  </div>
                </div>
              ) : availableIncidents.length === 0 ? (
                <div className="cctv-checking">
                  <span>{t('目前沒有可用的 CCTV 即時影像')}</span>
                  <button
                    type="button"
                    className="btn"
                    onClick={handleRecheckIncidents}
                  >
                    {t('重新檢查')}
                  </button>
                </div>
              ) : activeTab === 'dynamicSignal' ? (
                /* 動態號控 tab：扁平清單，路口名為主視覺 */
                <div className="signal-list">
                  {flatIncidents.map((item) => {
                    const si = mockService.getSignalInfo(item.id)
                    const modeClass = si ? (si.mode === '離線' ? 'offline' : si.mode === '手動' ? 'manual' : 'auto') : 'auto'
                    const isActive = selectedIncident?.id === item.id
                    const isNavigated = navigatedIncident?.id === item.id
                    return (
                      <div
                        key={item.id}
                        className={
                          'signal-row' +
                          (isActive ? ' active' : '') +
                          (isNavigated ? ' navigated' : '')
                        }
                        onClick={() => handleNavigate(item)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleNavigate(item)
                          }
                        }}
                      >
                        <span className={`signal-row-accent ${modeClass}`} aria-hidden="true" />
                        <div className="signal-row-icon" aria-hidden="true">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="8" y="2" width="8" height="20" rx="2.5" />
                            <circle cx="12" cy="7" r="1.6" fill="currentColor" stroke="none" />
                            <circle cx="12" cy="12" r="1.6" />
                            <circle cx="12" cy="17" r="1.6" />
                            <path d="M8 7h-2M8 12h-2M16 7h2M16 17h2" />
                          </svg>
                        </div>
                        <span className="signal-row-location">{item.location}</span>
                        <span className="signal-row-time">{item.time}</span>
                        <button
                          type="button"
                          className="signal-row-nav"
                          title={t('導航至此路口')}
                          aria-label={t('導航至此路口')}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleNavigate(item)
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
                          </svg>
                        </button>
                      </div>
                    )
                  })}
                </div>
              ) : activeTab === 'priorityPass' ? (
                /* 優先通行 tab：扁平清單，只顯示 3 個路口名稱 */
                <div className="signal-list">
                  {priorityIncidents.map((item) => {
                    const isActive = selectedIncident?.id === item.id
                    const isNavigated = navigatedIncident?.id === item.id
                    return (
                      <div
                        key={item.id}
                        className={
                          'signal-row' +
                          (isActive ? ' active' : '') +
                          (isNavigated ? ' navigated' : '')
                        }
                        onClick={() => handleNavigate(item)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleNavigate(item)
                          }
                        }}
                      >
                        <span className="signal-row-accent auto" aria-hidden="true" />
                        <div className="signal-row-icon" aria-hidden="true">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 17h1l2-3h12l2 3h1" />
                            <path d="M3 17a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4z" />
                            <circle cx="7.5" cy="17" r="1.5" />
                            <circle cx="16.5" cy="17" r="1.5" />
                            <path d="M12 4v4M9.5 6h5" />
                          </svg>
                        </div>
                        <span className="signal-row-location">{item.location}</span>
                        <span className="signal-row-time">{item.time}</span>
                        <button
                          type="button"
                          className="signal-row-nav"
                          title={t('導航至此路口')}
                          aria-label={t('導航至此路口')}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleNavigate(item)
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
                          </svg>
                        </button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* 無號誌路口 tab：保留原本的狀態分組樣式 */
                <div className="incident-list">
                  {incidentGroups.map((group) => {
                    const className = STATUS_CLASSNAME[group.status]
                    return (
                      <div key={group.status}>
                        <div className={`incident-group-title ${className}`}>
                          {t(group.status)}
                        </div>
                        {group.items.map((item) => (
                          <div
                            key={item.id}
                            className={
                              'incident-card' +
                              (selectedIncident?.id === item.id ? ' active' : '') +
                              (navigatedIncident?.id === item.id ? ' navigated' : '')
                            }
                            onClick={() => handleNavigate(item)}
                          >
                            <div className="incident-icon">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 17h14M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h8l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2M7 19h2M15 19h2" />
                              </svg>
                            </div>
                            <div className="incident-info">
                              <span className="incident-type">{t(item.type)}</span>
                              <span className="incident-location">{item.location}</span>
                            </div>
                            <span className="incident-time">{item.time.replace(' ', ' ')}</span>
                            <button
                              className="incident-nav-btn"
                              title={t('導航至此路口')}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleNavigate(item)
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="card ai-card">
              <h3>{t('AI 決策輔助')}</h3>
              {selectedIncident && (
                <>
                  {lang === 'zh' ? (
                    <p>
                      偵測到 <strong>{selectedIncident.location}</strong> 發生 <strong>{selectedIncident.type}</strong>，
                      事件等級 <strong>{selectedIncident.severity}</strong>。
                    </p>
                  ) : (
                    <p>
                      Detected <strong>{t(selectedIncident.type)}</strong> at <strong>{selectedIncident.location}</strong>,
                      severity <strong>{t(selectedIncident.severity)}</strong>.
                    </p>
                  )}
                  <p>{t('建議操作：於附近 CMS 發布「前方路口發生事故，請減速通行」。')}</p>
                </>
              )}
              <div className="action-row">
                <button className="btn primary">{t('同意執行')}</button>
                <button className="btn">{t('前往事件反應管理')}</button>
                <button className="btn ghost">{t('忽略')}</button>
              </div>
            </div>

            {(activeTab === 'dynamicSignal' || activeTab === 'priorityPass') && (
              <>
                <div className="card kpi-card">
                  <div className="kpi-section-header">
                    <h3>{t('道路績效')}</h3>
                    <div className="kpi-update-row">
                      <span className="kpi-update-time">
                        {t('更新時間')}：{routeKpiUpdateTime}
                      </span>
                      <button
                        type="button"
                        className="kpi-refresh-btn"
                        onClick={handleRefreshRouteKpi}
                        title={t('重新整理')}
                        aria-label={t('重新整理')}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12a9 9 0 1 1-3.5-7.1" />
                          <polyline points="21 4 21 10 15 10" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="kpi-grid">
                    {routeKpi.map((k) => (
                      <div key={k.label} className="kpi-tile">
                        <div className="kpi-tile-head">
                          <span className="kpi-tile-label">{t(k.label)}</span>
                          <button
                            type="button"
                            className="kpi-tile-menu"
                            aria-label="menu"
                            tabIndex={-1}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <line x1="4" y1="7" x2="20" y2="7" />
                              <line x1="4" y1="12" x2="20" y2="12" />
                              <line x1="4" y1="17" x2="20" y2="17" />
                            </svg>
                          </button>
                        </div>
                        <span className="kpi-tile-sub">{t(k.sub)}</span>
                        <span className="kpi-tile-value">{k.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {strategyEffects.length > 0 && (
                <div className="card strategy-card">
                  <div className="kpi-section-header">
                    <h3>{t('上次策略成效量化評估')}</h3>
                  </div>
                  <div className="strategy-grid">
                    {strategyEffects.map((s) => {
                      // ZH: 路名直接黏指標；EN: 中間補空格保持可讀性
                      const labelTail = lang === 'zh' ? s.metric : ` ${t(s.metric)}`
                      const sign = s.improved ? '-' : '+'
                      const trendClass = s.improved ? 'improved' : 'worsened'
                      return (
                        <div key={`${s.road}-${s.metric}`} className="strategy-tile">
                          <span className="strategy-tile-label">
                            {s.road}{labelTail}
                          </span>
                          <span className={`strategy-tile-value ${trendClass}`}>
                            {sign}{s.value}%
                            <svg
                              className="strategy-tile-arrow"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              {s.improved ? (
                                <>
                                  <line x1="12" y1="5" x2="12" y2="19" />
                                  <polyline points="6 13 12 19 18 13" />
                                </>
                              ) : (
                                <>
                                  <line x1="12" y1="19" x2="12" y2="5" />
                                  <polyline points="6 11 12 5 18 11" />
                                </>
                              )}
                            </svg>
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                )}
              </>
            )}

            {activeTab === 'unsignalizedIntersection' && (
              <div className="card">
                <h3>{t('無號誌路口排名')}</h3>
                <ol className="rank-list">
                  {unsignalizedRankList.map(r => (
                    <li key={r.incidentId}>
                      <button
                        type="button"
                        className={'rank-link' + (!r.incident ? ' disabled' : '')}
                        disabled={!r.incident}
                        onClick={() => r.incident && handleNavigate(r.incident)}
                        title={r.incident ? t('點擊切換到此路口') : t('CCTV 目前無法連線')}
                      >
                        {r.name} - {r.score}
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
