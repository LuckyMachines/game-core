import { TOOL_NAMES, MAX_TOOLS } from '../../lib/constants';
import { TOOL_ICONS } from '../../lib/toolIcons';

const TOOL_DESCRIPTIONS = [
  'An L-shaped tension bar that keeps rotational pressure on the lock core while you work the pins.',
  'A wavy-profile pick that rapidly rakes across multiple pins at once — fast but imprecise.',
  'A straight pick with a hooked tip for surgically setting individual pins one by one.',
  'A thin flat blade that bypasses the shear line entirely by sliding between the plug and shell.',
  'A spring-loaded pick gun that bumps all pins simultaneously — the brute-force option.',
];

export default function SectionTools() {
  return (
    <div className="font-mono text-xs text-vault-text leading-relaxed">
      <h3 className="font-display tracking-[0.25em] text-tungsten uppercase text-xs mb-3
                     border-b border-vault-border pb-1">
        Equipment Manifest
      </h3>

      <div className="space-y-2">
        {TOOL_NAMES.map((name, i) => {
          const Icon = TOOL_ICONS[i];
          return (
            <div key={name} className="flex items-start gap-3 border border-vault-border rounded p-3 bg-vault-dark/40">
              <div className="w-8 h-8 flex items-center justify-center border border-tungsten/30 rounded bg-tungsten/5 shrink-0">
                <Icon className="w-5 h-5 text-tungsten-bright" />
              </div>
              <div>
                <span className="font-display tracking-widest uppercase text-sm text-tungsten">
                  {name}
                </span>
                <p className="text-vault-text mt-0.5">{TOOL_DESCRIPTIONS[i]}</p>
              </div>
            </div>
          );
        })}
      </div>

      <h3 className="font-display tracking-[0.25em] text-tungsten uppercase text-xs mb-2 mt-5
                     border-b border-vault-border pb-1">
        Impact Formula
      </h3>

      <p>
        Each tool increases your Pick success chance by <span className="text-tungsten">+15%</span>.
        Base chance is <span className="text-tungsten">40%</span> with zero tools, capped
        at <span className="text-tungsten">95%</span> with {MAX_TOOLS - 1}+ tools.
      </p>
      <p className="text-vault-text-dim mt-1 text-[10px]">
        Formula: min(40 + tools &times; 15, 95)
      </p>
    </div>
  );
}
