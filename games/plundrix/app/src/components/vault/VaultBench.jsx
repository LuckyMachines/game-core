import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useGameInfo } from '../../hooks/useGameInfo';
import { useGamePlayers } from '../../hooks/useGamePlayers';
import { usePlayerState } from '../../hooks/usePlayerState';
import { useAllActionsSubmitted } from '../../hooks/useAllActionsSubmitted';
import { useHasRole } from '../../hooks/useHasRole';
import { useGameActions } from '../../hooks/useGameActions';
import { useGameEvents } from '../../hooks/useGameEvents';
import { ROUND_TIMEOUT } from '../../lib/constants';
import LockRack from './LockRack';
import RoundConsole from './RoundConsole';
import PlayerDossier from '../../components/player/PlayerDossier';
import ActionPanel from '../../components/actions/ActionPanel';
import ResolveSequence from '../../components/resolution/ResolveSequence';
import EventLog from '../shared/EventLog';
import TxStatus from '../shared/TxStatus';
import Spinner from '../shared/Spinner';

export default function VaultBench({ gameId }) {
  const { address } = useAccount();
  const { state, currentRound, playerCount, roundStartTime, isLoading: gameLoading } = useGameInfo(gameId);
  const { players, isLoading: playersLoading } = useGamePlayers(gameId, playerCount);
  const { locksCracked, tools, stunned, actionSubmitted, isLoading: playerLoading } = usePlayerState(gameId, address);
  const { allSubmitted, isLoading: allSubLoading } = useAllActionsSubmitted(gameId);
  const { hasRole } = useHasRole(address);
  const { resolveRound, hash: resolveHash, isPending: resolvePending, isConfirming: resolveConfirming, isSuccess: resolveSuccess, error: resolveError } = useGameActions();
  const { events, latestRoundEvents } = useGameEvents(gameId);

  // Resolution sequence visibility
  const [showResolve, setShowResolve] = useState(false);
  useEffect(() => {
    if (latestRoundEvents && latestRoundEvents.length > 0) {
      setShowResolve(true);
    }
  }, [latestRoundEvents]);

  // Timeout tracking
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (!roundStartTime) return;
    function check() {
      const now = Math.floor(Date.now() / 1000);
      const elapsed = now - Number(roundStartTime);
      setTimedOut(elapsed >= ROUND_TIMEOUT);
    }
    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [roundStartTime]);

  const canResolve = allSubmitted || timedOut;
  const isLoading = gameLoading || playersLoading;

  if (isLoading) {
    return (
      <div className="border border-vault-border rounded bg-vault-panel p-12 flex items-center justify-center gap-3">
        <Spinner size="w-5 h-5" />
        <span className="font-mono text-xs text-vault-text-dim tracking-wider uppercase">
          Loading vault bench...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ---- Top instrument panel: 3 columns ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Lock Rack */}
        <div className="border border-vault-border rounded bg-vault-panel p-4 flex items-center justify-center overflow-hidden">
          <LockRack locksCracked={locksCracked} />
        </div>

        {/* Center: Round Console */}
        <div className="border border-vault-border rounded bg-vault-panel p-4 flex items-center justify-center">
          <RoundConsole
            currentRound={currentRound}
            roundStartTime={roundStartTime}
            allSubmitted={allSubmitted}
            gameState={state}
          />
        </div>

        {/* Right: Player Dossiers */}
        <div className="border border-vault-border rounded bg-vault-panel p-4">
          <h3 className="text-xs tracking-[0.35em] text-vault-text-dim uppercase font-display mb-3">
            Field Operatives
          </h3>
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {players.map((addr) => (
              <PlayerDossier
                key={addr}
                gameId={gameId}
                address={addr}
                isCurrentUser={addr?.toLowerCase() === address?.toLowerCase()}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ---- Action Panel ---- */}
      <div className="border border-vault-border rounded bg-vault-panel p-4">
        <ActionPanel
          gameId={gameId}
          stunned={stunned}
          actionSubmitted={actionSubmitted}
          tools={tools}
          players={players}
          currentAddress={address}
        />
      </div>

      {/* ---- Resolve Round ---- */}
      {canResolve && (
        <div className="border border-oxide-green/30 rounded bg-vault-panel p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-mono text-xs text-oxide-green uppercase tracking-wider">
                {allSubmitted ? 'All actions submitted' : 'Round timeout reached'}
              </h4>
              <p className="font-mono text-[10px] text-vault-text-dim mt-1">
                Resolve to advance to the next round.
              </p>
            </div>
            <button
              onClick={() => resolveRound(gameId)}
              disabled={resolvePending || resolveConfirming}
              className={`
                py-2 px-6 rounded font-mono text-xs uppercase tracking-[0.2em]
                border transition-all duration-200
                ${resolvePending || resolveConfirming
                  ? 'border-vault-border bg-vault-dark/40 text-vault-text-dim cursor-not-allowed'
                  : 'border-oxide-green/50 bg-oxide-green/10 text-oxide-green hover:bg-oxide-green/20 hover:shadow-[0_0_12px_rgba(64,160,128,0.15)] active:bg-oxide-green/25'
                }
              `}
            >
              {resolvePending || resolveConfirming ? 'Resolving...' : 'Resolve Round'}
            </button>
          </div>
          <TxStatus
            hash={resolveHash}
            isPending={resolvePending}
            isConfirming={resolveConfirming}
            isSuccess={resolveSuccess}
            error={resolveError}
          />
        </div>
      )}

      {/* ---- Resolution Sequence ---- */}
      {showResolve && latestRoundEvents && latestRoundEvents.length > 0 && (
        <ResolveSequence
          roundEvents={latestRoundEvents}
          currentAddress={address}
          onComplete={() => setShowResolve(false)}
        />
      )}

      {/* ---- Event Log ---- */}
      <EventLog events={events} />
    </div>
  );
}
