// Nehorai design-system palette (deep navy → electric blue → pale ice).
const COLORS = {
  obsidian: '#050E22', // --bg-0
  panel: '#0A1735',    // --bg-1
  slate: '#2A3D78',    // --line-strong
  electric: '#2563EB', // --accent
  ice: '#BAEFFE',      // --accent-ice (node glow)
  text: '#EEF2FB',     // --fg-0
  muted: '#9CA9C8',    // --fg-1
};

export function BrandMark() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: COLORS.obsidian,
      }}
    >
      <div
        style={{
          width: '78%',
          height: '78%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 28,
          border: `2px solid ${COLORS.slate}`,
          background: COLORS.panel,
          boxShadow: '0 0 22px rgba(37, 99, 235, 0.18), 0 0 0 2px rgba(37, 99, 235, 0.12) inset',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '18%',
            top: '27%',
            width: '52%',
            height: '50%',
            background: COLORS.text,
            clipPath: 'polygon(0 100%, 0 0, 28% 0, 100% 78%, 100% 100%, 74% 100%, 28% 47%, 28% 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '16%',
            top: '35%',
            width: '11%',
            height: '43%',
            borderRadius: 3,
            background: COLORS.electric,
            boxShadow: `0 0 10px rgba(37, 99, 235, 0.5)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '22%',
            right: '19%',
            width: 12,
            height: 12,
            borderRadius: 9999,
            background: COLORS.ice,
            boxShadow: `0 0 10px rgba(186, 239, 254, 0.76), 0 0 20px rgba(37, 99, 235, 0.24)`,
          }}
        />
      </div>
    </div>
  );
}

export function SocialShareCard() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        background: COLORS.obsidian,
        color: COLORS.text,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 28,
          borderRadius: 34,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.03)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 96,
          width: 300,
          height: '100%',
          background: 'rgba(37, 99, 235, 0.08)',
          transform: 'skewX(-18deg)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 72,
          right: 84,
          width: 180,
          height: 180,
          borderRadius: 9999,
          border: '1px solid rgba(186,239,254,0.28)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 66,
          right: 128,
          width: 240,
          height: 2,
          background: 'rgba(186,239,254,0.42)',
        }}
      />
      <div
        style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '56px 64px',
          gap: 48,
        }}
      >
        <div
          style={{
            width: 244,
            height: 244,
            display: 'flex',
            flexShrink: 0,
          }}
        >
          <BrandMark />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 18px',
              borderRadius: 9999,
              border: '1px solid rgba(37,99,235,0.28)',
              color: COLORS.electric,
              fontSize: 22,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            Agents • Workflows • Systems
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 84,
              lineHeight: 0.94,
              letterSpacing: '-0.07em',
              fontWeight: 800,
            }}
          >
            Nehorai Hadad
          </div>
          <div
            style={{
              marginTop: 22,
              maxWidth: 620,
              fontSize: 34,
              lineHeight: 1.32,
              color: '#9CA9C8',
            }}
          >
            AI engineer and full-stack builder shipping production-grade agents, automation, and modern web products.
          </div>
          <div
            style={{
              marginTop: 30,
              display: 'flex',
              alignItems: 'center',
              color: COLORS.ice,
              fontSize: 24,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            nehoraihadad.com
          </div>
        </div>
      </div>
    </div>
  );
}
