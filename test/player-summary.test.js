import { describe, it, expect } from 'vitest';
import { getContractInstance, deployments } from './setup.js';

describe('PlayerSummary', () => {
  const playerSummary = getContractInstance('PLAYER_SUMMARY');
  const boardAddress = deployments.XENOVOYA_BOARD;
  const zeroAddress = '0x0000000000000000000000000000000000000000';

  it('getPlayerID() does not revert for zero address', async () => {
    const playerID = await playerSummary.read.getPlayerID([
      boardAddress,
      1n,
      zeroAddress,
    ]);
    expect(Number(playerID)).toBe(0);
  });

  it('getPlayerAddress() does not revert for playerID 0', async () => {
    const playerAddress = await playerSummary.read.getPlayerAddress([
      boardAddress,
      1n,
      0n,
    ]);
    expect(playerAddress).toBeDefined();
  });
});
