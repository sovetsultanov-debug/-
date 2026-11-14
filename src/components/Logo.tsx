export function LogoMark({size = 32}: {size?: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="lm-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5eead4" />
          <stop offset="1" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="rgb(255 255 255 / 0.06)" stroke="rgb(255 255 255 / 0.14)" />
      <path d="M10 46 L26 22 L34 34 L40 26 L54 46 Z" fill="url(#lm-g)" />
      <circle cx="44" cy="17" r="5" fill="#fcd34d" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={30} />
      <span className="text-[17px] font-semibold tracking-tight text-white">Saiyakat</span>
    </div>
  );
}
