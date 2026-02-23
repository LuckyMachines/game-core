import { Action, ACTION_LABELS } from '../../lib/constants';
import { pickChance, searchChance } from '../../lib/formatting';

const ACTIONS = [
  {
    action: Action.PICK,
    name: 'Pick',
    label: ACTION_LABELS[Action.PICK],
    color: 'border-tungsten/40 text-tungsten',
    desc: 'Attempt to crack the next lock. Success chance scales with your tool count. If stunned, automatically fails.',
  },
  {
    action: Action.SEARCH,
    name: 'Search',
    label: ACTION_LABELS[Action.SEARCH],
    color: 'border-oxide-green/40 text-oxide-green',
    desc: 'Sweep a compartment for equipment. 60% chance to find a tool (30% if stunned). Max 5 tools.',
  },
  {
    action: Action.SABOTAGE,
    name: 'Sabotage',
    label: ACTION_LABELS[Action.SABOTAGE],
    color: 'border-signal-red/40 text-signal-red',
    desc: 'Target another operative to stun them for one round, jamming their tools and negating their Pick.',
  },
];

const TOOL_COUNTS = [0, 1, 2, 3, 4];

export default function SectionActions() {
  return (
    <div className="font-mono text-xs text-vault-text leading-relaxed space-y-1">
      <h3 className="font-display tracking-[0.25em] text-tungsten uppercase text-xs mb-3
                     border-b border-vault-border pb-1">
        Available Actions
      </h3>

      <div className="space-y-3">
        {ACTIONS.map((a) => (
          <div key={a.action} className={`border rounded p-3 bg-vault-dark/40 ${a.color}`}>
            <div className="flex items-baseline justify-between mb-1">
              <span className="font-display tracking-widest uppercase text-sm">{a.name}</span>
              <span className="text-vault-text-dim text-[10px] tracking-wider">{a.label}</span>
            </div>
            <p className="text-vault-text">{a.desc}</p>
          </div>
        ))}
      </div>

      <h3 className="font-display tracking-[0.25em] text-tungsten uppercase text-xs mb-2 mt-5
                     border-b border-vault-border pb-1">
        Pick Probability Table
      </h3>

      <div className="border border-vault-border rounded overflow-hidden">
        <table className="w-full text-center">
          <thead>
            <tr className="bg-vault-dark text-vault-text-dim text-[10px] uppercase tracking-wider">
              <th className="px-3 py-2 text-left">Tools</th>
              <th className="px-3 py-2">Normal</th>
              <th className="px-3 py-2">Stunned</th>
            </tr>
          </thead>
          <tbody>
            {TOOL_COUNTS.map((t) => (
              <tr key={t} className="border-t border-vault-border">
                <td className="px-3 py-1.5 text-left text-vault-text-dim">{t}{t >= 4 ? '+' : ''}</td>
                <td className="px-3 py-1.5 text-tungsten">{pickChance(t, false)}%</td>
                <td className="px-3 py-1.5 text-signal-red">{pickChance(t, true)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-vault-text-dim text-[10px] mt-2">
        Search success: {searchChance(false)}% normal / {searchChance(true)}% stunned.
        Sabotage always succeeds but costs your action for the round.
      </p>
    </div>
  );
}
