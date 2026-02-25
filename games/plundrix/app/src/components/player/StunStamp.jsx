export default function StunStamp({ visible }) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className="bg-signal-red/5 absolute inset-0 rounded" />
      <div
        className="
          border-2 border-signal-red/60 px-4 py-1.5
          transform -rotate-12
        "
        style={{ backdropFilter: 'blur(1px)' }}
      >
        <span className="font-mono text-sm font-bold text-signal-red uppercase tracking-[0.25em] leading-none">
          Disoriented
        </span>
      </div>
    </div>
  );
}
