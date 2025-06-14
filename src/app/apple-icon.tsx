import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '36px',
        }}
      >
        {/* Progress bars */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '8px',
            height: '80px',
          }}
        >
          <div
            style={{
              background: 'white',
              width: '12px',
              height: '32px',
              opacity: 0.8,
              borderRadius: '2px',
            }}
          />
          <div
            style={{
              background: 'white',
              width: '12px',
              height: '48px',
              opacity: 0.9,
              borderRadius: '2px',
            }}
          />
          <div
            style={{
              background: 'white',
              width: '12px',
              height: '64px',
              borderRadius: '2px',
            }}
          />
          <div
            style={{
              background: 'white',
              width: '12px',
              height: '80px',
              borderRadius: '2px',
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}