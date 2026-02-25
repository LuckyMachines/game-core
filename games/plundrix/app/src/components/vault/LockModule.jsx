const LOCK_VARIANTS = [
  // Variant 0: Classic padlock — rounded top
  {
    body: 'M8 14h16v12H8z',
    shackle: 'M12 14V9a4 4 0 018 0v5',
    shackleOpen: 'M12 14V9a4 4 0 018 0v-2',
    border: 'rounded-lg',
  },
  // Variant 1: Square padlock — flat top
  {
    body: 'M7 15h18v11H7z',
    shackle: 'M11 15v-4a5 5 0 0110 0v4',
    shackleOpen: 'M11 15v-4a5 5 0 0110 0v-3',
    border: 'rounded',
  },
  // Variant 2: Tall padlock — elongated body
  {
    body: 'M9 13h14v14H9z',
    shackle: 'M13 13V8a3 3 0 016 0v5',
    shackleOpen: 'M13 13V8a3 3 0 016 0v-2',
    border: 'rounded-md',
  },
  // Variant 3: Wide padlock — broad body
  {
    body: 'M6 15h20v10H6z',
    shackle: 'M11 15v-5a5 5 0 0110 0v5',
    shackleOpen: 'M11 15v-5a5 5 0 0110 0v-3',
    border: 'rounded-lg',
  },
  // Variant 4: Shield padlock — tapered bottom
  {
    body: 'M8 14h16v8l-8 4-8-4z',
    shackle: 'M12 14V9a4 4 0 018 0v5',
    shackleOpen: 'M12 14V9a4 4 0 018 0v-2',
    border: 'rounded-t-lg',
  },
];

export default function LockModule({ index = 0, cracked = false }) {
  const variant = LOCK_VARIANTS[index % LOCK_VARIANTS.length];

  return (
    <div
      className={`
        relative flex flex-col items-center justify-center
        w-12 h-16 sm:w-16 sm:h-20 lg:w-14 lg:h-18 xl:w-16 xl:h-20
        min-w-0 shrink
        ${variant.border}
        border-2 transition-all duration-500
        ${cracked
          ? 'border-tungsten bg-tungsten/10 shadow-[0_0_12px_rgba(196,149,106,0.25)]'
          : 'border-vault-border bg-vault-surface'
        }
      `}
    >
      {/* Lock SVG */}
      <svg
        viewBox="0 0 32 32"
        className={`w-6 h-6 sm:w-8 sm:h-8 transition-colors duration-500 ${
          cracked ? 'text-tungsten-bright' : 'text-vault-text-dim'
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={cracked ? variant.shackleOpen : variant.shackle} />
        <path d={variant.body} fill={cracked ? 'currentColor' : 'none'} fillOpacity={cracked ? 0.15 : 0} />
        {/* Keyhole */}
        <circle cx="16" cy="21" r="1.5" fill="currentColor" fillOpacity={0.5} />
      </svg>

      {/* Label */}
      <span className={`
        font-mono text-[9px] uppercase tracking-widest mt-1
        ${cracked ? 'text-tungsten-bright' : 'text-vault-text-dim'}
      `}>
        {cracked ? 'CRACKED' : `LOCK ${index + 1}`}
      </span>

      {/* Cracked stamp overlay */}
      {cracked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 rounded border border-tungsten/20" />
        </div>
      )}
    </div>
  );
}
