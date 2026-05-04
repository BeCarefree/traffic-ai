import { mockService } from '../service/mockService'
import { useLanguage } from '../i18n/languageContext'

export default function IncidentResponsePage() {
  const { t } = useLanguage()
  const responseTimeline = mockService.getResponseTimeline()

  return (
    <section className="content-2col">
      <article className="card">
        <h2>{t('事件反應管理')}</h2>
        <p>{t('顯示事件流程狀態與處理進度（dummy）。')}</p>
        <div className="table-head large">
          <span>{t('事件編號')}</span>
          <span>{t('事件類型')}</span>
          <span>{t('路口')}</span>
          <span>{t('狀態')}</span>
          <span>{t('指派人員')}</span>
        </div>
        {Array.from({ length: 10 }).map((_, idx) => {
          const type = idx % 2 ? '人車事故' : '壅塞事件'
          // 路口名字保留中文
          const intersection = idx % 2 ? '安一路 / 西定路' : '忠一路 / 愛三路'
          const status = idx % 3 === 0 ? '待處理' : idx % 3 === 1 ? '處理中' : '已結案'
          const assignee = idx % 2 ? '值勤A' : '值勤B'
          return (
            <div key={`ir-${idx}`} className="table-row large static-row">
              <span>E-20260309-0{idx + 1}</span>
              <span>{t(type)}</span>
              <span>{intersection}</span>
              <span>{t(status)}</span>
              <span>{t(assignee)}</span>
            </div>
          )
        })}
      </article>

      <article className="card">
        <h3>{t('流程時間軸')}</h3>
        <ul className="timeline">
          {responseTimeline.map((item) => (
            <li key={item.step}>
              <strong>{t(item.step)}</strong>
              <span>{t(item.owner)}</span>
              <span>{item.time}</span>
              <span>{t(item.state)}</span>
            </li>
          ))}
        </ul>
        <img src={`${import.meta.env.BASE_URL}media/image10.jpeg`} alt={t('事故偵測示意')} className="preview" />
      </article>
    </section>
  )
}
