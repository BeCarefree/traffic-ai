import { mockService } from '../service/mockService'

export default function DataMonitorPage() {
  const dataSources = mockService.getDataSources()

  return (
    <section className="content-2col">
      <article className="card">
        <h2>資料監控</h2>
        <p>資料來源連線狀態、更新延遲與錯誤示意（dummy）。</p>
        <div className="table-head large">
          <span>資料來源</span>
          <span>更新頻率</span>
          <span>延遲</span>
          <span>狀態</span>
        </div>
        {dataSources.map((d) => (
          <div key={d.source} className="table-row large static-row">
            <span>{d.source}</span>
            <span>{d.update}</span>
            <span>{d.lag}</span>
            <span
              className={`status ${
                d.status === '正常' ? 'ok' : d.status === '警告' ? 'warn' : 'danger'
              }`}
            >
              {d.status}
            </span>
          </div>
        ))}
      </article>

      <article className="card">
        <h3>錯誤與告警</h3>
        <ul className="list">
          <li>10:12 Google Maps API 延遲超過閾值（120s）</li>
          <li>09:47 TC 動態資料暫時抖動（已恢復）</li>
          <li>09:31 CCTV-06 影像串流中斷（處理中）</li>
        </ul>
        <img src={`${import.meta.env.BASE_URL}media/image11.png`} alt="AI 事故分析示意" className="preview" />
      </article>
    </section>
  )
}
