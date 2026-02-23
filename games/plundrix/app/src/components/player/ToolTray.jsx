import { MAX_TOOLS, TOOL_NAMES } from '../../lib/constants';
import { TOOL_ICONS } from '../../lib/toolIcons';

export default function ToolTray({ toolCount = 0 }) {
  const count = Number(toolCount);

  return (
    <div className="flex gap-2">
      {Array.from({ length: MAX_TOOLS }, (_, i) => {
        const filled = i < count;
        const Icon = TOOL_ICONS[i];
        return (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <div
              className={`
                w-7 h-7 flex items-center justify-center
                border rounded transition-all duration-300
                ${filled
                  ? 'border-tungsten/50 bg-tungsten/10 shadow-[0_0_6px_rgba(196,149,106,0.15)]'
                  : 'border-vault-border bg-vault-dark/40'
                }
              `}
            >
              <Icon
                className={`w-4 h-4 ${filled ? 'text-tungsten-bright' : 'text-vault-text-dim/40'}`}
              />
            </div>
            <span className={`
              font-mono text-[9px] uppercase leading-none
              ${filled ? 'text-vault-text-dim' : 'text-vault-text-dim/30'}
            `}>
              {TOOL_NAMES[i]?.split(' ').pop() || `T${i + 1}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
