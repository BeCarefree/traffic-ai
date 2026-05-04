import { useMemo, useState } from 'react'
import type {
  ChartRange,
  PedestrianViolationPoint,
  RightTurnCountPoint,
  RightTurnSpeedPoint,
} from '../service/mockService'
import { mockService } from '../service/mockService'
import { useLanguage } from '../i18n/languageContext'

const RANGES: { key: ChartRange; label: string }[] = [
  { key: '12h', label: '近12小時' },
  { key: '24h', label: '近24小時' },
  { key: '7d', label: '近7天' },
]

// SVG chart box (scaled via viewBox)
const CW = 400
const CH = 200
const M = { top: 24, right: 36, bottom: 30, left: 40 }
const PW = CW - M.left - M.right
const PH = CH - M.top - M.bottom
const TICKS = 4

function niceMax(max: number): number {
  if (max <= 0) return 1
  const log = Math.floor(Math.log10(max))
  const unit = Math.pow(10, log)
  const n = max / unit
  const rounded = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10
  return rounded * unit
}

type RankTier = 'top' | 'mid' | 'low'

// 依值大小分三階：前 20% top、再 30% mid、剩下 50% low
function valueRankTiers(values: number[]): RankTier[] {
  const n = values.length
  const tiers = new Array<RankTier>(n).fill('low')
  if (n === 0) return tiers
  const sorted = values.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v)
  const topCount = Math.max(1, Math.round(n * 0.2))
  const midEnd = topCount + Math.max(1, Math.round(n * 0.3))
  sorted.forEach(({ i }, rank) => {
    tiers[i] = rank < topCount ? 'top' : rank < midEnd ? 'mid' : 'low'
  })
  return tiers
}

type ChartCardProps = {
  title: string
  range: ChartRange
  onRangeChange: (range: ChartRange) => void
  children: React.ReactNode
}

