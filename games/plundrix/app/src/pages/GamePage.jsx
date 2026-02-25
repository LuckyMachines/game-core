import { useParams } from 'react-router-dom';
import { useGameInfo } from '../hooks/useGameInfo';
import { GameState } from '../lib/constants';
import GameLobby from '../components/game/GameLobby';
import VaultBench from '../components/vault/VaultBench';
import GameOver from '../components/game/GameOver';
import Spinner from '../components/shared/Spinner';

export default function GamePage() {
  const { gameId } = useParams();
  const { state, isLoading, error } = useGameInfo(gameId);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-semibold tracking-widest text-tungsten uppercase font-display">
          Operation
        </h1>
        <span className="font-mono text-sm text-vault-text-dim bg-vault-panel border border-vault-border rounded px-2 py-0.5">
          #{gameId}
        </span>
      </div>

      {isLoading && (
        <div className="border border-vault-border rounded bg-vault-panel p-12 flex items-center justify-center gap-3">
          <Spinner size="w-5 h-5" />
          <span className="font-mono text-xs text-vault-text-dim tracking-wider uppercase">
            Loading game data...
          </span>
        </div>
      )}

      {error && (
        <div className="border border-signal-red/30 rounded bg-vault-panel p-8 text-center">
          <p className="font-mono text-xs text-signal-red tracking-wider uppercase">
            Failed to load game data
          </p>
        </div>
      )}

      {!isLoading && !error && state === GameState.OPEN && (
        <GameLobby gameId={gameId} />
      )}

      {!isLoading && !error && state === GameState.ACTIVE && (
        <VaultBench gameId={gameId} />
      )}

      {!isLoading && !error && state === GameState.COMPLETE && (
        <GameOver gameId={gameId} />
      )}
    </div>
  );
}
