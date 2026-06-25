export default function KittyClock({ clockTime, expanded, onToggle }) {
  const h = clockTime.getHours()
  const m = clockTime.getMinutes()
  const s = clockTime.getSeconds()

  const CX = 65, CY = 122, R = 44

  function handEnd(clockAngle, length) {
    const rad = (clockAngle - 90) * Math.PI / 180
    return { x: CX + Math.cos(rad) * length, y: CY + Math.sin(rad) * length }
  }

  const hourTip   = handEnd((h % 12) * 30 + m * 0.5, 20)
  const minuteTip = handEnd(m * 6 + s * 0.1, 30)
  const secondTip = handEnd(s * 6, 37)

  const markers = Array.from({ length: 12 }, (_, i) => {
    const rad = (i * 30 - 90) * Math.PI / 180
    const major = i % 3 === 0
    const inner = major ? R - 8 : R - 5
    return {
      x1: CX + Math.cos(rad) * inner, y1: CY + Math.sin(rad) * inner,
      x2: CX + Math.cos(rad) * (R - 2), y2: CY + Math.sin(rad) * (R - 2),
      major,
    }
  })

  const cardinals = [
    { n: 12, idx: 0 }, { n: 3, idx: 3 }, { n: 6, idx: 6 }, { n: 9, idx: 9 },
  ].map(({ n, idx }) => {
    const rad = (idx * 30 - 90) * Math.PI / 180
    return { n, x: CX + Math.cos(rad) * (R - 15), y: CY + Math.sin(rad) * (R - 15) }
  })

  const tz = clockTime.toLocaleTimeString([], { timeZoneName: 'short' }).split(' ').pop()
  const digitalTime = clockTime.toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', ...(expanded ? { second: '2-digit' } : {}),
  })

  return (
    <svg
      viewBox="0 0 130 218"
      className="kitty-clock-svg"
      onClick={onToggle}
      role="img"
      aria-label={expanded ? 'Cat clock — click to hide seconds' : 'Cat clock — click to show seconds'}
    >
      {/* Ears — drawn before head so head circle covers the base, leaving only pointed tips visible */}
      <polygon points="34,36 43,8 54,29"
        style={{ fill: '#c9a0b4', stroke: '#7a6152', strokeWidth: 1.5, strokeLinejoin: 'round' }} />
      <polygon points="37,33 43,13 51,28" style={{ fill: '#fffbf4' }} />
      <polygon points="76,29 87,8 96,36"
        style={{ fill: '#c9a0b4', stroke: '#7a6152', strokeWidth: 1.5, strokeLinejoin: 'round' }} />
      <polygon points="79,28 87,13 93,33" style={{ fill: '#fffbf4' }} />

      {/* Head — drawn after ears so it covers their bases naturally */}
      <circle cx="65" cy="50" r="28"
        style={{ fill: '#c9a0b4', stroke: '#7a6152', strokeWidth: 1.5 }} />

      {/* Eyes — sleepy when collapsed, wide open when expanded */}
      {expanded ? (
        <>
          <circle cx="55" cy="47" r="7"
            style={{ fill: '#f7f2ea', stroke: '#3d2b1f', strokeWidth: 1 }} />
          <circle cx="55" cy="48" r="3.5" style={{ fill: '#3d2b1f' }} />
          <circle cx="56.5" cy="46.5" r="1.2" style={{ fill: 'white' }} />
          <circle cx="75" cy="47" r="7"
            style={{ fill: '#f7f2ea', stroke: '#3d2b1f', strokeWidth: 1 }} />
          <circle cx="75" cy="48" r="3.5" style={{ fill: '#3d2b1f' }} />
          <circle cx="76.5" cy="46.5" r="1.2" style={{ fill: 'white' }} />
        </>
      ) : (
        <>
          <ellipse cx="55" cy="47" rx="7" ry="3" style={{ fill: '#3d2b1f' }} />
          <ellipse cx="75" cy="47" rx="7" ry="3" style={{ fill: '#3d2b1f' }} />
        </>
      )}

      {/* Muzzle bump — cream snout area below nose */}
      <ellipse cx="65" cy="64" rx="11" ry="8"
        style={{ fill: '#fffbf4', opacity: 0.72, stroke: '#7a6152', strokeWidth: 0.8 }} />

      {/* Nose */}
      <polygon points="65,57 61,62 69,62" style={{ fill: '#e8b87a' }} />

      {/* Mouth */}
      <path d="M61,62 Q65,68 69,62"
        style={{ fill: 'none', stroke: '#3d2b1f', strokeWidth: 1.2, strokeLinecap: 'round' }} />

      {/* Whiskers — extend outward from muzzle edges */}
      <line x1="29" y1="58" x2="54" y2="61"
        style={{ stroke: '#7a6152', strokeWidth: 1.1, opacity: 0.85 }} />
      <line x1="29" y1="65" x2="54" y2="65"
        style={{ stroke: '#7a6152', strokeWidth: 1.1, opacity: 0.85 }} />
      <line x1="101" y1="58" x2="76" y2="61"
        style={{ stroke: '#7a6152', strokeWidth: 1.1, opacity: 0.85 }} />
      <line x1="101" y1="65" x2="76" y2="65"
        style={{ stroke: '#7a6152', strokeWidth: 1.1, opacity: 0.85 }} />

      {/* Clock face */}
      <circle cx={CX} cy={CY} r={R + 3}
        style={{ fill: '#3d2b1f', opacity: 0.08 }} />
      <circle cx={CX} cy={CY} r={R}
        style={{ fill: '#fffbf4', stroke: '#7a6152', strokeWidth: 2 }} />

      {/* Hour markers */}
      {markers.map((mk, i) => (
        <line key={i} x1={mk.x1} y1={mk.y1} x2={mk.x2} y2={mk.y2}
          style={{ stroke: '#3d2b1f', strokeWidth: mk.major ? 2 : 1, opacity: mk.major ? 0.7 : 0.35 }} />
      ))}

      {/* Cardinal numbers */}
      {cardinals.map(({ n, x, y }) => (
        <text key={n} x={x} y={y} textAnchor="middle" dominantBaseline="central"
          style={{ fill: '#3d2b1f', fontSize: '8px', fontWeight: 'bold', opacity: 0.75 }}>
          {n}
        </text>
      ))}

      {/* Hands */}
      <line x1={CX} y1={CY} x2={hourTip.x} y2={hourTip.y}
        style={{ stroke: '#3d2b1f', strokeWidth: 3.5, strokeLinecap: 'round' }} />
      <line x1={CX} y1={CY} x2={minuteTip.x} y2={minuteTip.y}
        style={{ stroke: '#3d2b1f', strokeWidth: 2, strokeLinecap: 'round' }} />
      {expanded && (
        <line x1={CX} y1={CY} x2={secondTip.x} y2={secondTip.y}
          style={{ stroke: '#8db89a', strokeWidth: 1.5, strokeLinecap: 'round' }} />
      )}
      <circle cx={CX} cy={CY} r="4" style={{ fill: '#3d2b1f' }} />
      {expanded && <circle cx={CX} cy={CY} r="2" style={{ fill: '#8db89a' }} />}

      {/* Digital display */}
      <rect x="17" y="171" width="96" height="27" rx="5"
        style={{ fill: '#f7f2ea', stroke: '#7a6152', strokeWidth: 1.5 }} />
      <text x="65" y="189" textAnchor="middle" dominantBaseline="central"
        style={{ fill: '#3d2b1f', fontSize: '13px', fontWeight: 'bold', fontFamily: 'monospace' }}>
        {digitalTime}
      </text>

      {/* Timezone — only when expanded */}
      {expanded && (
        <text x="65" y="207" textAnchor="middle" dominantBaseline="central"
          style={{ fill: '#7a6152', fontSize: '9px', fontWeight: 'bold' }}>
          {tz}
        </text>
      )}
    </svg>
  )
}
