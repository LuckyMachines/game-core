import { TOTAL_LOCKS, MIN_GAME_PLAYERS, MAX_GAME_PLAYERS, ROUND_TIMEOUT } from '../../lib/constants';

function SectionHeader({ children }) {
  return (
    <h3 className="font-display tracking-[0.25em] text-tungsten uppercase text-xs mb-2 mt-5 first:mt-0
                   border-b border-vault-border pb-1">
      {children}
    </h3>
  );
}

export default function SectionOverview() {
  return (
    <div className="font-mono text-xs text-vault-text leading-relaxed space-y-1">
      <SectionHeader>Objective</SectionHeader>
      <p>
        You are one of {MIN_GAME_PLAYERS}&ndash;{MAX_GAME_PLAYERS} operatives
        racing to crack a vault secured by <span className="text-tungsten">{TOTAL_LOCKS} locks</span>.
        The first player to pick all {TOTAL_LOCKS} locks wins the heist.
      </p>

      <SectionHeader>Round Flow</SectionHeader>
      <ol className="list-decimal list-inside space-y-1 pl-1">
        <li>
          <span className="text-vault-text-dim">Submit Phase</span> &mdash;
          Every operative secretly chooses one action (Pick, Search, or Sabotage)
          and submits it on-chain.
        </li>
        <li>
          <span className="text-vault-text-dim">Resolve Phase</span> &mdash;
          Once all actions are in (or the {ROUND_TIMEOUT / 60}-minute timer expires),
          anyone can trigger resolution. The contract evaluates each action using
          on-chain randomness.
        </li>
        <li>
          <span className="text-vault-text-dim">Next Round</span> &mdash;
          Results are revealed and a new round begins. Repeat until a winner emerges.
        </li>
      </ol>

      <SectionHeader>Stun Mechanic</SectionHeader>
      <p>
        If you are <span className="text-signal-red">stunned</span> by another
        player&rsquo;s Sabotage, your Pick action <em>automatically fails</em> for
        that round &mdash; your tools are jammed. Search still works but at
        reduced odds. Stun lasts one round and is cleared at the start of the
        next.
      </p>
    </div>
  );
}
