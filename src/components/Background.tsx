/**
 * Page atmosphere shared by every screen: near-black (or paper) ground,
 * crimson glow at the edges, a pale diagonal band, low ridges and film grain.
 * The big poster scene lives in HeroScene on the home screen only.
 */
export function Background() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{background: 'var(--glow), var(--c-bg)'}} />
      <div className="band top-[18vh]" />
      <svg className="absolute bottom-0 left-0 h-[26vh] w-full" viewBox="0 0 1440 260" preserveAspectRatio="none">
        <path
          d="M0 170 L140 110 L240 150 L360 70 L480 140 L600 100 L720 160 L840 90 L960 150 L1080 60 L1200 130 L1320 100 L1440 140 L1440 260 L0 260 Z"
          fill="var(--ridge-far)"
          opacity="0.9"
        />
        <path
          d="M0 210 L170 160 L290 195 L420 140 L560 190 L690 160 L820 205 L950 165 L1080 200 L1210 150 L1340 190 L1440 175 L1440 260 L0 260 Z"
          fill="var(--ridge-near)"
        />
      </svg>
      <div className="grain" />
    </div>
  );
}