function ChartCard({ title, range, onRangeChange, children }: ChartCardProps) {
  const { t } = useLanguage()
  return (
    <div className="card chart-card">
      <div className="chart-header">
        <h4 className="chart-title">{title}</h4>
        <div className="chart-range-tabs">
          {RANGES.map((r) => (
            <button
              key={r.key}
              className={'chart-range-tab' + (range === r.key ? ' active' : '')}
              onClick={() => onRangeChange(r.key)}
            >
              {t(r.label)}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-body">{children}</div>
    </div>
  )
}

// 12px 字寬估算：ASCII ~7.2px、CJK ~13px
const CHAR_W_ASCII = 7.2
const CHAR_W_CJK = 13
const LABEL_PAD_X = 7
const LABEL_PAD_Y = 4
const LABEL_LINE_H = 14
const X_LABEL_GAP = 8 // 相鄰 X 軸標籤的最小間隔

function estimateTextWidth(text: string): number {
  let w = 0
  for (const ch of text) {
    w += /[一-鿿]/.test(ch) ? CHAR_W_CJK : CHAR_W_ASCII
  }
  return w
}

// X-axis label decimator: 依實際字寬決定要顯示哪幾個索引（避免重疊）。
// 寬標籤（如 "06:00"）會自動稀疏化；窄標籤（如 "00"）則盡量全顯示。
function pickXLabelIndices(labels: string[], availableWidth: number): Set<number> {
  const total = labels.length
  if (total === 0) return new Set()
  const maxLabelW = Math.max(...labels.map(estimateTextWidth))
  const slot = maxLabelW + X_LABEL_GAP
  const capacity = Math.max(2, Math.floor(availableWidth / slot))
  if (total <= capacity) return new Set(labels.map((_, i) => i))
  const every = Math.ceil(total / capacity)
  const result = new Set<number>()
  for (let i = 0; i < total; i += every) result.add(i)
  result.add(total - 1) // 永遠保留最後一筆
  return result
}

type HoverLabelLine = { text: string; color: string }

function HoverLabel({
  x,
  y,
  lines,
}: {
  x: number
  y: number
  lines: HoverLabelLine[]
}) {
  const maxLineW = Math.max(...lines.map((l) => estimateTextWidth(l.text)))
  const w = Math.max(maxLineW + LABEL_PAD_X * 2, 24)
  const h = LABEL_LINE_H * lines.length + LABEL_PAD_Y * 2
  // 防止超出 viewBox 左右邊界
  const minX = w / 2 + 2
  const maxX = CW - w / 2 - 2
  const cx = Math.min(Math.max(x, minX), maxX)
  // 上方放不下時往下擺（避免被 viewBox 切掉）
  const above = y - h - 2 >= 0
  const rectY = above ? y - h - 2 : y + 2

  return (
    <g pointerEvents="none">
      <rect
        x={cx - w / 2}
        y={rectY}
        width={w}
        height={h}
        rx={3}
        className="chart-hover-label-bg"
      />
      {lines.map((l, i) => (
        <text
          key={i}
          x={cx}
          y={rectY + LABEL_PAD_Y + LABEL_LINE_H * (i + 1) - 3}
          textAnchor="middle"
          className="chart-hover-label-text"
          fill={l.color}
        >
          {l.text}
        </text>
      ))}
    </g>
  )
}

// -----------------------------------------------------------------------------
// Chart 1: Right-turn count — bar chart
// -----------------------------------------------------------------------------
function BarChart({
  data,
  unit,
  baseColor,
  accentColor,
  highlightColor,
}: {
  data: RightTurnCountPoint[]
  unit: string
  baseColor: string
  accentColor: string
  highlightColor: string
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const rawMax = Math.max(...data.map((d) => d.value), 1)
  const max = niceMax(rawMax)
  const bandWidth = PW / data.length
  const barWidth = Math.max(4, bandWidth * 0.55)

  const tiers = useMemo(() => valueRankTiers(data.map((d) => d.value)), [data])
  const colorAt = (i: number) =>
    tiers[i] === 'top' ? highlightColor : tiers[i] === 'mid' ? accentColor : baseColor
  const shownXLabels = useMemo(
    () => pickXLabelIndices(data.map((d) => d.label), PW),
    [data],
  )

  return (
    <svg viewBox={`0 0 ${CW} ${CH}`} className="chart-svg" preserveAspectRatio="xMidYMid meet">
      <text x={6} y={M.top - 8} className="chart-axis-unit">{unit}</text>

      {Array.from({ length: TICKS + 1 }).map((_, i) => {
        const y = M.top + (PH * i) / TICKS
        const val = Math.round((max * (TICKS - i)) / TICKS)
        return (
          <g key={i}>
            <line x1={M.left} x2={CW - M.right} y1={y} y2={y} className="chart-grid" />
            <text x={M.left - 6} y={y + 3} textAnchor="end" className="chart-axis-label">
              {val}
            </text>
          </g>
        )
      })}

      {data.map((d, i) => {
        const bx = M.left + bandWidth * i + (bandWidth - barWidth) / 2
        const bh = (d.value / max) * PH
        const by = M.top + PH - bh
        const fill = colorAt(i)
        const showX = shownXLabels.has(i)

        return (
          <g key={i}>
            <rect x={bx} y={by} width={barWidth} height={bh} fill={fill} rx={2} />
            {showX && (
              <text
                x={bx + barWidth / 2}
                y={M.top + PH + 16}
                textAnchor="middle"
                className="chart-axis-label"
              >
                {d.label}
              </text>
            )}
          </g>
        )
      })}

      {data.map((_, i) => (
        <rect
          key={`hit-${i}`}
          x={M.left + bandWidth * i}
          y={M.top}
          width={bandWidth}
          height={PH}
          className="chart-hover-hit"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        />
      ))}

      {hovered !== null && (() => {
        const d = data[hovered]
        const bh = (d.value / max) * PH
        const by = M.top + PH - bh
        const cx = M.left + bandWidth * hovered + bandWidth / 2
        return (
          <HoverLabel
            x={cx}
            y={by}
            lines={[{ text: String(d.value), color: colorAt(hovered) }]}
          />
        )
      })()}
    </svg>
  )
}

// -----------------------------------------------------------------------------
// Chart 2: Speed (bar) + deceleration ratio (line) — combo chart, dual y-axis
// -----------------------------------------------------------------------------
function ComboChart({ data }: { data: RightTurnSpeedPoint[] }) {
  const { t } = useLanguage()
  const [hovered, setHovered] = useState<number | null>(null)
  const rawSpeedMax = Math.max(...data.map((d) => d.speed), 1)
  const speedMax = niceMax(rawSpeedMax)
  const ratioMax = 100
  const bandWidth = PW / data.length
  const barWidth = Math.max(4, bandWidth * 0.55)

  const baseGreen = '#d1d5db'
  const accentGreen = '#86efac'
  const highlightGreen = '#22c55e'
  const lineGreen = '#15803d'

  const speedTiers = useMemo(() => valueRankTiers(data.map((d) => d.speed)), [data])
  const speedColorAt = (i: number) =>
    speedTiers[i] === 'top' ? highlightGreen : speedTiers[i] === 'mid' ? accentGreen : baseGreen
  const shownXLabels = useMemo(
    () => pickXLabelIndices(data.map((d) => d.label), PW),
    [data],
  )

  const linePoints = data.map((d, i) => ({
    x: M.left + bandWidth * i + bandWidth / 2,
    y: M.top + PH - (d.ratio / ratioMax) * PH,
    d,
    i,
  }))
  const linePath = linePoints
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ')

  // 動態定位第二組圖例（避免英文較長時與第一組標籤重疊）
  const legendCircleX = 13 + estimateTextWidth(t('車輛速度')) + 12

  return (
    <svg viewBox={`0 0 ${CW} ${CH}`} className="chart-svg" preserveAspectRatio="xMidYMid meet">
      <text x={6} y={M.top - 8} className="chart-axis-unit">m/s</text>
      <text x={CW - 2} y={M.top - 8} textAnchor="end" className="chart-axis-unit">100%</text>

      {/* legend */}
      <g className="chart-legend" transform={`translate(${M.left + 8}, ${M.top - 14})`}>
        <rect x={0} y={-6} width={9} height={9} fill={baseGreen} rx={1.5} />
        <text x={13} y={2} className="chart-legend-text">{t('車輛速度')}</text>
        <circle cx={legendCircleX} cy={-1.5} r={3.5} fill={lineGreen} />
        <text x={legendCircleX + 8} y={2} className="chart-legend-text">{t('減速比例')}</text>
      </g>

      {Array.from({ length: TICKS + 1 }).map((_, i) => {
        const y = M.top + (PH * i) / TICKS
        const lVal = Math.round((speedMax * (TICKS - i)) / TICKS)
        const rVal = Math.round((ratioMax * (TICKS - i)) / TICKS)
        return (
          <g key={i}>
            <line x1={M.left} x2={CW - M.right} y1={y} y2={y} className="chart-grid" />
            <text x={M.left - 6} y={y + 3} textAnchor="end" className="chart-axis-label">
              {lVal}
            </text>
            <text x={CW - M.right + 6} y={y + 3} textAnchor="start" className="chart-axis-label">
              {rVal}%
            </text>
          </g>
        )
      })}

      {data.map((d, i) => {
        const bx = M.left + bandWidth * i + (bandWidth - barWidth) / 2
        const bh = (d.speed / speedMax) * PH
        const by = M.top + PH - bh
        const fill = speedColorAt(i)
        const showX = shownXLabels.has(i)
        return (
          <g key={i}>
            <rect x={bx} y={by} width={barWidth} height={bh} fill={fill} rx={2} />
            {showX && (
              <text
                x={bx + barWidth / 2}
                y={M.top + PH + 16}
                textAnchor="middle"
                className="chart-axis-label"
              >
                {d.label}
              </text>
            )}
          </g>
        )
      })}

      <path d={linePath} className="chart-line" stroke={lineGreen} />
      {linePoints.map((p) => (
        <circle
          key={p.i}
          cx={p.x}
          cy={p.y}
          r={hovered === p.i ? 5 : p.d.highlight ? 4 : 2.5}
          fill={lineGreen}
        />
      ))}

      {data.map((_, i) => (
        <rect
          key={`hit-${i}`}
          x={M.left + bandWidth * i}
          y={M.top}
          width={bandWidth}
          height={PH}
          className="chart-hover-hit"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        />
      ))}

      {hovered !== null && (() => {
        const d = data[hovered]
        const cx = M.left + bandWidth * hovered + bandWidth / 2
        const barTopY = M.top + PH - (d.speed / speedMax) * PH
        const lineY = M.top + PH - (d.ratio / ratioMax) * PH
        // 把 tooltip 擺在兩者上緣較高（y 較小）的位置之上，確保不會擋到任一視覺元素
        const anchorY = Math.min(barTopY, lineY)
        return (
          <HoverLabel
            x={cx}
            y={anchorY}
            lines={[
              { text: `${t('速度')} ${d.speed}`, color: highlightGreen },
              { text: `${t('減速')} ${d.ratio}%`, color: lineGreen },
            ]}
          />
        )
      })()}
    </svg>
  )
}

// -----------------------------------------------------------------------------
// Chart 3: Pedestrian violations — line chart with filled area
// -----------------------------------------------------------------------------
function LineChart({
  data,
  unit,
}: {
  data: PedestrianViolationPoint[]
  unit: string
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const rawMax = Math.max(...data.map((d) => d.value), 1)
  const max = niceMax(Math.max(rawMax, 4))
  const bandWidth = PW / data.length

  const lineColor = '#eab308'
  const areaColor = 'rgba(234, 179, 8, 0.18)'

  const shownXLabels = useMemo(
    () => pickXLabelIndices(data.map((d) => d.label), PW),
    [data],
  )

  const points = data.map((d, i) => ({
    x: M.left + bandWidth * i + bandWidth / 2,
    y: M.top + PH - (d.value / max) * PH,
    d,
    i,
  }))
  const linePath = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ')
  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x} ${M.top + PH}` +
    ` L ${points[0].x} ${M.top + PH} Z`

  return (
    <svg viewBox={`0 0 ${CW} ${CH}`} className="chart-svg" preserveAspectRatio="xMidYMid meet">
      <text x={6} y={M.top - 8} className="chart-axis-unit">{unit}</text>

      {Array.from({ length: TICKS + 1 }).map((_, i) => {
        const y = M.top + (PH * i) / TICKS
        const val = Math.round((max * (TICKS - i)) / TICKS)
        return (
          <g key={i}>
            <line x1={M.left} x2={CW - M.right} y1={y} y2={y} className="chart-grid" />
            <text x={M.left - 6} y={y + 3} textAnchor="end" className="chart-axis-label">
              {val}
            </text>
          </g>
        )
      })}

      <path d={areaPath} fill={areaColor} />
      <path d={linePath} className="chart-line" stroke={lineColor} />
      {points.map((p) => (
        <circle
          key={p.i}
          cx={p.x}
          cy={p.y}
          r={hovered === p.i ? 5 : p.d.highlight ? 4 : 2.5}
          fill={lineColor}
        />
      ))}

      {data.map((d, i) => {
        const bx = M.left + bandWidth * i + bandWidth / 2
        const show = shownXLabels.has(i)
        if (!show) return null
        return (
          <text
            key={i}
            x={bx}
            y={M.top + PH + 16}
            textAnchor="middle"
            className="chart-axis-label"
          >
            {d.label}
          </text>
        )
      })}

      {data.map((_, i) => (
        <rect
          key={`hit-${i}`}
          x={M.left + bandWidth * i}
          y={M.top}
          width={bandWidth}
          height={PH}
          className="chart-hover-hit"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        />
      ))}

      {hovered !== null && (
        <HoverLabel
          x={points[hovered].x}
          y={points[hovered].y}
          lines={[{ text: String(points[hovered].d.value), color: lineColor }]}
        />
      )}
    </svg>
  )
}

// -----------------------------------------------------------------------------
// Container: 3 cards with independent range tabs
// -----------------------------------------------------------------------------
export type DangerChartsProps = {
  intersectionId: string
}

export function DangerCharts({ intersectionId }: DangerChartsProps) {
  const { t } = useLanguage()
  const [countRange, setCountRange] = useState<ChartRange>('12h')
  const [speedRange, setSpeedRange] = useState<ChartRange>('12h')
  const [pedRange, setPedRange] = useState<ChartRange>('12h')

  const countData = useMemo(
    () => mockService.getIntersectionChartData(intersectionId, countRange).rightTurnCount,
    [intersectionId, countRange],
  )
  const speedData = useMemo(
    () => mockService.getIntersectionChartData(intersectionId, speedRange).rightTurnSpeed,
    [intersectionId, speedRange],
  )
  const pedData = useMemo(
    () => mockService.getIntersectionChartData(intersectionId, pedRange).pedestrianViolation,
    [intersectionId, pedRange],
  )

  return (
    <>
      <ChartCard title={t('右轉車數量')} range={countRange} onRangeChange={setCountRange}>
        <BarChart
          data={countData}
          unit={t('次數')}
          baseColor="#64748b"
          accentColor="#a855f7"
          highlightColor="#d946ef"
        />
      </ChartCard>

      <ChartCard
        title={t('右轉車輛速度與減速比例')}
        range={speedRange}
        onRangeChange={setSpeedRange}
      >
        <ComboChart data={speedData} />
      </ChartCard>

      <ChartCard title={t('未禮讓行人次數')} range={pedRange} onRangeChange={setPedRange}>
        <LineChart data={pedData} unit={t('次')} />
      </ChartCard>
    </>
  )
}
