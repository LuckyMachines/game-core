import { describe, it, expect } from 'vitest';
import { getContractInstance, deployments } from './setup.js';

describe('GameSummary', () => {
  const gameSummary = getContractInstance('GAME_SUMMARY');
  const boardAddress = deployments.XENOVOYA_BOARD;
  const registryAddress = deployments.GAME_REGISTRY;

  it('boardSize() returns valid rows and columns > 0', async () => {
    const [rows, columns] = await gameSummary.read.boardSize([boardAddress]);
    expect(Number(rows)).toBeGreaterThan(0);
    expect(Number(columns)).toBeGreaterThan(0);
  });

  it('getAvailableGames() does not revert', async () => {
    const result = await gameSummary.read.getAvailableGames([
      boardAddress,
      registryAddress,
    ]);
    expect(result).toBeDefined();
  });
});
