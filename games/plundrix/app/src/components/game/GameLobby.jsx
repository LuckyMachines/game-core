import { useAccount } from 'wagmi';
import { useGameInfo } from '../../hooks/useGameInfo';
import { useGamePlayers } from '../../hooks/useGamePlayers';
import { usePlayerState } from '../../hooks/usePlayerState';
import { useHasRole } from '../../hooks/useHasRole';
import { useGameActions } from '../../hooks/useGameActions';
import { truncateAddress } from '../../lib/formatting';
import TxStatus from '../shared/TxStatus';
import Spinner from '../shared/Spinner';

export default function GameLobby({ gameId }) {
  const { address } = useAccount();

  // --- read contract data (using shared hooks with polling) ---
  const { playerCount, isLoading: loadingInfo } = useGameInfo(gameId);
  const count = Number(playerCount || 0);
  const { players, isLoading: loadingPlayers } = useGamePlayers(gameId, count);
  const { registered: isRegistered, isLoading: loadingPlayer } = usePlayerState(gameId, address);
  const { hasRole: isGameMaster } = useHasRole(address);

  // --- write actions ---
  const {
    registerPlayer,
    startGame,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  } = useGameActions();

  if (loadingInfo) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="border border-vault-border rounded bg-vault-panel">
      {/* Header stamp */}
      <div className="border-b border-vault-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold tracking-[0.25em] text-tungsten uppercase font-display">
            Operation Briefing
          </h2>
          <span className="font-mono text-xs text-vault-text-dim bg-vault-dark/50 border border-vault-border rounded px-2 py-0.5">
            #{gameId}
          </span>
        </div>
        <span className="font-mono text-xs tracking-widest uppercase text-tungsten-bright border border-tungsten/30 rounded px-2 py-0.5 bg-tungsten/5">
          Open
        </span>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-5">
        {/* Crew manifest */}
        <div>
          <h3 className="font-mono text-[10px] tracking-[0.3em] text-vault-text-dim uppercase mb-3">
            Crew Manifest ({count} enrolled)
          </h3>

          {loadingPlayers ? (
            <div className="flex items-center gap-2 text-vault-text-dim text-xs">
              <Spinner size="w-3.5 h-3.5" />
              <span>Loading roster...</span>
            </div>
          ) : players.length === 0 ? (
            <p className="font-mono text-xs text-vault-text-dim italic">
              No operatives registered yet.
            </p>
          ) : (
            <ul className="space-y-1">
              {players.map((addr, i) => (
                <li key={addr} className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-vault-text-dim w-4 text-right">{i + 1}.</span>
                  <span className={`${addr?.toLowerCase() === address?.toLowerCase() ? 'text-tungsten-bright' : 'text-vault-text'}`}>
                    {truncateAddress(addr)}
                  </span>
                  {addr?.toLowerCase() === address?.toLowerCase() && (
                    <span className="text-[10px] text-tungsten/70 uppercase tracking-wider">(you)</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-vault-border/50">
          {!isRegistered && address && (
            <button
              onClick={() => registerPlayer(gameId)}
              disabled={isPending || isConfirming}
              className="px-4 py-2 bg-tungsten/10 border border-tungsten/40 rounded text-tungsten text-xs font-mono tracking-widest uppercase
                         hover:bg-tungsten/20 hover:border-tungsten/60 transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending || isConfirming ? (
                <span className="flex items-center gap-2">
                  <Spinner size="w-3 h-3" /> Processing...
                </span>
              ) : (
                'Join Operation'
              )}
            </button>
          )}

          {isGameMaster && (
            <button
              onClick={() => startGame(gameId)}
              disabled={isPending || isConfirming || count < 2}
              className="px-4 py-2 bg-oxide-green/10 border border-oxide-green/40 rounded text-oxide-green text-xs font-mono tracking-widest uppercase
                         hover:bg-oxide-green/20 hover:border-oxide-green/60 transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending || isConfirming ? (
                <span className="flex items-center gap-2">
                  <Spinner size="w-3 h-3" /> Processing...
                </span>
              ) : (
                'Start Operation'
              )}
            </button>
          )}

          {isGameMaster && count < 2 && (
            <p className="self-center font-mono text-[10px] text-vault-text-dim italic">
              Minimum 2 operatives required to begin.
            </p>
          )}
        </div>

        {/* Transaction status readout */}
        <TxStatus
          hash={hash}
          isPending={isPending}
          isConfirming={isConfirming}
          isSuccess={isSuccess}
          error={error}
        />
      </div>
    </div>
  );
}
