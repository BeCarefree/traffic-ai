import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { DangerIntersection, DashboardTab, IncidentItem } from '../service/mockService'
import { mockService } from '../service/mockService'
import { DangerCharts } from '../components/DangerCharts'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  '處理中': { label: '處理中', className: 'processing' },
  '已解除': { label: '已解除', className: 'resolved' },
  '新事件': { label: '新事件', className: 'new' },
}

const STATUS_ORDER: IncidentItem['status'][] = ['處理中', '已解除', '新事件']

const KEELUNG_CENTER: [number, number] = [25.1280, 121.7415]
const DEFAULT_ZOOM = 16
const CCTV_CHECK_TIMEOUT = 8000

/** 檢測單一 CCTV 影像是否可載入 */
function checkCctvImage(hexId: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.referrerPolicy = 'no-referrer'

    const timer = setTimeout(() => {
      img.onload = null
      img.onerror = null
      img.src = ''
      resolve(false)
    }, CCTV_CHECK_TIMEOUT)

    img.onload = () => {
      clearTimeout(timer)
      resolve(true)
    }
    img.onerror = () => {
      clearTimeout(timer)
      resolve(false)
    }

    img.src = `https://cctv.klcg.gov.tw/${hexId}`
  })
}

type ActiveTarget =
  | { kind: 'incident'; item: IncidentItem }
  | { kind: 'intersection'; item: DangerIntersection }

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('dangerIntersection')
  const allIncidents = mockService.getIncidents()
  const allDangerIntersections = mockService.getDangerIntersections()

  const isDangerTab = activeTab === 'dangerIntersection'

  // CCTV availability (run both probes in parallel on mount)
  const [incidentChecking, setIncidentChecking] = useState(true)
  const [availableIncidents, setAvailableIncidents] = useState<IncidentItem[]>([])
  const [dangerChecking, setDangerChecking] = useState(true)
  const [availableIntersections, setAvailableIntersections] = useState<DangerIntersection[]>([])

  // Selections per flow
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null)
  const [navigatedIncident, setNavigatedIncident] = useState<IncidentItem | null>(null)
  const [selectedIntersection, setSelectedIntersection] = useState<DangerIntersection | null>(null)

  const [cctvExpanded, setCctvExpanded] = useState(false)

  const dashboardTabs = mockService.getDashboardTabs()

  // Leaflet map refs
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.LayerGroup | null>(null)
  const activeMarkerRef = useRef<L.Marker | null>(null)
  const handleNavigateRef = useRef<(incident: IncidentItem) => void>(() => {})
  const handleSelectIntersectionRef = useRef<(i: DangerIntersection) => void>(() => {})

  // 即時事件依狀態分組（非危險路口 tab 使用）
  const incidentGroups = useMemo(() => {
    return STATUS_ORDER
      .map(status => ({
        status,
        items: availableIncidents.filter(i => i.status === status),
      }))
      .filter(group => group.items.length > 0)
  }, [availableIncidents])

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

  const activeLabel = activeTarget
    ? activeTarget.kind === 'incident'
      ? activeTarget.item.location
      : activeTarget.item.name
    : null

  const cctvImageUrl = activeTarget
    ? `https://cctv.klcg.gov.tw/${activeTarget.item.cctvHexId}`
    : null

  // Step 1a: Check incident CCTVs on mount
  useEffect(() => {
    let cancelled = false
    async function checkAll() {
      const results = await Promise.allSettled(
        allIncidents.map(i => checkCctvImage(i.cctvHexId)),
      )
      if (cancelled) return
      const available = allIncidents.filter((_, idx) => {
        const r = results[idx]
        return r.status === 'fulfilled' && r.value === true
      })
      setAvailableIncidents(available)
      setIncidentChecking(false)
    }
    checkAll()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Step 1b: Check danger-intersection CCTVs on mount
  useEffect(() => {
    let cancelled = false
    async function checkAll() {
      const results = await Promise.allSettled(
        allDangerIntersections.map(d => checkCctvImage(d.cctvHexId)),
      )
      if (cancelled) return
      const available = allDangerIntersections.filter((_, idx) => {
        const r = results[idx]
        return r.status === 'fulfilled' && r.value === true
      })
      setAvailableIntersections(available)
      setDangerChecking(false)
    }
    checkAll()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          .bindTooltip(`${d.name}（排名 #${d.rank}）`, {
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

      availableIncidents.forEach((incident) => {
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

      if (availableIncidents.length > 0 && !navigatedIncident) {
        setTimeout(() => {
          handleNavigateRef.current(availableIncidents[0])
        }, 300)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDangerTab, availableIntersections, dangerChecking, availableIncidents, incidentChecking])

  // Step 4: Fly to active target + render pulse marker
  useEffect(() => {
    if (!mapRef.current) return

    if (activeMarkerRef.current) {
      activeMarkerRef.current.remove()
      activeMarkerRef.current = null
    }

    if (!activeTarget) return

    const { lat, lng } = activeTarget.item
    const label = activeTarget.kind === 'incident'
      ? activeTarget.item.location
      : activeTarget.item.name

    mapRef.current.flyTo([lat, lng], 18, { duration: 0.8 })

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
      .bindTooltip(label, {
        permanent: true,
        direction: 'top',
        offset: [0, -20],
        className: 'map-tooltip active-tooltip',
      })
      .addTo(mapRef.current)

    activeMarkerRef.current = activeMarker
  }, [activeTarget])

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

  return (
    <section className="page-grid">
      <div className="tabs">
        {dashboardTabs.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
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
                title="關閉"
              >
                ✕
              </button>
            </div>
            <img
              src={cctvImageUrl}
              alt={`${activeLabel} 即時影像`}
              className="cctv-overlay-image clickable"
              referrerPolicy="no-referrer"
              title="點擊影像可放大檢視"
              onClick={() => setCctvExpanded(true)}
              onError={(e) => {
                const img = e.currentTarget
                img.onerror = null
                img.src = 'https://tw.live/assets/maintenance.jpg'
              }}
            />
            <span className="cctv-overlay-label">點擊影像可放大檢視</span>
          </div>
        )}

        {cctvExpanded && activeTarget && cctvImageUrl && activeLabel && (
          <div className="cctv-modal-backdrop" onClick={() => setCctvExpanded(false)}>
            <div className="cctv-modal" onClick={(e) => e.stopPropagation()}>
              <div className="cctv-modal-header">
                <span className="cctv-modal-title">{activeLabel} — CCTV 即時影像</span>
                <button
                  className="cctv-modal-close"
                  onClick={() => setCctvExpanded(false)}
                  title="關閉"
                >
                  ✕
                </button>
              </div>
              <img
                src={cctvImageUrl}
                alt={`${activeLabel} 即時影像（放大）`}
                className="cctv-modal-image"
                referrerPolicy="no-referrer"
                onClick={() => setCctvExpanded(false)}
                onError={(e) => {
                  const img = e.currentTarget
                  img.onerror = null
                  img.src = 'https://tw.live/assets/maintenance.jpg'
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="right-panel">
        {isDangerTab ? (
          <>
            {dangerChecking ? (
              <div className="card">
                <div className="cctv-checking">
                  <div className="cctv-checking-spinner" />
                  <span>正在檢測危險路口 CCTV 連線...</span>
                </div>
              </div>
            ) : availableIntersections.length === 0 ? (
              <div className="card">
                <div className="cctv-checking">
                  <span>目前沒有可用的危險路口 CCTV 即時影像</span>
                </div>
              </div>
            ) : chartsIntersectionId ? (
              <DangerCharts intersectionId={chartsIntersectionId} />
            ) : null}

            <div className="card">
              <h3>危險路口排名</h3>
              <ol className="rank-list">
                {dangerRankList.map(d => (
                  <li key={d.id}>
                    <button
                      type="button"
                      className={'rank-link' + (!d.available ? ' disabled' : '')}
                      disabled={!d.available}
                      onClick={() => d.available && handleSelectIntersection(d)}
                      title={d.available ? '點擊切換到此路口' : 'CCTV 目前無法連線'}
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
              <h3>即時事件通報列表</h3>

              {incidentChecking ? (
                <div className="cctv-checking">
                  <div className="cctv-checking-spinner" />
                  <span>正在檢測 CCTV 連線狀態...</span>
                </div>
              ) : availableIncidents.length === 0 ? (
                <div className="cctv-checking">
                  <span>目前沒有可用的 CCTV 即時影像</span>
                </div>
              ) : (
                <div className="incident-list">
                  {incidentGroups.map((group) => {
                    const meta = STATUS_LABEL[group.status]
                    return (
                      <div key={group.status}>
                        <div className={`incident-group-title ${meta.className}`}>
                          {meta.label}
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
                              <span className="incident-type">{item.type}</span>
                              <span className="incident-location">{item.location}</span>
                            </div>
                            <span className="incident-time">{item.time.replace(' ', ' ')}</span>
                            <button
                              className="incident-nav-btn"
                              title="導航至此路口"
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
              <h3>AI 決策輔助</h3>
              {selectedIncident && (
                <>
                  <p>
                    偵測到 <strong>{selectedIncident.location}</strong> 發生 <strong>{selectedIncident.type}</strong>，
                    事件等級 <strong>{selectedIncident.severity}</strong>。
                  </p>
                  <p>建議操作：於附近 CMS 發布「前方路口發生事故，請減速通行」。</p>
                </>
              )}
              <div className="action-row">
                <button className="btn primary">同意執行</button>
                <button className="btn">前往事件反應管理</button>
                <button className="btn ghost">忽略</button>
              </div>
            </div>

            <div className="card">
              <h3>{activeTab === 'unsignalizedIntersection' ? '無號誌路口排名' : '危險路口排名'}</h3>
              <ol className="rank-list">
                <li>安一路 / 西定路 - 3</li>
                <li>中正路 / 信一路 - 2</li>
                <li>忠一路 / 孝二路 - 2</li>
                <li>信二路 / 義四路 - 1</li>
              </ol>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
