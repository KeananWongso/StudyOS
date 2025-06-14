import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: '6px',
        }}
      >
        {/* Progress bars */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '2px',
            height: '20px',
          }}
        >
          <div
            style={{
              background: 'white',
              width: '3px',
              height: '8px',
              opacity: 0.8,
            }}
          />
          <div
            style={{
              background: 'white',
              width: '3px',
              height: '12px',
              opacity: 0.9,
            }}
          />
          <div
            style={{
              background: 'white',
              width: '3px',
              height: '16px',
            }}
          />
          <div
            style={{
              background: 'white',
              width: '3px',
              height: '20px',
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