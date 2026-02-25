import { truncateAddress } from '../../lib/formatting';

export default function SearchResult({ player, totalTools, success }) {
  return (
    <div className="flex items-center justify-between bg-vault-dark border border-vault-border rounded px-4 py-3">
      <div className="flex items-center gap-3">
        {/* Search icon */}
        <div
          className={`w-8 h-8 rounded border flex items-center justify-center transition-all duration-500 ${
            success
              ? 'border-oxide-green/50 bg-oxide-green/10 text-oxide-green'
              : 'border-vault-border bg-vault-panel text-vault-text-dim'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            {/* Magnifying glass */}
            <circle cx="7" cy="7" r="4" />
            <line x1="10" y1="10" x2="14" y2="14" />
          </svg>
        </div>

        {/* Player address */}
        <span className="font-mono text-xs text-vault-text">
          {truncateAddress(player)}
        </span>
      </div>

      {/* Result stamp */}
      <div className="flex items-center gap-3">
        {success && (
          <span className="font-mono text-xs text-vault-text-dim tabular-nums">
            {totalTools?.toString()} tools
          </span>
        )}
        <span
          className={`font-display text-xs tracking-widest uppercase px-2 py-0.5 rounded border ${
            success
              ? 'text-oxide-green border-oxide-green/30 bg-oxide-green/5'
              : 'text-vault-text-dim border-vault-border bg-vault-panel'
          }`}
        >
          {success ? 'TOOL FOUND' : 'NOTHING'}
        </span>
      </div>
    </div>
  );
}
