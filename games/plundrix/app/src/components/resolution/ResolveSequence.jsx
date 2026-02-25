import { useState, useEffect } from 'react';
import PickResult from './PickResult';
import SearchResult from './SearchResult';
import SabotageResult from './SabotageResult';
import WinnerReveal from './WinnerReveal';

const PHASE_LABELS = [
  'PHASE 1: PICK & SEARCH',
  'PHASE 2: STUNS CLEARED',
  'PHASE 3: SABOTAGE',
  'PHASE 4: WINNER CHECK',
];

const PHASE_DURATIONS = [1500, 500, 1500, 0]; // ms per phase; phase 4 waits for callback

export default function ResolveSequence({ roundEvents, currentAddress, onComplete }) {
  const [phase, setPhase] = useState(0);

  // Advance phases on timers
  useEffect(() => {
    if (!roundEvents || roundEvents.length === 0) return;

    // Determine which phases are needed
    const hasSabotage = roundEvents.some((e) => e.name === 'PlayerSabotaged');
    const hasWinner = roundEvents.some((e) => e.name === 'GameWon');
    const maxPhase = hasWinner ? 3 : hasSabotage ? 2 : 1;

    if (phase > maxPhase) {
      onComplete?.();
      return;
    }

    // Phase 4 (winner) doesn't auto-advance
    if (phase === 3) return;

    const timer = setTimeout(() => {
      setPhase((p) => p + 1);
    }, PHASE_DURATIONS[phase]);

    return () => clearTimeout(timer);
  }, [phase, roundEvents, onComplete]);

  // Reset phase when new round events arrive
  useEffect(() => {
    setPhase(0);
  }, [roundEvents]);

  if (!roundEvents || roundEvents.length === 0) return null;

  // Extract event data for each phase
  const lockCrackedEvents = roundEvents.filter((e) => e.name === 'LockCracked');
  const toolFoundEvents = roundEvents.filter((e) => e.name === 'ToolFound');
  const sabotageEvents = roundEvents.filter((e) => e.name === 'PlayerSabotaged');
  const gameWonEvent = roundEvents.find((e) => e.name === 'GameWon');
  const roundResolvedEvent = roundEvents.find((e) => e.name === 'RoundResolved');

  // Build pick/search results from ActionSubmitted events
  const actionEvents = roundEvents.filter((e) => e.name === 'ActionSubmitted');
  const pickPlayers = actionEvents
    .filter((e) => Number(e.args?.action) === 1)
    .map((e) => e.args?.player);
  const searchPlayers = actionEvents
    .filter((e) => Number(e.args?.action) === 2)
    .map((e) => e.args?.player);

  return (
    <div className="border border-vault-border rounded bg-vault-panel p-4 space-y-4">
      {/* Phase label */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-vault-border" />
        <span className="font-display text-xs tracking-[0.25em] text-tungsten uppercase shrink-0">
          {PHASE_LABELS[Math.min(phase, 3)]}
        </span>
        <div className="h-px flex-1 bg-vault-border" />
      </div>

      {/* Phase 1: Pick & Search results */}
      {phase >= 0 && (
        <div className={`space-y-2 transition-opacity duration-300 ${phase === 0 ? 'opacity-100' : 'opacity-60'}`}>
          {/* Pick results */}
          {pickPlayers.map((player) => {
            const cracked = lockCrackedEvents.find(
              (e) => e.args?.player?.toLowerCase() === player?.toLowerCase()
            );
            return (
              <PickResult
                key={`pick-${player}`}
                player={player}
                totalCracked={cracked?.args?.totalCracked}
                success={!!cracked}
              />
            );
          })}

          {/* Search results */}
          {searchPlayers.map((player) => {
            const found = toolFoundEvents.find(
              (e) => e.args?.player?.toLowerCase() === player?.toLowerCase()
            );
            return (
              <SearchResult
                key={`search-${player}`}
                player={player}
                totalTools={found?.args?.totalTools}
                success={!!found}
              />
            );
          })}
        </div>
      )}

      {/* Phase 2: Stuns cleared */}
      {phase >= 1 && (
        <div className={`transition-opacity duration-300 ${phase === 1 ? 'opacity-100' : 'opacity-60'}`}>
          <div className="flex items-center justify-center gap-2 py-2">
            <div className="h-px w-8 bg-blueprint/30" />
            <span className="font-mono text-xs tracking-widest uppercase text-blueprint">
              Stuns Cleared
            </span>
            <div className="h-px w-8 bg-blueprint/30" />
          </div>
        </div>
      )}

      {/* Phase 3: Sabotage */}
      {phase >= 2 && sabotageEvents.length > 0 && (
        <div className={`space-y-2 transition-opacity duration-300 ${phase === 2 ? 'opacity-100' : 'opacity-60'}`}>
          {sabotageEvents.map((event, i) => (
            <SabotageResult
              key={`sab-${i}`}
              attacker={event.args?.attacker}
              victim={event.args?.victim}
            />
          ))}
        </div>
      )}

      {/* Phase 4: Winner check */}
      {phase >= 3 && gameWonEvent && (
        <div className="transition-opacity duration-500 opacity-100">
          <WinnerReveal
            winner={gameWonEvent.args?.winner}
            rounds={roundResolvedEvent?.args?.round}
            isCurrentUser={gameWonEvent.args?.winner?.toLowerCase() === currentAddress?.toLowerCase()}
          />
        </div>
      )}
    </div>
  );
}
