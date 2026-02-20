import { describe, it, expect } from 'vitest';
import { getContractInstance } from './setup.js';

describe('HexplorationBoard', () => {
  const board = getContractInstance('HEXPLORATION_BOARD');

  it('getZoneAliases() returns non-empty array', async () => {
    const aliases = await board.read.getZoneAliases();
    expect(aliases.length).toBeGreaterThan(0);
  });

  it('gridWidth() returns value > 0', async () => {
    const width = await board.read.gridWidth();
    expect(Number(width)).toBeGreaterThan(0);
  });

  it('gridHeight() returns value > 0', async () => {
    const height = await board.read.gridHeight();
    expect(Number(height)).toBeGreaterThan(0);
  });

  it('hasOutput("1,1", "1,2") does not revert', async () => {
    const result = await board.read.hasOutput(['1,1', '1,2']);
    expect(typeof result).toBe('boolean');
  });
});
