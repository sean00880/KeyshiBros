/**
 * Reusable diagonal section transition with gradient accent line.
 * fromColor: background color of section above
 * toColor: background color of section below
 */
export function DiagonalTransition({
  fromColor = '#050508',
  toColor = '#ffffff',
  flip = false,
}: {
  fromColor?: string;
  toColor?: string;
  flip?: boolean;
}) {
  const path = flip
    ? 'M0,80 L1440,0 L1440,160 L0,160 Z'
    : 'M0,0 L1440,80 L1440,160 L0,160 Z';

  const line = flip
    ? { x1: 0, y1: 80, x2: 1440, y2: 0 }
    : { x1: 0, y1: 0, x2: 1440, y2: 80 };

  return (
    <div className="relative h-32 md:h-48" style={{ backgroundColor: fromColor }}>
      <svg
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full h-full"
      >
        <path d={path} fill={toColor} />
      </svg>
      <svg
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full h-full"
      >
        <line
          x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
          stroke="url(#diag-accent)"
          strokeWidth="2"
        />
        <defs>
          <linearGradient id="diag-accent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#a1a1aa" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#a1a1aa" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
