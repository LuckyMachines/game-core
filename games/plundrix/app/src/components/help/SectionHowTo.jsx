const STEPS = [
  {
    num: 1,
    title: 'Connect Wallet',
    desc: 'Connect a Web3 wallet (MetaMask, WalletConnect, etc.) on the Sepolia test network.',
  },
  {
    num: 2,
    title: 'Create or Join',
    desc: 'Start a new heist from the home page, or join an open game from the browser.',
  },
  {
    num: 3,
    title: 'Wait for Launch',
    desc: 'The game begins once 2\u20134 operatives have joined the lobby.',
  },
  {
    num: 4,
    title: 'Choose Action',
    desc: 'Each round, select Pick, Search, or Sabotage. Consider your tools, stun status, and opponents\u2019 progress.',
  },
  {
    num: 5,
    title: 'Submit On-Chain',
    desc: 'Confirm the transaction in your wallet. Your action is committed to the smart contract.',
  },
  {
    num: 6,
    title: 'Watch Resolution',
    desc: 'Once all players submit (or the timer expires), trigger resolution to reveal outcomes.',
  },
  {
    num: 7,
    title: 'Repeat Until Victory',
    desc: 'Continue round by round. First operative to crack all 5 locks wins the heist.',
  },
];

const TIPS = [
  'Early rounds: Search for tools to build your success rate before picking.',
  'Sabotage the leader: If an opponent is one lock away from winning, stun them to buy time.',
  'Don\u2019t hoard tools: Once you have 3\u20134 tools your pick chance is strong \u2014 start cracking locks.',
  'Watch the timer: If an opponent doesn\u2019t submit, the round can still resolve after timeout.',
];

export default function SectionHowTo() {
  return (
    <div className="font-mono text-xs text-vault-text leading-relaxed">
      <h3 className="font-display tracking-[0.25em] text-tungsten uppercase text-xs mb-3
                     border-b border-vault-border pb-1">
        Step-by-Step Tutorial
      </h3>

      <div className="space-y-2">
        {STEPS.map((s) => (
          <div key={s.num} className="flex items-start gap-3">
            <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full
                           border border-tungsten/40 bg-tungsten/10 text-tungsten text-[10px] font-bold">
              {s.num}
            </span>
            <div>
              <span className="text-vault-text font-display tracking-widest uppercase text-sm">
                {s.title}
              </span>
              <p className="text-vault-text-dim mt-0.5">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h3 className="font-display tracking-[0.25em] text-tungsten uppercase text-xs mb-2 mt-5
                     border-b border-vault-border pb-1">
        Strategy Notes
      </h3>

      <ul className="list-disc list-inside space-y-1 pl-1 text-vault-text-dim">
        {TIPS.map((tip, i) => (
          <li key={i}>{tip}</li>
        ))}
      </ul>
    </div>
  );
}
