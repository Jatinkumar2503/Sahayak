import { ImageResponse } from 'next/og';

export const alt = 'Sahayak 3D | Real-Time 3D Rail Journey & Disruption Simulator';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          padding: '60px',
          position: 'relative',
        }}
      >
        {/* Subtle decorative grid lines */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'radial-gradient(circle at 25px 25px, rgba(230, 159, 0, 0.15) 2%, transparent 0%)',
            backgroundSize: '50px 50px',
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(230, 159, 0, 0.15)',
            border: '2px solid #E69F00',
            borderRadius: '9999px',
            padding: '10px 28px',
            marginBottom: '28px',
            color: '#FEF3C7',
            fontSize: '22px',
            fontWeight: 800,
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          Indian Railways • Accessible 3D Rail Corridor
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: '68px',
            fontWeight: 900,
            letterSpacing: '-2px',
            textAlign: 'center',
            marginBottom: '16px',
            background: 'linear-gradient(90deg, #FFFFFF 0%, #56B4E9 50%, #E69F00 100%)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Sahayak 3D / सहायक ३डी
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            fontSize: '28px',
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.4,
            marginBottom: '40px',
          }}
        >
          Real-time 3D Low-Poly Rail Journey, Instant Disruption Mitigation & Multi-Modal Passenger Decision Support
        </div>

        {/* Features row */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            marginTop: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#004D38',
              border: '1px solid #009E73',
              borderRadius: '16px',
              padding: '12px 24px',
              color: '#D1FAE5',
              fontSize: '20px',
              fontWeight: 700,
            }}
          >
            • WCAG High Contrast
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#003B5C',
              border: '1px solid #0072B2',
              borderRadius: '16px',
              padding: '12px 24px',
              color: '#DBEAFE',
              fontSize: '20px',
              fontWeight: 700,
            }}
          >
            • Deterministic Engine
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#7A5400',
              border: '1px solid #E69F00',
              borderRadius: '16px',
              padding: '12px 24px',
              color: '#FEF3C7',
              fontSize: '20px',
              fontWeight: 700,
            }}
          >
            • English + Hindi
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
