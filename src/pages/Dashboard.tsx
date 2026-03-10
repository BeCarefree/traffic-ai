import { useMemo, useState } from 'react'
import type { DashboardTab, IncidentItem } from '../service/mockService'
import { mockService } from '../service/mockService'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('dangerIntersection')
  const incidents = mockService.getIncidents()
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem>(incidents[0])

  const dashboardTabs = mockService.getDashboardTabs()
  const deviceRates = mockService.getDeviceRates()
  const routeKpi = mockService.getRouteKpi()

  const mapImage = useMemo(() => mockService.getMapImage(activeTab), [activeTab])

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

      <div className="left-panel card">
        <label htmlFor="roadSearch">路段搜尋</label>
        <input id="roadSearch" placeholder="請輸入道路關鍵字" defaultValue="安一路" />
        <h3>路口清單</h3>
        <ul className="list">
          <li className="highlight">安一路 / 西定路（事故中）</li>
          <li>孝三路 / 忠三路</li>
          <li>信一路 / 義一路</li>
          <li>中華路 / 復旦路</li>
        </ul>
        <h3>即時影像</h3>
        <img src={`${import.meta.env.BASE_URL}media/image6.png`} alt="即時影像示意" className="preview" />
      </div>

      <div className="map-panel card">
        <div className="chip-row">
          <span className="chip">VC</span>
          <span className="chip">CMS</span>
          <span className="chip">CCTV</span>
          <span className="chip">VD</span>
          <span className="chip">事件</span>
        </div>
        <img src={mapImage} alt="地圖監控畫面" className="map-image" />
        <div className="kpi-row">
          {routeKpi.map((kpi) => (
            <article key={kpi.label} className="kpi-card">
              <p>{kpi.label}</p>
              <strong>{kpi.value}</strong>
              <small>{kpi.sub}</small>
            </article>
          ))}
        </div>
      </div>

      <div className="right-panel">
        <div className="card">
          <h3>即時事件通報列表</h3>
          <div className="table-head">
            <span>時間</span>
            <span>事件</span>
            <span>狀態</span>
          </div>
          {incidents.map((row) => (
            <button
              key={row.id}
              className={selectedIncident?.id === row.id ? 'table-row active' : 'table-row'}
              onClick={() => setSelectedIncident(row)}
            >
              <span>{row.time.slice(11)}</span>
              <span>{row.type}</span>
              <span>{row.status}</span>
            </button>
          ))}
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
            <li>中華路 / 復旦路 - 2</li>
            <li>孝三路 / 忠三路 - 2</li>
            <li>信一路 / 義一路 - 1</li>
          </ol>
        </div>
      </div>

      <header className="topbar-overlay">
        <div className="rate-strip">
          {deviceRates.map((item) => (
            <div key={item.name} className="rate-item">
              <span>{item.name}</span>
              <strong style={{ color: item.color }}>{item.rate}%</strong>
            </div>
          ))}
        </div>
      </header>
    </section>
  )
}
