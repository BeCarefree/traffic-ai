import { mockService } from '../service/mockService'

export default function CmsPage() {
  const cmsTemplates = mockService.getCmsTemplates()

  return (
    <section className="content-2col">
      <article className="card">
        <h2>資訊發布管理</h2>
        <p>CMS 文案模板與發布歷程（dummy）。</p>
        <div className="table-head large">
          <span>模板編號</span>
          <span>文案內容</span>
          <span>渠道</span>
          <span>最後使用</span>
        </div>
        {cmsTemplates.map((t) => (
          <div key={t.id} className="table-row large static-row">
            <span>{t.id}</span>
            <span>{t.title}</span>
            <span>{t.channel}</span>
            <span>{t.lastUsed}</span>
          </div>
        ))}
        <h3>文案預覽</h3>
        <div className="cms-preview">前方路口發生事故，請減速慢行並留意改道資訊。</div>
      </article>

      <article className="card">
        <h3>發布歷程</h3>
        <ul className="list">
          <li>10:11 發布至 CMS-03（安一路 / 西定路）</li>
          <li>10:03 發布至 CMS-07（孝三路 / 忠三路）</li>
          <li>09:58 發布至 CMS-02（信一路 / 義一路）</li>
        </ul>
        <img src={`${import.meta.env.BASE_URL}media/image15.jpeg`} alt="CMS 設備示意" className="preview" />
      </article>
    </section>
  )
}
