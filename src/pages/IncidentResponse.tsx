import { mockService } from '../service/mockService'

export default function IncidentResponsePage() {
  const responseTimeline = mockService.getResponseTimeline()

  return (
    <section className="content-2col">
      <article className="card">
        <h2>事件反應管理</h2>
        <p>顯示事件流程狀態與處理進度（dummy）。</p>
        <div className="table-head large">
          <span>事件編號</span>
          <span>事件類型</span>
          <span>路口</span>
          <span>狀態</span>
          <span>指派人員</span>
        </div>
        {Array.from({ length: 10 }).map((_, idx) => (
          <div key={`ir-${idx}`} className="table-row large static-row">
            <span>E-20260309-0{idx + 1}</span>
            <span>{idx % 2 ? '人車事故' : '壅塞事件'}</span>
            <span>{idx % 2 ? '安一路 / 西定路' : '忠一路 / 愛三路'}</span>
            <span>{idx % 3 === 0 ? '待處理' : idx % 3 === 1 ? '處理中' : '已結案'}</span>
            <span>{idx % 2 ? '值勤A' : '值勤B'}</span>
          </div>
        ))}
      </article>

      <article className="card">
        <h3>流程時間軸</h3>
        <ul className="timeline">
          {responseTimeline.map((item) => (
            <li key={item.step}>
              <strong>{item.step}</strong>
              <span>{item.owner}</span>
              <span>{item.time}</span>
              <span>{item.state}</span>
            </li>
          ))}
        </ul>
        <img src="/media/image10.jpeg" alt="事故偵測示意" className="preview" />
      </article>
    </section>
  )
}
