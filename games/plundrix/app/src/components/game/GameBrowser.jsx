import { useAccount } from 'wagmi';
import { useTotalGames } from '../../hooks/useTotalGames';
import { useGameActions } from '../../hooks/useGameActions';
import GameCard from './GameCard';
import Spinner from '../shared/Spinner';
import TxStatus from '../shared/TxStatus';

export default function GameBrowser() {
  const { address } = useAccount();
  const { totalGames, isLoading, error } = useTotalGames();
  const {
    createGame,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: txError,
  } = useGameActions();

  const count = totalGames !== undefined ? Number(totalGames) : 0;

  // Build array from totalGames down to 1 (most recent first)
  const gameIds = Array.from({ length: count }, (_, i) => count - i);

  return (
    <div className="border border-vault-border rounded bg-vault-surface">
      {/* Header bar */}
      <div className="border-b border-vault-border px-6 py-4 flex items-center justify-between">
        <h2 className="font-mono text-[10px] tracking-[0.3em] text-vault-text-dim uppercase">
          Active Operations
        </h2>

        {address && (
          <button
            onClick={() => createGame()}
            disabled={isPending || isConfirming}
            className="px-4 py-2 bg-tungsten/10 border border-tungsten/40 rounded text-tungsten text-xs font-mono tracking-widest uppercase
                       hover:bg-tungsten/20 hover:border-tungsten/60 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending || isConfirming ? (
              <span className="flex items-center gap-2">
                <Spinner size="w-3 h-3" /> Creating...
              </span>
            ) : (
              'Create Game'
            )}
          </button>
        )}
      </div>

      {/* Transaction feedback */}
      {(hash || isPending || txError) && (
        <div className="px-6 pt-4">
          <TxStatus
            hash={hash}
            isPending={isPending}
            isConfirming={isConfirming}
            isSuccess={isSuccess}
            error={txError}
          />
        </div>
      )}

      {/* Game list */}
      <div className="px-6 py-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 gap-3">
            <Spinner size="w-5 h-5" />
            <span className="font-mono text-xs text-vault-text-dim tracking-wider uppercase">
              Scanning operations...
            </span>
          </div>
        ) : error ? (
          <div className="text-center py-12 space-y-2">
            <p className="font-mono text-xs text-signal-red tracking-wider uppercase">
              Failed to load operations
            </p>
            <p className="font-mono text-[10px] text-vault-text-dim break-all max-w-lg mx-auto">
              {error?.shortMessage || error?.message || String(error)}
            </p>
          </div>
        ) : count === 0 ? (
          <div className="text-center py-12">
            <p className="font-mono text-xs text-vault-text-dim italic">
              No operations found. Create one to begin.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {gameIds.map((id) => (
              <GameCard key={id} gameId={id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
