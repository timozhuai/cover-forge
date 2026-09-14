const SANS =
  'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif'

const BG = '#e0e5ec'
const DARK = '#b8bcc2'
const LIGHT = '#ffffff'
const INK = '#333333'
const MUTED = '#6b7280'
const ACCENT = '#6d5dfc'

export default function NeumoCover({ s, w, h }) {
  const soft = '1.4cqmin 1.4cqmin 2.8cqmin ' + DARK + ', -1.4cqmin -1.4cqmin 2.8cqmin ' + LIGHT
  const softSmall =
    '0.8cqmin 0.8cqmin 1.6cqmin ' + DARK + ', -0.8cqmin -0.8cqmin 1.6cqmin ' + LIGHT
  const well =
    'inset 0.9cqmin 0.9cqmin 1.8cqmin ' + DARK + ', inset -0.9cqmin -0.9cqmin 1.8cqmin ' + LIGHT

  return (
    <div
      style={{
        width: w,
        height: h,
        containerType: 'size',
        position: 'relative',
        overflow: 'hidden',
        background: BG,
        fontFamily: SANS,
        padding: '4cqmin',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: '4cqmin',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '3cqmin' }}>
          <span
            style={{
              fontSize: '2.6cqmin',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: MUTED,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {s.brand}
          </span>
          <span
            style={{
              fontSize: '2.4cqmin',
              letterSpacing: '0.12em',
              color: ACCENT,
              background: BG,
              borderRadius: '6cqmin',
              boxShadow: softSmall,
              padding: '0.8cqmin 2cqmin',
              whiteSpace: 'nowrap',
              fontWeight: 500,
            }}
          >
            {s.tags || 'NEW'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '3cqmin', minHeight: 0 }}>
          <div
            style={{
              width: '26cqmin',
              height: '26cqmin',
              borderRadius: '50%',
              background: BG,
              boxShadow: well,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1cqmin',
            }}
          >
            <img
              src={s.logoUrl}
              alt="logo"
              style={{ width: '17cqmin', height: '17cqmin', objectFit: 'contain', display: 'block' }}
            />
          </div>

          <h1
            style={{
              fontWeight: 500,
              fontSize: '8cqmin',
              lineHeight: 1.18,
              letterSpacing: '-0.01em',
              color: INK,
              margin: 0,
              overflowWrap: 'break-word',
            }}
          >
            {s.title}
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: '2.8cqmin',
              color: MUTED,
              letterSpacing: '0.04em',
              maxWidth: '70cqmin',
            }}
          >
            {s.subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <span
            style={{
              fontSize: '2.4cqmin',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: MUTED,
              background: BG,
              borderRadius: '6cqmin',
              boxShadow: softSmall,
              padding: '0.8cqmin 2.4cqmin',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '72cqmin',
            }}
          >
            {s.watermark}
          </span>
        </div>
      </div>
    </div>
  )
}