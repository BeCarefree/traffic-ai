import type { SignalInfo, SignalLightColor } from '../service/mockService'
import { useLanguage } from '../i18n/languageContext'

const LIGHT_COLOR: Record<SignalLightColor, string> = {
  red: '#ef4444',
  yellow: '#f59e0b',
  green: '#22c55e',
}

const LIGHT_ORDER: SignalLightColor[] = ['red', 'yellow', 'green']

type HeadOrientation = 'horizontal' | 'vertical'

type SignalHeadProps = {
  cx: number
  cy: number
  active: SignalLightColor
  orientation: HeadOrientation
}

// 一組三燈號誌頭 — 亮起的燈高亮並有光暈，其餘暗淡。
function SignalHead({ cx, cy, active, orientation }: SignalHeadProps) {
  const dotSpacing = 11
  const dotRadius = 3.4
  const padding = 4
  const isHorizontal = orientation === 'horizontal'
  const headW = isHorizontal ? dotSpacing * 2 + padding * 2 + dotRadius * 2 : dotRadius * 2 + padding * 2
  const headH = isHorizontal ? dotRadius * 2 + padding * 2 : dotSpacing * 2 + padding * 2 + dotRadius * 2

  return (
    <g transform={`translate(${cx - headW / 2}, ${cy - headH / 2})`}>
      <rect
        x={0}
        y={0}
        width={headW}
        height={headH}
        rx={4}
        ry={4}
        className="signal-head-bg"
      />
      {LIGHT_ORDER.map((color, i) => {
        const isActive = active === color
        const ax = isHorizontal ? padding + dotRadius + i * dotSpacing : headW / 2
        const ay = isHorizontal ? headH / 2 : padding + dotRadius + i * dotSpacing
        return (
          <circle
            key={color}
            cx={ax}
            cy={ay}
            r={dotRadius}
            fill={isActive ? LIGHT_COLOR[color] : '#1e293b'}
            className={isActive ? 'signal-light active' : 'signal-light'}
            style={
              isActive
                ? { filter: `drop-shadow(0 0 4px ${LIGHT_COLOR[color]})` }
                : undefined
            }
          />
        )
      })}
    </g>
  )
}

type SignalInfoCardProps = {
  signal: SignalInfo
  // 像素座標（已換算自 lat/lng），相對於 .map-panel 容器
  pixelX: number
  pixelY: number
  // 卡片要放在 marker 的左側還是右側
  side: 'right' | 'left'
}

const CARD_WIDTH = 232
const MARKER_GAP = 20

export function SignalInfoCard({ signal, pixelX, pixelY, side }: SignalInfoCardProps) {
  const { t } = useLanguage()

  // 卡片定位：marker 旁邊；垂直置中由 CSS `transform: translateY(-50%)` 處理，
  // 這樣不需事先知道實際高度，內容多寡都能正確對齊 marker。
  const left = side === 'right' ? pixelX + MARKER_GAP : pixelX - MARKER_GAP - CARD_WIDTH
  const top = pixelY

  return (
    <div
      className={`signal-card signal-card-${side}`}
      style={{ left, top, width: CARD_WIDTH }}
      role="dialog"
      aria-label={t('號誌資訊')}
    >
      <div className="signal-card-leader" aria-hidden="true" />

      <div className="signal-card-header">
        <span className="signal-card-title">{t('號誌資訊')}</span>
        <span className={`signal-card-mode mode-${modeClass(signal.mode)}`}>
          {t(signal.mode)}
        </span>
      </div>

      <div className="signal-card-diagram">
        <svg viewBox="0 0 200 140" preserveAspectRatio="xMidYMid meet">
          {/* 路口十字道路 */}
          <rect x={80} y={0} width={40} height={140} className="signal-road" />
          <rect x={0} y={55} width={200} height={30} className="signal-road" />
          {/* 路口中央淡色標記 */}
          <rect x={82} y={57} width={36} height={26} className="signal-road-center" />

          {/* 四向號誌頭 */}
          <SignalHead cx={100} cy={28} active={signal.lights.n.active} orientation="horizontal" />
          <SignalHead cx={100} cy={112} active={signal.lights.s.active} orientation="horizontal" />
          <SignalHead cx={172} cy={70} active={signal.lights.e.active} orientation="vertical" />
          <SignalHead cx={28} cy={70} active={signal.lights.w.active} orientation="vertical" />
        </svg>
      </div>

      <dl className="signal-card-fields">
        <div className="signal-card-field">
          <dt>{t('編號')}</dt>
          <dd className="mono">{signal.tcId}</dd>
        </div>
        <div className="signal-card-field">
          <dt>{t('動態號控')}</dt>
          <dd>{t(signal.mode)}</dd>
        </div>
        <div className="signal-card-field">
          <dt>{t('位置')}</dt>
          {/* 路口名字保留中文，不翻譯 */}
          <dd>{signal.location}</dd>
        </div>
        <div className="signal-card-field">
          <dt>{t('經緯度')}</dt>
          <dd className="mono">{signal.lat.toFixed(6)}, {signal.lng.toFixed(6)}</dd>
        </div>
        <div className="signal-card-field">
          <dt>{t('最後上線')}</dt>
          <dd className="mono">{signal.lastOnline}</dd>
        </div>
      </dl>
    </div>
  )
}

function modeClass(mode: SignalInfo['mode']): string {
  if (mode === '離線') return 'offline'
  if (mode === '手動') return 'manual'
  return 'auto'
}
