import { useEffect, useRef } from 'react';
import { truncateAddress } from '../../lib/formatting';

const EVENT_COLORS = {
  GameCreated: 'text-blueprint',
  PlayerJoined: 'text-oxide-green',
  GameStarted: 'text-tungsten',
  ActionSubmitted: 'text-vault-text-dim',
  RoundResolved: 'text-blueprint',
  LockCracked: 'text-tungsten',
  ToolFound: 'text-oxide-green',
  PlayerSabotaged: 'text-signal-red',
  PlayerStunned: 'text-signal-red-dim',
  GameWon: 'text-tungsten-bright',
};

const EVENT_ICONS = {
  GameCreated: '\u25C6',
  PlayerJoined: '+',
  GameStarted: '\u25B6',
  ActionSubmitted: '\u2022',
  RoundResolved: '\u2500',
  LockCracked: '\u2713',
  ToolFound: '\u2691',
  PlayerSabotaged: '\u2716',
  PlayerStunned: '\u26A1',
  GameWon: '\u2605',
};

function formatEventDescription(event) {
  const { name, args } = event;
  const addr = args?.player || args?.attacker || args?.winner;
  const short = addr ? truncateAddress(addr) : '';

  switch (name) {
    case 'GameCreated':
      return `Game #${args?.gameID?.toString()} created`;
    case 'PlayerJoined':
      return `${short} joined the operation`;
    case 'GameStarted':
      return `Operation is now active`;
    case 'ActionSubmitted':
      return `${short} submitted action`;
    case 'RoundResolved':
      return `Round ${args?.round?.toString()} resolved`;
    case 'LockCracked':
      return `${short} cracked lock #${args?.totalCracked?.toString()}`;
    case 'ToolFound':
      return `${short} found a tool (${args?.totalTools?.toString()} total)`;
    case 'PlayerSabotaged':
      return `${truncateAddress(args?.attacker)} sabotaged ${truncateAddress(args?.victim)}`;
    case 'PlayerStunned':
      return `${short} is stunned`;
    case 'GameWon':
      return `${truncateAddress(args?.winner)} breached the vault!`;
    default:
      return name;
  }
}

function formatTimestamp(ts) {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function EventLog({ events = [] }) {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom on new events
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events.length]);

  return (
    <div className="bg-vault-dark border border-vault-border rounded">
      {/* Header */}
      <div className="px-3 py-2 border-b border-vault-border">
        <h3 className="font-display tracking-widest text-xs text-vault-text-dim uppercase">
          Operation Log
        </h3>
      </div>

      {/* Event list */}
      <div
        ref={scrollRef}
        className="max-h-64 overflow-y-auto px-3 py-2 space-y-1"
      >
        {events.length === 0 && (
          <p className="font-mono text-xs text-vault-text-dim italic">
            No events recorded yet.
          </p>
        )}

        {events.map((event, i) => {
          const colorClass = EVENT_COLORS[event.name] || 'text-vault-text-dim';
          const icon = EVENT_ICONS[event.name] || '\u2022';

          return (
            <div
              key={`${event.transactionHash}-${event.name}-${i}`}
              className="flex items-start gap-2 font-mono text-xs leading-relaxed"
            >
              {/* Timestamp */}
              <span className="text-vault-text-dim shrink-0 tabular-nums">
                {formatTimestamp(event.timestamp)}
              </span>

              {/* Icon */}
              <span className={`${colorClass} shrink-0 w-3 text-center`}>
                {icon}
              </span>

              {/* Description */}
              <span className={colorClass}>
                {formatEventDescription(event)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
