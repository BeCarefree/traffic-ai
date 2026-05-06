import { mockService } from '../service/mockService'
import { useLanguage } from '../i18n/languageContext'

// 路口名字（保留中文，不翻譯）
const PUBLISH_HISTORY = [
  { time: '10:11', cms: 'CMS-03', intersection: '安一路 / 西定路' },
  { time: '10:03', cms: 'CMS-07', intersection: '孝三路 / 忠三路' },
  { time: '09:58', cms: 'CMS-02', intersection: '信一路 / 義一路' },
]

export default function CmsPage() {
  const { t } = useLanguage()
  const cmsTemplates = mockService.getCmsTemplates()

  return (
    <section className="content-2col">
      <article className="card">
        <h2>{t('資訊發布管理')}</h2>
        <p>{t('CMS 文案模板與發布歷程（dummy）。')}</p>
        <div className="table-head large">
          <span>{t('模板編號')}</span>
          <span>{t('文案內容')}</span>
          <span>{t('渠道')}</span>
          <span>{t('最後使用')}</span>
        </div>
        {cmsTemplates.map((tpl) => (
          <div key={tpl.id} className="table-row large static-row">
            <span>{tpl.id}</span>
            <span>{t(tpl.title)}</span>
            <span>{tpl.channel}</span>
            <span>{tpl.lastUsed}</span>
          </div>
        ))}
        <h3>{t('文案預覽')}</h3>
        <div className="cms-preview">{t('前方路口發生事故，請減速慢行並留意改道資訊。')}</div>
      </article>

      <article className="card">
        <h3>{t('發布歷程')}</h3>
        <ul className="list">
          {PUBLISH_HISTORY.map((h) => (
            <li key={h.cms}>
              {h.time} {t('發布至')} {h.cms}（{h.intersection}）
            </li>
          ))}
        </ul>
      </article>
    </section>
  )
}
