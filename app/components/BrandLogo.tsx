'use client';

type BrandLogoProps = {
  dotIgnited: boolean;
};

export function BrandLogo({ dotIgnited }: BrandLogoProps) {
  const dotClass = `logo-dot ${dotIgnited ? 'flashlight-active' : 'opacity-0 scale-0 bg-white'}`;

  return (
    <span className="inline-flex items-center" dir="ltr">
      <span className="relative inline-block text-2xl font-bold tracking-tighter text-fg-0">
        <span aria-hidden="true">
          Nehor
          <span className="font-light logo-ai-neon">
            a
            <span className="relative inline-block">
              <span
                id="logo-dot"
                className={`brand-wordmark-dot ${dotClass}`}
              />
              &#305;
            </span>
          </span>
        </span>
      </span>
    </span>
  );
}
