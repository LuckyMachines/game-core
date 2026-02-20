import { describe, it, expect } from 'vitest';
import { getContractInstance } from './setup.js';

const tokenKeys = [
  'DAY_NIGHT_TOKEN',
  'DISASTER_TOKEN',
  'ENEMY_TOKEN',
  'ITEM_TOKEN',
  'PLAYER_STATUS_TOKEN',
  'RELIC_TOKEN',
];

describe('Game Tokens', () => {
  for (const key of tokenKeys) {
    describe(key, () => {
      const token = getContractInstance(key);

      it(`getTokenTypes() returns non-empty array`, async () => {
        const types = await token.read.getTokenTypes();
        expect(types.length).toBeGreaterThan(0);
      });
    });
  }
});
