import { useNavigate } from 'react-router-dom';
import { useGameInfo } from '../../hooks/useGameInfo';
import { GameState, STATE_LABELS } from '../../lib/constants';
import { formatBigInt } from '../../lib/formatting';
import Spinner from '../shared/Spinner';

const STATE_COLORS = {
  [GameState.OPEN]: 'text-oxide-green border-oxide-green/30 bg-oxide-green/5',
  [GameState.ACTIVE]: 'text-tungsten border-tungsten/30 bg-tungsten/5',
  [GameState.COMPLETE]: 'text-vault-text-dim border-vault-text-dim/30 bg-vault-text-dim/5',
};

export default function GameCard({ gameId }) {
  const navigate = useNavigate();
  const { state, currentRound, playerCount, isLoading, error } = useGameInfo(gameId);

  const stateNum = state !== undefined ? Number(state) : undefined;
  const stateLabel = stateNum !== undefined ? STATE_LABELS[stateNum] : '...';
  const stateColor = stateNum !== undefined ? STATE_COLORS[stateNum] : 'text-vault-text-dim border-vault-border bg-vault-dark/50';

  return (
    <button
      onClick={() => navigate(`/game/${gameId}`)}
      className="w-full text-left border border-vault-border rounded bg-vault-panel
                 hover:border-tungsten/40 hover:bg-vault-panel/80 transition-colors
                 focus:outline-none focus:ring-1 focus:ring-tungsten/50"
    >
      <div className="px-5 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-2">
            <Spinner size="w-4 h-4" />
          </div>
        ) : error ? (
          <p className="font-mono text-xs text-signal-red">Failed to load</p>
        ) : (
          <>
            {/* Top row: ID + State badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-sm text-tungsten-bright tracking-wider">
                OP-{String(gameId).padStart(3, '0')}
              </span>
              <span
                className={`font-mono text-[10px] tracking-widest uppercase rounded px-2 py-0.5 border ${stateColor}`}
              >
                {stateLabel}
              </span>
            </div>

            {/* Details row */}
            <div className="flex items-center gap-6">
              <div>
                <p className="font-mono text-[10px] tracking-[0.3em] text-vault-text-dim uppercase mb-0.5">
                  Operatives
                </p>
                <p className="font-mono text-xs text-vault-text">
                  {formatBigInt(playerCount)}
                </p>
              </div>

              {stateNum === GameState.ACTIVE && (
                <div>
                  <p className="font-mono text-[10px] tracking-[0.3em] text-vault-text-dim uppercase mb-0.5">
                    Round
                  </p>
                  <p className="font-mono text-xs text-vault-text">
                    {formatBigInt(currentRound)}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </button>
  );
}
