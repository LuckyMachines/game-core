import { describe, it, expect } from 'vitest';
import { getContractInstance } from './setup.js';

describe('HexplorationGameplay', () => {
  const gameplay = getContractInstance('GAMEPLAY');

  it('shouldProgressLoop() does not revert', async () => {
    const result = await gameplay.read.shouldProgressLoop();
    expect(result).toBeDefined();
  });
});
