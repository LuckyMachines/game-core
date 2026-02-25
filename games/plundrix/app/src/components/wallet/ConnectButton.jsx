import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

function truncateAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <button
        onClick={() => disconnect()}
        className="
          border border-vault-border bg-vault-panel
          hover:bg-vault-surface hover:border-tungsten/40
          text-vault-text font-mono text-xs tracking-wider
          px-4 py-2 rounded
          transition-colors duration-150 cursor-pointer
        "
      >
        {truncateAddress(address)}
      </button>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      className="
        border border-tungsten/50 bg-vault-panel
        hover:bg-tungsten/10 hover:border-tungsten
        text-tungsten font-display font-semibold text-sm tracking-widest uppercase
        px-5 py-2 rounded
        transition-colors duration-150 cursor-pointer
      "
    >
      Connect
    </button>
  );
}
