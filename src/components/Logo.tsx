/** Mark: crimson sun with a thin gold ring over an off-white ridge. Colors follow the theme. */
export function LogoMark({size = 32}: {size?: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="var(--c-panel)" stroke="var(--glass-border)" />
      <circle cx="40" cy="25" r="11" fill="var(--c-accent)" />
      <circle cx="40" cy="25" r="14.5" fill="none" stroke="var(--c-gold)" strokeWidth="1.2" opacity="0.8" />
      <path d="M7 51 L24 29 L33 40 L41 32 L57 51 Z" fill="var(--c-fg)" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={30} />
      <span className="font-display text-[19px] font-semibold uppercase tracking-[0.16em] text-fg">Saiyakat</span>
    </div>
  );
}
