import { useMemo, useState } from 'react'
import type {
  ChartRange,
  PedestrianViolationPoint,
  RightTurnCountPoint,
  RightTurnSpeedPoint,
} from '../service/mockService'
import { mockService } from '../service/mockService'

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

type ChartCardProps = {
  title: string
  range: ChartRange
  onRangeChange: (range: ChartRange) => void
  children: React.ReactNode
}

function ChartCard({ title, range, onRangeChange, children }: ChartCardProps) {
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
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-body">{children}</div>
    </div>
  )
}

// X-axis label decimator: for dense ranges (24h), show every Nth label.
function shouldShowXLabel(index: number, total: number): boolean {
  if (total <= 12) return true
  const every = Math.ceil(total / 12)
  return index % every === 0 || index === total - 1
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
  const rawMax = Math.max(...data.map((d) => d.value), 1)
  const max = niceMax(rawMax)
  const bandWidth = PW / data.length
  const barWidth = Math.max(4, bandWidth * 0.55)
  const recentFrom = Math.floor(data.length * 0.5)
  const showAllLabels = data.length <= 12

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
        const fill = d.highlight
          ? highlightColor
          : i >= recentFrom
            ? accentColor
            : baseColor
        const showLabel = showAllLabels || d.highlight
        const showX = shouldShowXLabel(i, data.length)

        return (
          <g key={i}>
            <rect x={bx} y={by} width={barWidth} height={bh} fill={fill} rx={2} />
            {showLabel && (
              <text
                x={bx + barWidth / 2}
                y={by - 4}
                textAnchor="middle"
                className="chart-bar-label"
                fill={fill}
              >
                {d.value}
              </text>
            )}
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
    </svg>
  )
}

// -----------------------------------------------------------------------------
// Chart 2: Speed (bar) + deceleration ratio (line) — combo chart, dual y-axis
// -----------------------------------------------------------------------------
function ComboChart({ data }: { data: RightTurnSpeedPoint[] }) {
  const rawSpeedMax = Math.max(...data.map((d) => d.speed), 1)
  const speedMax = niceMax(rawSpeedMax)
  const ratioMax = 100
  const bandWidth = PW / data.length
  const barWidth = Math.max(4, bandWidth * 0.55)
  const recentFrom = Math.floor(data.length * 0.5)
  const showAllLabels = data.length <= 12

  const baseGreen = '#d1d5db'
  const accentGreen = '#86efac'
  const highlightGreen = '#22c55e'
  const lineGreen = '#15803d'

  const linePoints = data.map((d, i) => ({
    x: M.left + bandWidth * i + bandWidth / 2,
    y: M.top + PH - (d.ratio / ratioMax) * PH,
    d,
    i,
  }))
  const linePath = linePoints
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ')

  return (
    <svg viewBox={`0 0 ${CW} ${CH}`} className="chart-svg" preserveAspectRatio="xMidYMid meet">
      <text x={6} y={M.top - 8} className="chart-axis-unit">m/s</text>
      <text x={CW - 2} y={M.top - 8} textAnchor="end" className="chart-axis-unit">100%</text>

      {/* legend */}
      <g className="chart-legend" transform={`translate(${M.left + 8}, ${M.top - 14})`}>
        <rect x={0} y={-6} width={9} height={9} fill={baseGreen} rx={1.5} />
        <text x={13} y={2} className="chart-legend-text">車輛速度</text>
        <circle cx={60} cy={-1.5} r={3.5} fill={lineGreen} />
        <text x={68} y={2} className="chart-legend-text">減速比例</text>
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
        const fill = d.highlight
          ? highlightGreen
          : i >= recentFrom
            ? accentGreen
            : baseGreen
        const showLabel = showAllLabels || d.highlight
        const showX = shouldShowXLabel(i, data.length)
        return (
          <g key={i}>
            <rect x={bx} y={by} width={barWidth} height={bh} fill={fill} rx={2} />
            {showLabel && (
              <text
                x={bx + barWidth / 2}
                y={by - 4}
                textAnchor="middle"
                className="chart-bar-label"
                fill={highlightGreen}
              >
                {d.speed}
              </text>
            )}
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
          r={p.d.highlight ? 4 : 2.5}
          fill={lineGreen}
        />
      ))}
      {linePoints
        .filter((p) => showAllLabels || p.d.highlight)
        .map((p) => (
          <text
            key={`rl-${p.i}`}
            x={p.x}
            y={p.y - 8}
            textAnchor="middle"
            className="chart-line-label"
            fill={lineGreen}
          >
            {p.d.ratio}
          </text>
        ))}
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
  const rawMax = Math.max(...data.map((d) => d.value), 1)
  const max = niceMax(Math.max(rawMax, 4))
  const bandWidth = PW / data.length
  const showAllLabels = data.length <= 12
  const peakValue = Math.max(...data.map((x) => x.value))

  const lineColor = '#eab308'
  const areaColor = 'rgba(234, 179, 8, 0.18)'

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
          r={p.d.highlight ? 4 : 2.5}
          fill={lineColor}
        />
      ))}
      {points
        .filter((p) => showAllLabels || p.d.highlight || p.d.value === peakValue)
        .map((p) => (
          <text
            key={`pl-${p.i}`}
            x={p.x}
            y={p.y - 8}
            textAnchor="middle"
            className="chart-line-label"
            fill={lineColor}
          >
            {p.d.value}
          </text>
        ))}

      {data.map((d, i) => {
        const bx = M.left + bandWidth * i + bandWidth / 2
        const show = shouldShowXLabel(i, data.length)
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
      <ChartCard title="右轉車數量" range={countRange} onRangeChange={setCountRange}>
        <BarChart
          data={countData}
          unit="次數"
          baseColor="#64748b"
          accentColor="#a855f7"
          highlightColor="#d946ef"
        />
      </ChartCard>

      <ChartCard
        title="右轉車輛速度與減速比例"
        range={speedRange}
        onRangeChange={setSpeedRange}
      >
        <ComboChart data={speedData} />
      </ChartCard>

      <ChartCard title="未禮讓行人次數" range={pedRange} onRangeChange={setPedRange}>
        <LineChart data={pedData} unit="次" />
      </ChartCard>
    </>
  )
}
