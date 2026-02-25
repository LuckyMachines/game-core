import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useGameInfo } from '../../hooks/useGameInfo';
import { useGamePlayers } from '../../hooks/useGamePlayers';
import { usePlayerState } from '../../hooks/usePlayerState';
import { truncateAddress, formatBigInt } from '../../lib/formatting';
import { TOTAL_LOCKS } from '../../lib/constants';
import Spinner from '../shared/Spinner';

function PlayerRow({ gameId, playerAddr, winner }) {
  const { locksCracked, tools, isLoading } = usePlayerState(gameId, playerAddr);
  const isWinner = winner?.toLowerCase() === playerAddr?.toLowerCase();

  if (isLoading) {
    return (
      <tr className="border-b border-vault-border/50">
        <td colSpan={4} className="px-4 py-3">
          <Spinner size="w-3 h-3" />
        </td>
      </tr>
    );
  }

  return (
    <tr className={`border-b border-vault-border/50 ${isWinner ? 'bg-tungsten/5' : ''}`}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-vault-text">
            {truncateAddress(playerAddr)}
          </span>
          {isWinner && (
            <span className="font-display text-[10px] tracking-widest uppercase text-tungsten-bright border border-tungsten/30 rounded px-1.5 py-0.5 bg-tungsten/5">
              WINNER
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="font-mono text-xs text-tungsten tabular-nums">
          {formatBigInt(locksCracked)}
        </span>
        <span className="font-mono text-xs text-vault-text-dim">
          /{TOTAL_LOCKS}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="font-mono text-xs text-oxide-green tabular-nums">
          {formatBigInt(tools)}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        {isWinner ? (
          <span className="font-display text-xs tracking-widest uppercase text-tungsten-bright">
            VAULT BREACHED
          </span>
        ) : (
          <span className="font-display text-xs tracking-widest uppercase text-vault-text-dim">
            LOCKED OUT
          </span>
        )}
      </td>
    </tr>
  );
}

export default function GameOver({ gameId }) {
  const { address } = useAccount();
  const { winner, currentRound, playerCount, isLoading, error } = useGameInfo(gameId);
  const { players } = useGamePlayers(gameId, playerCount);

  const isCurrentUserWinner = winner?.toLowerCase() === address?.toLowerCase();

  if (isLoading) {
    return (
      <div className="border border-vault-border rounded bg-vault-panel p-12 flex items-center justify-center gap-3">
        <Spinner size="w-5 h-5" />
        <span className="font-mono text-xs text-vault-text-dim tracking-wider uppercase">
          Loading final report...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-signal-red/30 rounded bg-vault-panel p-8 text-center">
        <p className="font-mono text-xs text-signal-red tracking-wider uppercase">
          Failed to load game results
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Final Briefing Header */}
      <div className="border border-vault-border rounded bg-vault-panel overflow-hidden">
        {/* Top classification bar */}
        <div className="bg-vault-dark border-b border-vault-border px-4 py-2 flex items-center justify-between">
          <span className="font-display text-xs tracking-[0.3em] text-vault-text-dim uppercase">
            Final Briefing
          </span>
          <span className="font-mono text-xs text-vault-text-dim">
            Operation #{gameId}
          </span>
        </div>

        {/* Winner display */}
        <div className="relative p-8 text-center overflow-hidden">
          {/* Subtle radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(218,165,32,0.08) 0%, transparent 60%)',
            }}
          />

          <div className="relative z-10 space-y-4">
            <h2 className="text-2xl font-display font-bold tracking-[0.3em] text-tungsten-bright uppercase">
              Vault Breached
            </h2>

            {isCurrentUserWinner && (
              <div className="inline-block border-2 border-tungsten-bright/50 rounded px-5 py-1.5 rotate-[-2deg]">
                <span className="font-display text-lg tracking-[0.4em] text-tungsten-bright uppercase font-bold">
                  You Win
                </span>
              </div>
            )}

            <div className="space-y-1">
              <p className="font-display text-xs tracking-widest text-vault-text-dim uppercase">
                Victor
              </p>
              <p className="font-mono text-sm text-tungsten">
                {truncateAddress(winner)}
              </p>
            </div>

            <div className="flex items-center justify-center gap-8">
              <div className="space-y-1">
                <p className="font-display text-xs tracking-widest text-vault-text-dim uppercase">
                  Rounds
                </p>
                <p className="font-mono text-lg text-tungsten-bright tabular-nums">
                  {formatBigInt(currentRound)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-display text-xs tracking-widest text-vault-text-dim uppercase">
                  Operators
                </p>
                <p className="font-mono text-lg text-vault-text tabular-nums">
                  {formatBigInt(playerCount)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats table */}
      <div className="border border-vault-border rounded bg-vault-panel overflow-hidden">
        <div className="bg-vault-dark border-b border-vault-border px-4 py-2">
          <span className="font-display text-xs tracking-[0.3em] text-vault-text-dim uppercase">
            Operator Report
          </span>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-vault-border bg-vault-dark/50">
              <th className="px-4 py-2 text-left font-display text-xs tracking-widest text-vault-text-dim uppercase">
                Operator
              </th>
              <th className="px-4 py-2 text-center font-display text-xs tracking-widest text-vault-text-dim uppercase">
                Locks
              </th>
              <th className="px-4 py-2 text-center font-display text-xs tracking-widest text-vault-text-dim uppercase">
                Tools
              </th>
              <th className="px-4 py-2 text-right font-display text-xs tracking-widest text-vault-text-dim uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {players.map((playerAddr) => (
              <PlayerRow
                key={playerAddr}
                gameId={gameId}
                playerAddr={playerAddr}
                winner={winner}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4">
        <Link
          to="/"
          className="font-display text-xs tracking-widest uppercase text-vault-text-dim hover:text-vault-text border border-vault-border rounded px-4 py-2 bg-vault-panel hover:bg-vault-dark transition-colors"
        >
          Return to Console
        </Link>
        <Link
          to="/"
          className="font-display text-xs tracking-widest uppercase text-tungsten hover:text-tungsten-bright border border-tungsten/30 hover:border-tungsten/50 rounded px-4 py-2 bg-tungsten/5 hover:bg-tungsten/10 transition-colors"
        >
          Create New Game
        </Link>
      </div>

      {/* Bottom classification */}
      <div className="flex items-center justify-center gap-2">
        <div className="h-px w-12 bg-vault-border" />
        <span className="font-display text-[10px] tracking-[0.4em] text-vault-text-dim uppercase">
          End of Report
        </span>
        <div className="h-px w-12 bg-vault-border" />
      </div>
    </div>
  );
}
