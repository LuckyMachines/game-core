import { searchChance } from '../../lib/formatting';
import { MAX_TOOLS } from '../../lib/constants';

const BAR_COUNT = 8;

export default function SearchControl({ onSubmit, disabled, stunned, tools = 0 }) {
  const chance = searchChance(stunned);
  const filledBars = Math.round((chance / 100) * BAR_COUNT);
  const openSockets = MAX_TOOLS - Number(tools || 0);

  return (
    <div className={`
      flex flex-col items-center border rounded p-4
      transition-all duration-300
      ${disabled ? 'border-vault-border bg-vault-dark/30 opacity-60' : 'border-vault-border bg-vault-panel'}
    `}>
      {/* Label */}
      <h4 className="font-mono text-[10px] text-vault-text-dim uppercase tracking-[0.25em] mb-3">
        Sweep Compartment
      </h4>

      {/* Signal strength meter */}
      <div className="flex items-end gap-1 h-14 mb-2">
        {Array.from({ length: BAR_COUNT }, (_, i) => {
          const filled = i < filledBars;
          const height = 12 + i * 5;
          return (
            <div
              key={i}
              className={`
                w-2.5 rounded-t transition-all duration-300
                ${filled
                  ? stunned
                    ? 'bg-tungsten/50'
                    : 'bg-tungsten shadow-[0_0_4px_rgba(196,149,106,0.2)]'
                  : 'bg-vault-border'
                }
              `}
              style={{ height: `${height}px` }}
            />
          );
        })}
      </div>

      {/* Chance readout */}
      <div className="flex items-baseline gap-1 mb-2">
        <span className={`
          font-mono text-xl font-bold tabular-nums
          ${stunned ? 'text-vault-text-dim' : 'text-tungsten-bright'}
        `}>
          {chance}%
        </span>
        <span className="font-mono text-[9px] text-vault-text-dim uppercase">
          signal
        </span>
      </div>

      {/* Socket info */}
      <p className="font-mono text-[10px] text-vault-text-dim text-center mb-1 leading-relaxed">
        Tool tray has <span className="text-vault-text">{openSockets}</span> open socket{openSockets !== 1 ? 's' : ''}
      </p>

      {stunned && (
        <p className="font-mono text-[10px] text-signal-red/70 text-center mb-1">
          Signal degraded
        </p>
      )}

      <div className="flex-1" />

      {/* Execute button */}
      <button
        onClick={() => onSubmit?.()}
        disabled={disabled}
        className={`
          w-full py-2 px-4 rounded font-mono text-xs uppercase tracking-[0.2em]
          border transition-all duration-200 mt-3
          ${disabled
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
