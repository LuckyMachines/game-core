import { describe, it, expect } from 'vitest';
import { getContractInstance } from './setup.js';

describe('GameSetup', () => {
  const gameSetup = getContractInstance('GAME_SETUP');

  it('shouldProgressLoop() does not revert', async () => {
    const result = await gameSetup.read.shouldProgressLoop();
    expect(result).toBeDefined();
  });

  it('useChainlinkVRF() returns true on Sepolia', async () => {
    const usesChainlink = await gameSetup.read.useChainlinkVRF();
    expect(usesChainlink).toBe(true);
  });
});
