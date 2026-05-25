import { useState } from 'react';

type AstreoLogoProps = {
  compact?: boolean;
};

export default function AstreoLogo({ compact = false }: AstreoLogoProps) {
  const [imageAvailable, setImageAvailable] = useState(true);

  return (
    <div className="flex items-center gap-3">
      {imageAvailable ? (
        <img
          src="/astreo-logo.svg"
          alt="Team ASTREO"
          className={compact ? 'h-auto w-32 sm:w-36' : 'h-auto w-40 sm:w-48'}
          onError={() => setImageAvailable(false)}
        />
      ) : (
        <div
          className={`grid place-items-center rounded border border-astro-orange/24 bg-astro-orange/10 px-3 font-semibold tracking-[0.18em] text-astro-cream ${
            compact ? 'h-8 text-[0.68rem]' : 'h-10 text-xs'
          }`}
        >
          ASTREO
        </div>
      )}
    </div>
  );
}
