import GameBrowser from '../components/game/GameBrowser';

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-widest text-tungsten uppercase mb-2 font-display">
        Operations Console
      </h1>
      <p className="text-vault-text-dim font-mono text-sm mb-8">
        Select a game or create a new session
      </p>
      <GameBrowser />
    </div>
  );
}
