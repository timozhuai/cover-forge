const MONO =
  'ui-monospace, "SF Mono", "Cascadia Mono", Consolas, "Courier New", monospace'
const DISPLAY =
  '"Arial Black", "Helvetica Neue", system-ui, "PingFang SC", "Microsoft YaHei", sans-serif'

export default function NeoCover({ s, w, h }) {
  const accent = s.accent || '#ccff00'
  return (
    <div
      style={{
        width: w,
        height: h,
        containerType: 'size',
        position: 'relative',
        overflow: 'hidden',
        background: accent,
        fontFamily: MONO,
        color: '#000',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '34cqmin',
          height: '34cqmin',
          borderRadius: '50%',
          background: '#000',
          right: '-13cqmin',
          top: '-13cqmin',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '20cqmin',
          height: '20cqmin',
          background: '#ffff00',
          border: '1cqmin solid #000',
          transform: 'rotate(14deg)',
          left: '-7cqmin',
          bottom: '-7cqmin',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '2.6cqmin',
          left: '3cqmin',
          fontSize: '3.2cqmin',
          fontWeight: 900,
          lineHeight: 1.5,
          color: 'rgba(0,0,0,0.45)',
          letterSpacing: '0.1em',
        }}
      >
        ▚▞ ▚▞
        <br />
        ▞▚ ▞▚
      </div>

      <div
        style={{
          position: 'absolute',
          inset: '4.6cqmin',
          background: '#ffffff',
          border: '0.9cqmin solid #000',
          boxShadow: '1.6cqmin 1.6cqmin 0 0 #000',
          padding: '3.6cqmin',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3cqmin',
            borderBottom: '0.5cqmin solid #000',
            paddingBottom: '2.4cqmin',
          }}
        >
          <div
            style={{
              border: '0.5cqmin solid #000',
              boxShadow: '0.8cqmin 0.8cqmin 0 0 #000',
              background: '#fff',
              padding: '1.2cqmin',
              display: 'flex',
              flexShrink: 0,
            }}
          >
            <img
              src={s.logoUrl}
              alt="logo"
              style={{ width: '13cqmin', height: '13cqmin', objectFit: 'contain', display: 'block' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 900,
                fontSize: '3cqmin',
                letterSpacing: '0.18em',
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
                fontSize: '2.2cqmin',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(0,0,0,0.55)',
              }}
            >
              NEW / VERIFIED
            </div>
          </div>
          <div
            style={{
              background: '#000',
              color: '#fff',
              border: '0.5cqmin solid #000',
              padding: '0.8cqmin 1.8cqmin',
              fontSize: '2.6cqmin',
              fontWeight: 900,
              boxShadow: '0.7cqmin 0.7cqmin 0 0 #000',
              flexShrink: 0,
            }}
          >
            {s.tags || 'HOT'}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '2.4cqmin 0',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              background: '#ffff00',
              border: '0.5cqmin solid #000',
              boxShadow: '0.6cqmin 0.6cqmin 0 0 #000',
              padding: '0.5cqmin 1.6cqmin',
              fontSize: '2.2cqmin',
              fontWeight: 900,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              width: 'fit-content',
              marginBottom: '2cqmin',
            }}
          >
            ● 今日推荐
          </div>
          <h1
            style={{
              fontFamily: DISPLAY,
              fontWeight: 900,
              fontSize: '8.2cqmin',
              lineHeight: 1.02,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              margin: 0,
              color: '#000',
              overflowWrap: 'break-word',
            }}
          >
            {s.title}
          </h1>
        </div>

        <div
          style={{
            background: accent,
            border: '0.5cqmin solid #000',
            boxShadow: '0.9cqmin 0.9cqmin 0 0 #000',
            padding: '1.2cqmin 2cqmin',
            marginBottom: '2.2cqmin',
          }}
        >
          <p
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: '2.6cqmin',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {s.subtitle}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '2cqmin',
          }}
        >
          <span
            style={{
              fontWeight: 900,
              fontSize: '2.3cqmin',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              border: '0.5cqmin solid #000',
              padding: '0.6cqmin 1.4cqmin',
              boxShadow: '0.6cqmin 0.6cqmin 0 0 #000',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '52cqmin',
            }}
          >
            {s.watermark}
          </span>
          <span
            style={{
              fontWeight: 900,
              fontSize: '2.3cqmin',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            COVER FORGE™
          </span>
        </div>
      </div>
    </div>
  )
}