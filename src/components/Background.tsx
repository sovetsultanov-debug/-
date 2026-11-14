/**
 * Page atmosphere shared by every screen: near-black (or paper) ground,
 * crimson glow at the edges, a pale diagonal band and film grain.
 * The poster scene with photos lives in HeroScene on the home screen only.
 */
export function Background() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{background: 'var(--glow), var(--c-bg)'}} />
      <div className="band top-[18vh]" />
      <div className="grain" />
    </div>
  );
}
