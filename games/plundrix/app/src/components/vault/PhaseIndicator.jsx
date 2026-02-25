import { GameState } from '../../lib/constants';

const PHASES = [
  { key: 'submit', label: 'SUBMIT' },
  { key: 'resolve', label: 'RESOLVE' },
  { key: 'next', label: 'NEXT ROUND' },
  { key: 'winner', label: 'WINNER' },
];

function getActivePhase(gameState, allSubmitted) {
  const state = Number(gameState);
  if (state === GameState.COMPLETE) return 'winner';
  if (state === GameState.ACTIVE) {
    return allSubmitted ? 'resolve' : 'submit';
  }
  return null;
}

export default function PhaseIndicator({ gameState, allSubmitted }) {
  const activeKey = getActivePhase(gameState, allSubmitted);

  return (
    <div className="flex items-center gap-0.5">
      {PHASES.map((phase, i) => {
        const isActive = phase.key === activeKey;
        return (
          <div key={phase.key} className="flex items-center">
            <div
              className={`
                px-2 py-1 text-[10px] font-mono uppercase tracking-wider
                border transition-all duration-300
                ${isActive
                  ? 'border-tungsten/60 bg-tungsten/15 text-tungsten-bright shadow-[0_0_8px_rgba(196,149,106,0.15)]'
                  : 'border-vault-border bg-vault-dark/40 text-vault-text-dim'
                }
              `}
            >
              {phase.label}
            </div>
            {i < PHASES.length - 1 && (
              <svg className="w-3 h-3 text-vault-text-dim shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="4,2 8,6 4,10" />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}
