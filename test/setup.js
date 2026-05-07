import 'dotenv/config';
import { createPublicClient, http, getContract } from 'viem';
import { sepolia } from 'viem/chains';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const rpcUrl = process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';

export const client = createPublicClient({
  chain: sepolia,
  transport: http(rpcUrl),
});

export const deployments = JSON.parse(
  readFileSync(resolve(root, 'games/xenovoya/deployments.json'), 'utf8')
).sepolia;

const abiMap = {
  GAME_SUMMARY: 'GameSummary',
  PLAYER_SUMMARY: 'PlayerSummary',
  XENOVOYA_BOARD: 'XenovoyaBoard',
  XENOVOYA_CONTROLLER: 'XenovoyaController',
  GAMEPLAY: 'XenovoyaGameplay',
  GAMEPLAY_UPDATES: 'XenovoyaGameplay',
  GAME_QUEUE: 'XenovoyaQueue',
  EVENT_DECK: 'CardDeck',
  AMBUSH_DECK: 'CardDeck',
  LAND_DECK: 'CardDeck',
  TREASURE_DECK: 'CardDeck',
  RELIC_DECK: 'CardDeck',
  DAY_NIGHT_TOKEN: 'GameToken',
  DISASTER_TOKEN: 'GameToken',
  ENEMY_TOKEN: 'GameToken',
  ITEM_TOKEN: 'GameToken',
  PLAYER_STATUS_TOKEN: 'GameToken',
  RELIC_TOKEN: 'GameToken',
  GAME_SETUP: 'GameSetup',
  GAME_EVENTS: 'GameEvents',
  PLAY_ZONE_SUMMARY: 'PlayZoneSummary',
};

const abiCache = {};

function loadAbi(name) {
  if (!abiCache[name]) {
    abiCache[name] = JSON.parse(
      readFileSync(resolve(root, `games/xenovoya/abi/${name}.json`), 'utf8')
    );
  }
  return abiCache[name];
}

export function getContractInstance(deploymentKey) {
  const address = deployments[deploymentKey];
  const abiName = abiMap[deploymentKey];
  if (!address || !abiName) return null;
  return getContract({
    address,
    abi: loadAbi(abiName),
    client,
  });
}
