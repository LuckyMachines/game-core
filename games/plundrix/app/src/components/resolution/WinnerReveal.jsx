import { truncateAddress } from '../../lib/formatting';

export default function WinnerReveal({ winner, rounds, isCurrentUser }) {
  return (
    <div className="relative overflow-hidden rounded border border-tungsten-bright/30 bg-vault-dark p-8 text-center">
      {/* Light spill effect - radial gradient glow from center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(218,165,32,0.15) 0%, rgba(218,165,32,0.05) 40%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 space-y-4">
        {/* Heading */}
        <h2 className="text-2xl font-display font-bold tracking-[0.3em] text-tungsten-bright uppercase">
          Vault Breached
        </h2>

        {/* Winner stamp */}
        {isCurrentUser && (
          <div className="inline-block border-2 border-tungsten-bright/50 rounded px-4 py-1 rotate-[-3deg]">
            <span className="font-display text-lg tracking-[0.4em] text-tungsten-bright uppercase font-bold">
              You Win
            </span>
          </div>
        )}

        {/* Winner address */}
        <div className="space-y-1">
          <p className="font-display text-xs tracking-widest text-vault-text-dim uppercase">
            Operator
          </p>
          <p className="font-mono text-sm text-tungsten">
            {truncateAddress(winner)}
          </p>
        </div>

        {/* Round count */}
        <div className="space-y-1">
          <p className="font-display text-xs tracking-widest text-vault-text-dim uppercase">
            Rounds Taken
          </p>
          <p className="font-mono text-2xl text-tungsten-bright tabular-nums">
            {rounds?.toString()}
          </p>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <div className="h-px w-12 bg-tungsten/30" />
          <span className="text-tungsten/40 text-xs">&#9670;</span>
          <div className="h-px w-12 bg-tungsten/30" />
        </div>
      </div>
    </div>
  );
}
