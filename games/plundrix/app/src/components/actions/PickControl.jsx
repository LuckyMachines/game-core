import { pickChance } from '../../lib/formatting';

const ARC_RADIUS = 34;
const ARC_CX = 44;
const ARC_CY = 44;

function describeArc(cx, cy, r, startAngle, endAngle) {
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

export default function PickControl({ onSubmit, disabled, stunned, tools }) {
  const chance = pickChance(tools, stunned);
  // Arc goes from -135 deg to +135 deg (270 degree sweep)
  const startAngle = 135;
  const endAngle = 405;
  const range = endAngle - startAngle;
  const fillAngle = startAngle + (range * chance) / 100;

  const isJammed = stunned;

  return (
    <div className={`
      flex flex-col items-center border rounded p-4
      transition-all duration-300
      ${disabled ? 'border-vault-border bg-vault-dark/30 opacity-60' : 'border-vault-border bg-vault-panel'}
      ${isJammed ? 'opacity-50' : ''}
    `}>
      {/* Label */}
      <h4 className="font-mono text-[10px] text-vault-text-dim uppercase tracking-[0.25em] mb-3">
        Set Tension
      </h4>

      {/* Tension dial SVG */}
      <div className="relative mb-3">
        <svg width="88" height="88" viewBox="0 0 88 88">
          {/* Background arc */}
          <path
            d={describeArc(ARC_CX, ARC_CY, ARC_RADIUS, startAngle, endAngle)}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            className="text-vault-border"
          />
          {/* Fill arc */}
          {chance > 0 && (
            <path
              d={describeArc(ARC_CX, ARC_CY, ARC_RADIUS, startAngle, fillAngle)}
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              className={isJammed ? 'text-vault-text-dim' : 'text-tungsten'}
              style={!isJammed ? { filter: 'drop-shadow(0 0 3px rgba(196,149,106,0.3))' } : {}}
            />
          )}
          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((pct) => {
            const angle = startAngle + (range * pct) / 100;
            const rad = (angle * Math.PI) / 180;
            const x1 = ARC_CX + 28 * Math.cos(rad);
            const y1 = ARC_CY + 28 * Math.sin(rad);
            const x2 = ARC_CX + 31 * Math.cos(rad);
            const y2 = ARC_CY + 31 * Math.sin(rad);
            return (
              <line key={pct} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="currentColor" strokeWidth="1" className="text-vault-text-dim" />
            );
          })}
        </svg>

        {/* Center percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`
            font-mono text-xl font-bold tabular-nums
            ${isJammed ? 'text-vault-text-dim' : 'text-tungsten-bright'}
          `}>
            {chance}%
          </span>
        </div>
      </div>

      {/* Status text */}
      {isJammed ? (
        <p className="font-mono text-[10px] text-signal-red text-center mb-3 leading-relaxed">
          Pick mechanism jammed
        </p>
      ) : (
        <p className="font-mono text-[10px] text-vault-text-dim text-center mb-3 leading-relaxed">
          {Number(tools)} tool{Number(tools) !== 1 ? 's' : ''} applied
        </p>
      )}

      {/* Execute button */}
      <button
        onClick={() => onSubmit?.()}
        disabled={disabled || isJammed}
        className={`
          w-full py-2 px-4 rounded font-mono text-xs uppercase tracking-[0.2em]
          border transition-all duration-200
          ${disabled || isJammed
            ? 'border-vault-border bg-vault-dark/40 text-vault-text-dim cursor-not-allowed'
            : 'border-tungsten/50 bg-tungsten/10 text-tungsten-bright hover:bg-tungsten/20 hover:shadow-[0_0_12px_rgba(196,149,106,0.15)] active:bg-tungsten/25'
          }
        `}
      >
        Execute
      </button>
    </div>
  );
}
