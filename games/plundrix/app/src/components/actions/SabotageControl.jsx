import { useState } from 'react';
import { truncateAddress } from '../../lib/formatting';

export default function SabotageControl({ onSubmit, disabled, stunned, players = [], currentAddress }) {
  const [target, setTarget] = useState('');

  const targets = players.filter(
    (addr) => addr?.toLowerCase() !== currentAddress?.toLowerCase()
  );

  const canExecute = !disabled && target !== '';

  return (
    <div className={`
      flex flex-col items-center border rounded p-4
      transition-all duration-300
      ${disabled ? 'border-vault-border bg-vault-dark/30 opacity-60' : 'border-signal-red/20 bg-vault-panel'}
    `}>
      {/* Label */}
      <h4 className="font-mono text-[10px] text-signal-red/80 uppercase tracking-[0.25em] mb-3">
        Cut Line
      </h4>

      {/* Crosshair icon */}
      <div className="mb-3">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-signal-red/60">
          <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="1" />
          <line x1="24" y1="4" x2="24" y2="16" stroke="currentColor" strokeWidth="1" />
          <line x1="24" y1="32" x2="24" y2="44" stroke="currentColor" strokeWidth="1" />
          <line x1="4" y1="24" x2="16" y2="24" stroke="currentColor" strokeWidth="1" />
          <line x1="32" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="1" />
          <circle cx="24" cy="24" r="1.5" fill="currentColor" />
        </svg>
      </div>

      {/* Target selector */}
      <div className="w-full mb-3">
        <label className="font-mono text-[9px] text-vault-text-dim uppercase tracking-wider block mb-1">
          Target
        </label>
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          disabled={disabled}
          className={`
            w-full bg-vault-dark border border-vault-border rounded
            font-mono text-xs text-vault-text
            px-2 py-1.5 appearance-none cursor-pointer
            focus:outline-none focus:border-signal-red/40
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <option value="">Select target...</option>
          {targets.map((addr) => (
            <option key={addr} value={addr}>
              {truncateAddress(addr)}
            </option>
          ))}
        </select>
      </div>

      {/* Flavor text */}
      <p className="font-mono text-[10px] text-vault-text-dim text-center mb-1 italic leading-relaxed">
        No RNG &mdash; certainty
      </p>

      {stunned && (
        <p className="font-mono text-[10px] text-signal-red/70 text-center mb-1">
          Disoriented but operational
        </p>
      )}

      <div className="flex-1" />

      {/* Execute button */}
      <button
        onClick={() => onSubmit?.(target)}
        disabled={!canExecute}
        className={`
          w-full py-2 px-4 rounded font-mono text-xs uppercase tracking-[0.2em]
          border transition-all duration-200 mt-3
          ${!canExecute
            ? 'border-vault-border bg-vault-dark/40 text-vault-text-dim cursor-not-allowed'
            : 'border-signal-red/50 bg-signal-red/10 text-signal-red hover:bg-signal-red/20 hover:shadow-[0_0_12px_rgba(212,64,64,0.15)] active:bg-signal-red/25'
          }
        `}
      >
        Execute
      </button>
    </div>
  );
}
