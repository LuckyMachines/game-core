import { useState, useEffect } from 'react';
import { ROUND_TIMEOUT } from '../../lib/constants';

const RADIUS = 38;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function TimeoutDial({ roundStartTime, timeout = ROUND_TIMEOUT }) {
  const [remaining, setRemaining] = useState(timeout);

  useEffect(() => {
    if (!roundStartTime) return;

    function tick() {
      const now = Math.floor(Date.now() / 1000);
      const elapsed = now - Number(roundStartTime);
      setRemaining(Math.max(0, timeout - elapsed));
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [roundStartTime, timeout]);

  const fraction = remaining / timeout;
  const offset = CIRCUMFERENCE * (1 - fraction);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  // Color transitions based on time remaining
  const isUrgent = remaining < 60;
  const isCritical = remaining < 30;
  const arcColor = isCritical
    ? 'text-signal-red'
    : isUrgent
      ? 'text-tungsten-bright'
      : 'text-tungsten';
  const glowColor = isCritical
    ? 'rgba(212,64,64,0.2)'
    : isUrgent
      ? 'rgba(232,176,120,0.15)'
      : 'rgba(196,149,106,0.1)';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="96" height="96" viewBox="0 0 96 96" className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx="48"
          cy="48"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-vault-border"
        />
        {/* Elapsed arc (dim) */}
        <circle
          cx="48"
          cy="48"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={0}
          strokeLinecap="round"
          className="text-vault-border"
        />
        {/* Remaining arc */}
        <circle
          cx="48"
          cy="48"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${arcColor} transition-all duration-1000 ease-linear`}
          style={{ filter: `drop-shadow(0 0 4px ${glowColor})` }}
        />
        {/* Tick marks */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i / 6) * 360;
          const rad = (angle * Math.PI) / 180;
          const x1 = 48 + 33 * Math.cos(rad);
          const y1 = 48 + 33 * Math.sin(rad);
          const x2 = 48 + 36 * Math.cos(rad);
          const y2 = 48 + 36 * Math.sin(rad);
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="currentColor"
              strokeWidth="1"
              className="text-vault-text-dim"
            />
          );
        })}
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`
          font-mono text-lg font-semibold tabular-nums
          ${isCritical ? 'text-signal-red animate-pulse' : isUrgent ? 'text-tungsten-bright' : 'text-vault-text'}
        `}>
          {mins}:{String(secs).padStart(2, '0')}
        </span>
        {remaining <= 0 && (
          <span className="font-mono text-[8px] text-signal-red uppercase tracking-wider">
            Timeout
          </span>
        )}
      </div>
    </div>
  );
}
