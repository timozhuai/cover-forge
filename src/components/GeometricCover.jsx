const MONO =
  'ui-monospace, "SF Mono", "Cascadia Mono", Consolas, "Courier New", monospace'
const DISPLAY =
  '"Arial Black", "Helvetica Neue", system-ui, "PingFang SC", "Microsoft YaHei", sans-serif'

export default function GeometricCover({ s, w, h }) {
  const accent = s.accent || '#ef4444'
  return (
    <div
      style={{
        width: w,
        height: h,
        containerType: 'size',
        position: 'relative',
        overflow: 'hidden',
        background: '#ffffff',
        color: '#000000',
        fontFamily: MONO,
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '34cqmin',
          height: '34cqmin',
          borderRadius: '50%',
          background: '#000',
          right: '-14cqmin',
          top: '-14cqmin',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '26cqmin',
          height: '26cqmin',
          background: accent,
          transform: 'rotate(20deg)',
          left: '-9cqmin',
          top: '30cqmin',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '17cqmin',
          height: '17cqmin',
          borderRadius: '50%',
          border: '1.5cqmin solid #000',
          right: '7cqmin',
          bottom: '-7cqmin',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '9cqmin',
          height: '9cqmin',
          background: '#facc15',
          right: '30cqmin',
          bottom: '12cqmin',
          transform: 'rotate(45deg)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: '7cqmin',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '3cqmin' }}>
          <div
            style={{
              background: '#000',
              color: '#fff',
              padding: '1cqmin 2cqmin',
              fontWeight: 900,
              fontSize: '2.8cqmin',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {s.brand}
          </div>
          <div
            style={{
              border: '0.7cqmin solid #000',
              padding: '0.7cqmin 1.5cqmin',
              fontWeight: 900,
              fontSize: '2.6cqmin',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              background: '#fff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '44cqmin',
            }}
          >
            {s.watermark}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6cqmin', minHeight: 0 }}>
          <div
            style={{
              background: '#000',
              padding: '1.8cqmin',
              transform: 'rotate(-4deg)',
              flexShrink: 0,
              display: 'flex',
            }}
          >
            <img
              src={s.logoUrl}
              alt="logo"
              style={{ width: '16cqmin', height: '16cqmin', objectFit: 'contain', display: 'block', background: '#fff' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                background: accent,
                display: 'inline-block',
                padding: '0.6cqmin 1.8cqmin',
                fontWeight: 900,
                fontSize: '2.6cqmin',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                transform: 'rotate(1.5deg)',
                marginBottom: '2.6cqmin',
                color: '#000',
              }}
            >
              ● {s.tags || 'NEW'}
            </div>
            <h1
              style={{
                fontFamily: DISPLAY,
                fontWeight: 900,
                fontSize: '11cqmin',
                lineHeight: 0.95,
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                margin: 0,
                overflowWrap: 'break-word',
              }}
            >
              {s.title}
            </h1>
          </div>
        </div>

        <div
          style={{
            background: '#000',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '3cqmin',
            padding: '1.1cqmin 2cqmin',
          }}
        >
          <p
            style={{
              margin: 0,
              fontWeight: 900,
              fontSize: '2.7cqmin',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {s.subtitle}
          </p>
          <span style={{ fontWeight: 900, fontSize: '3.2cqmin', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
            Nº 01
          </span>
        </div>
      </div>
    </div>
  )
}