#!/usr/bin/env node
/**
 * Deploy PlundrixGame to local Anvil and print the contract address.
 * Usage: node scripts/deploy-local.mjs
 */
import { createWalletClient, createPublicClient, http } from 'viem';
import { foundry } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Anvil account #0
const PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const account = privateKeyToAccount(PRIVATE_KEY);

const transport = http('http://127.0.0.1:8545');
const publicClient = createPublicClient({ chain: foundry, transport });
const walletClient = createWalletClient({ chain: foundry, transport, account });

// Load compiled artifact
const artifact = JSON.parse(
  readFileSync(resolve(root, 'out/PlundrixGame.sol/PlundrixGame.json'), 'utf8')
);
const abi = artifact.abi;
const bytecode = artifact.bytecode.object;

async function main() {
  console.log('Deploying PlundrixGame...');
  console.log('  Admin:', account.address);

  const hash = await walletClient.deployContract({
    abi,
    bytecode,
    args: [account.address],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log('  Contract deployed at:', receipt.contractAddress);
  console.log('  Tx hash:', hash);
  console.log('  Block:', Number(receipt.blockNumber));
  console.log('');
  console.log('CONTRACT_ADDRESS=' + receipt.contractAddress);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
