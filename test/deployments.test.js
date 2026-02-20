import { describe, it, expect } from 'vitest';
import { client, deployments } from './setup.js';

// Filter to only valid non-zero Ethereum addresses (42 chars, starts with 0x)
const addressEntries = Object.entries(deployments).filter(
  ([, value]) =>
    typeof value === 'string' &&
    value.startsWith('0x') &&
    value.length === 42 &&
    value !== '0x0000000000000000000000000000000000000000'
);

describe('Sepolia deployments — all addresses have bytecode', () => {
  it.each(addressEntries)('%s is a deployed contract', async (name, address) => {
    const code = await client.getCode({ address });
    expect(code).not.toBe('0x');
    expect(code.length).toBeGreaterThan(2);
  });
});
