import { mockService } from '../service/mockService'
import { useLanguage } from '../i18n/languageContext'

export default function DevicesPage() {
  const { t } = useLanguage()
  const deviceRows = mockService.getDevices()

  return (
    <section className="card full">
      <h2>{t('設備管理')}</h2>
      <p>{t('本頁提供 20 筆以上 dummy 設備資料，涵蓋正常、異常與離線狀態。')}</p>
      <div className="table-head large">
        <span>{t('設備編號')}</span>
        <span>{t('設備名稱')}</span>
        <span>{t('位置')}</span>
        <span>{t('狀態')}</span>
        <span>{t('最後心跳')}</span>
      </div>
      {deviceRows.map((row) => (
        <div key={row.id} className="table-row large static-row">
          <span>{row.id}</span>
          <span>{row.name}</span>
          <span>{row.location}</span>
          <span
            className={`status ${
              row.status === '正常' ? 'ok' : row.status === '異常' ? 'warn' : 'danger'
            }`}
          >
            {t(row.status)}
          </span>
          <span>{row.heartbeat}</span>
        </div>
      ))}
    </section>
  )
}
