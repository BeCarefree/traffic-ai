import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { mockService } from './service/mockService'
import DashboardPage from './pages/Dashboard'
import DevicesPage from './pages/Devices'
import IncidentResponsePage from './pages/IncidentResponse'
import CmsPage from './pages/Cms'
import DataMonitorPage from './pages/DataMonitor'
import './index.css'

function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const sidebarItems = mockService.getSidebarItems()
  const deviceRates = mockService.getDeviceRates()

  const pathToPageKey = {
    '/': 'dashboard',
    '/dashboard': 'dashboard',
    '/devices': 'devices',
    '/incident-response': 'incidentResponse',
    '/cms': 'cms',
    '/data-monitor': 'dataMonitor',
  } as Record<string, string>

  const currentPage = pathToPageKey[location.pathname] || 'dashboard'

  const handleNavClick = (key: string) => {
    const pathMap = {
      dashboard: '/dashboard',
      devices: '/devices',
      incidentResponse: '/incident-response',
      cms: '/cms',
      dataMonitor: '/data-monitor',
    } as Record<string, string>
    navigate(pathMap[key])
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Traffic AI Ops</div>
        <nav>
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              className={item.key === currentPage ? 'nav-btn active' : 'nav-btn'}
              onClick={() => handleNavClick(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h1>交通控制決策輔助平台</h1>
          <div className="rate-strip">
            {deviceRates.map((item) => (
              <div key={item.name} className="rate-item">
                <span>{item.name}</span>
                <strong style={{ color: item.color }}>{item.rate}%</strong>
              </div>
            ))}
          </div>
        </header>

        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/incident-response" element={<IncidentResponsePage />} />
          <Route path="/cms" element={<CmsPage />} />
          <Route path="/data-monitor" element={<DataMonitorPage />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
