const SERIF = 'Georgia, "Times New Roman", "Songti SC", "SimSun", serif'
const SANS =
  'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif'

const INK = '#1C1C1C'
const CREAM = '#F9F8F6'

export default function EditorialCover({ s, w, h }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        containerType: 'size',
        position: 'relative',
        overflow: 'hidden',
        background: CREAM,
        color: INK,
        fontFamily: SANS,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '2.5cqmin',
          border: '1px solid rgba(28,28,28,0.1)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: '7cqmin 9cqmin',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: '3cqmin',
            borderTop: '1px solid rgba(28,28,28,0.1)',
            paddingTop: '2cqmin',
          }}
        >
          <span
            style={{
              fontSize: '2.2cqmin',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'rgba(28,28,28,0.4)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {s.brand}
          </span>
          <span
            style={{
              fontSize: '2.2cqmin',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'rgba(28,28,28,0.4)',
              whiteSpace: 'nowrap',
            }}
          >
            ISSUE № 01
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '2.4cqmin',
            minHeight: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.6cqmin' }}>
            <span style={{ width: '5cqmin', height: 1, background: 'rgba(28,28,28,0.2)' }} />
            <span
              style={{
                fontSize: '2.1cqmin',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'rgba(28,28,28,0.4)',
              }}
            >
              精选 · Featured
            </span>
            <span style={{ width: '5cqmin', height: 1, background: 'rgba(28,28,28,0.2)' }} />
          </div>

          <img
            src={s.logoUrl}
            alt="logo"
            style={{ height: '16cqmin', maxWidth: '60cqmin', objectFit: 'contain', display: 'block' }}
          />

          <h1
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: '10.5cqmin',
              lineHeight: 0.98,
              letterSpacing: '-0.02em',
              margin: 0,
              overflowWrap: 'break-word',
            }}
          >
            {s.title}
          </h1>

          <p
            style={{
              margin: 0,
              fontStyle: 'italic',
              fontSize: '2.9cqmin',
              lineHeight: 1.6,
              color: 'rgba(28,28,28,0.6)',
              maxWidth: '64cqmin',
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
            gap: '3cqmin',
            borderBottom: '1px solid rgba(28,28,28,0.1)',
            paddingBottom: '2cqmin',
          }}
        >
          <span
            style={{
              fontSize: '2.2cqmin',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'rgba(28,28,28,0.4)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '64cqmin',
            }}
          >
            {s.watermark}
          </span>
          <span
            style={{
              fontSize: '2.2cqmin',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'rgba(28,28,28,0.4)',
              whiteSpace: 'nowrap',
            }}
          >
            {s.tags}
          </span>
        </div>
      </div>
    </div>
  )
}