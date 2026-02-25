import { truncateAddress } from '../../lib/formatting';

export default function SabotageResult({ attacker, victim }) {
  return (
    <div className="bg-vault-dark border border-signal-red/20 rounded px-4 py-3 animate-sabotage-shake">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Sabotage icon */}
          <div className="w-8 h-8 rounded border border-signal-red/30 bg-signal-red/10 flex items-center justify-center text-signal-red">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              {/* Scissors / cut */}
              <line x1="2" y1="2" x2="14" y2="14" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="8" y1="10" x2="8" y2="14" />
            </svg>
          </div>

          {/* Attacker to victim */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-signal-red">
              {truncateAddress(attacker)}
            </span>
            <span className="text-signal-red/40">&rarr;</span>
            <span className="text-vault-text">
              {truncateAddress(victim)}
            </span>
          </div>
        </div>

        {/* Action label */}
        <div className="flex items-center gap-3">
          <span className="font-display text-xs tracking-widest uppercase text-signal-red-dim border border-signal-red/20 bg-signal-red/5 rounded px-2 py-0.5">
            DISORIENTED
          </span>
          <span className="font-display text-xs tracking-widest uppercase text-signal-red border border-signal-red/30 bg-signal-red/5 rounded px-2 py-0.5">
            CUT LINE
          </span>
        </div>
      </div>

      {/* CSS animation keyframes injected via style tag */}
      <style>{`
        @keyframes sabotage-shake {
          0%, 100% { transform: translateX(0); }
          10% { transform: translateX(-2px); }
          20% { transform: translateX(2px); }
          30% { transform: translateX(-2px); }
          40% { transform: translateX(2px); }
          50% { transform: translateX(0); }
        }
        .animate-sabotage-shake {
          animation: sabotage-shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
