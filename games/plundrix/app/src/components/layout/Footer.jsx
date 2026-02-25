import { useAccount } from 'wagmi';

export default function Footer() {
  const { chain, isConnected } = useAccount();

  return (
    <footer className="border-t border-vault-border bg-vault-surface/60 mt-auto">
      <div className="max-w-7xl mx-auto px-6 h-10 flex items-center justify-between text-xs font-mono text-vault-text-dim">
        <span className="tracking-wider uppercase">
          {isConnected && chain ? `${chain.name} // Chain ${chain.id}` : 'No network'}
        </span>
        <span className="tracking-[0.2em] text-tungsten/60 uppercase font-display font-semibold">
          Plundrix
        </span>
      </div>
    </footer>
  );
}
