export const Action = { NONE: 0, PICK: 1, SEARCH: 2, SABOTAGE: 3 };
export const GameState = { OPEN: 0, ACTIVE: 1, COMPLETE: 2 };
export const TOTAL_LOCKS = 5;
export const MAX_TOOLS = 5;
export const MAX_GAME_PLAYERS = 4;
export const MIN_GAME_PLAYERS = 2;
export const ROUND_TIMEOUT = 300; // 5 minutes in seconds

export const ACTION_LABELS = {
  [Action.PICK]: 'Set Tension',
  [Action.SEARCH]: 'Sweep Compartment',
  [Action.SABOTAGE]: 'Cut Line',
};

export const STATE_LABELS = {
  [GameState.OPEN]: 'OPEN',
  [GameState.ACTIVE]: 'ACTIVE',
  [GameState.COMPLETE]: 'COMPLETE',
};

export const TOOL_NAMES = [
  'Torsion Wrench',
  'Rake',
  'Probe',
  'Shim',
  'Pick Gun',
];
