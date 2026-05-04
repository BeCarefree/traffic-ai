import { mockService } from '../service/mockService'
import { useLanguage } from '../i18n/languageContext'

const ALERT_KEYS = [
  '10:12 Google Maps API 延遲超過閾值（120s）',
  '09:47 TC 動態資料暫時抖動（已恢復）',
  '09:31 CCTV-06 影像串流中斷（處理中）',
] as const

export default function DataMonitorPage() {
  const { t } = useLanguage()
  const dataSources = mockService.getDataSources()

  return (
    <section className="content-2col">
      <article className="card">
        <h2>{t('資料監控')}</h2>
        <p>{t('資料來源連線狀態、更新延遲與錯誤示意（dummy）。')}</p>
        <div className="table-head large">
          <span>{t('資料來源')}</span>
          <span>{t('更新頻率')}</span>
          <span>{t('延遲')}</span>
          <span>{t('狀態')}</span>
        </div>
        {dataSources.map((d) => (
          <div key={d.source} className="table-row large static-row">
            <span>{t(d.source)}</span>
            <span>{t(d.update)}</span>
            <span>{d.lag}</span>
            <span
              className={`status ${
                d.status === '正常' ? 'ok' : d.status === '警告' ? 'warn' : 'danger'
              }`}
            >
              {t(d.status)}
            </span>
          </div>
        ))}
      </article>

      <article className="card">
        <h3>{t('錯誤與告警')}</h3>
        <ul className="list">
          {ALERT_KEYS.map((line) => {
            const [time, ...rest] = line.split(' ')
            const body = rest.join(' ')
            return (
              <li key={line}>
                {time} {t(body)}
              </li>
            )
          })}
        </ul>
        <img src={`${import.meta.env.BASE_URL}media/image11.png`} alt={t('AI 事故分析示意')} className="preview" />
      </article>
    </section>
  )
}
