export default function ActionSeal({ visible }) {
  if (!visible) return null;

  return (
    <div className="flex items-center gap-1.5 mt-2">
      {/* Wax seal icon */}
      <svg
        className="w-4 h-4 text-blueprint"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        {/* Envelope body */}
        <rect x="1" y="4" width="14" height="10" rx="1" />
        {/* Flap */}
        <polyline points="1,4 8,9 15,4" />
        {/* Seal circle */}
        <circle cx="8" cy="11" r="2.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" />
      </svg>
      <span className="font-mono text-[10px] text-blueprint uppercase tracking-wider">
        Action Sealed
      </span>
    </div>
  );
}
