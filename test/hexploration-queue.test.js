import { describe, it, expect } from 'vitest';
import { getContractInstance } from './setup.js';

describe('HexplorationQueue', () => {
  const queue = getContractInstance('GAME_QUEUE');

  it('useChainlinkVRF() returns true on Sepolia', async () => {
    const usesChainlink = await queue.read.useChainlinkVRF();
    expect(usesChainlink).toBe(true);
  });

  it('testingEnabled() returns a boolean', async () => {
    const testing = await queue.read.testingEnabled();
    expect(typeof testing).toBe('boolean');
  });
});
