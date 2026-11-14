const STARS = Array.from({length: 46}, (_, i) => ({
  left: (i * 37.7) % 100,
  top: (i * 23.3) % 55,
  size: i % 7 === 0 ? 2 : 1,
  delay: (i % 9) * 0.45,
}));

/** Night sky over mountains: aurora glows, stars and a layered ridge line. */
export function Background() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,#141a33_0%,#070912_55%,#05060b_100%)]" />
      <div className="aurora drift-a -top-[18vh] left-[8vw] h-[55vh] w-[55vw] bg-[#2dd4bf]/40" />
      <div className="aurora drift-b top-[2vh] right-[-10vw] h-[60vh] w-[50vw] bg-[#6366f1]/45" />
      <div className="aurora drift-a bottom-[8vh] left-[30vw] h-[35vh] w-[40vw] bg-[#a855f7]/25" />
      {STARS.map((s, i) => (
        <span
          key={i}
          className="star absolute rounded-full bg-white"
          style={{left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s`}}
        />
      ))}
      <svg className="absolute bottom-0 left-0 h-[34vh] w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ridge-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1e2340" stopOpacity="0.7" />
            <stop offset="1" stopColor="#05060b" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="ridge-near" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0d1022" />
            <stop offset="1" stopColor="#05060b" />
          </linearGradient>
        </defs>
        <path
          d="M0 220 L120 150 L210 190 L330 90 L450 170 L560 120 L690 200 L800 110 L930 180 L1050 70 L1180 160 L1300 120 L1440 180 L1440 320 L0 320 Z"
          fill="url(#ridge-far)"
        />
        <path
          d="M0 260 L150 200 L260 240 L400 170 L520 230 L640 190 L780 250 L900 200 L1030 240 L1160 180 L1300 230 L1440 210 L1440 320 L0 320 Z"
          fill="url(#ridge-near)"
        />
      </svg>
    </div>
  );
}
