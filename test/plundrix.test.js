import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  createPublicClient,
  createWalletClient,
  createTestClient,
  http,
  parseEventLogs,
  zeroAddress,
} from 'viem';
import { foundry } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const artifact = JSON.parse(
  readFileSync(
    resolve(root, 'out/PlundrixGame.sol/PlundrixGame.json'),
    'utf8'
  )
);
const abi = artifact.abi;
const bytecode = artifact.bytecode.object;

const ANVIL_PORT = 8546;
const RPC_URL = `http://127.0.0.1:${ANVIL_PORT}`;

// Anvil default pre-funded accounts
const keys = [
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
  '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
  '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
];

// Action enum values
const PICK = 1;
const SEARCH = 2;
const SABOTAGE = 3;

let anvilProcess;
let publicClient;
let testClient;
let wallets;
let contractAddress;

function startAnvil() {
  return new Promise((resolvePromise, reject) => {
    anvilProcess = spawn('anvil', ['--port', String(ANVIL_PORT)], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let output = '';
    const onData = (data) => {
      output += data.toString();
      if (output.includes('Listening on')) {
        resolvePromise();
      }
    };

    anvilProcess.stdout.on('data', onData);
    anvilProcess.stderr.on('data', onData);
    anvilProcess.on('error', reject);

    setTimeout(() => reject(new Error('Anvil startup timeout')), 15000);
  });
}

// --- Helpers ---

async function deploy() {
  const hash = await wallets[0].deployContract({
    abi,
    bytecode,
    args: [wallets[0].account.address],
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return receipt.contractAddress;
}

async function exec(walletIndex, functionName, args = []) {
  const hash = await wallets[walletIndex].writeContract({
    address: contractAddress,
    abi,
    functionName,
    args,
  });
  return publicClient.waitForTransactionReceipt({ hash });
}

async function read(functionName, args = []) {
  return publicClient.readContract({
    address: contractAddress,
    abi,
    functionName,
    args,
  });
}

function getEvents(receipt, eventName) {
  return parseEventLogs({ abi, logs: receipt.logs, eventName });
}

async function setupGame(playerWalletIndices) {
  const receipt = await exec(0, 'createGame');
  const events = getEvents(receipt, 'GameCreated');
  const gameId = events[0].args.gameID;

  for (const i of playerWalletIndices) {
    await exec(i, 'registerPlayer', [gameId]);
  }

  await exec(0, 'startGame', [gameId]);
  return gameId;
}

function addr(walletIndex) {
  return wallets[walletIndex].account.address;
}

// --- Test Suite ---

describe('PlundrixGame', () => {
  beforeAll(async () => {
    await startAnvil();

    publicClient = createPublicClient({
      chain: foundry,
      transport: http(RPC_URL),
    });

    testClient = createTestClient({
      chain: foundry,
      transport: http(RPC_URL),
      mode: 'anvil',
    });

    wallets = keys.map((key) =>
      createWalletClient({
        account: privateKeyToAccount(key),
        chain: foundry,
        transport: http(RPC_URL),
      })
    );

    contractAddress = await deploy();
  });

  afterAll(() => {
    if (anvilProcess) anvilProcess.kill();
  });

  // --- Deployment ---

  describe('deployment', () => {
    it('has zero total games initially', async () => {
      const total = await read('totalGames');
      expect(total).toBe(0n);
    });

    it('deployer has DEFAULT_ADMIN_ROLE', async () => {
      const role = await read('DEFAULT_ADMIN_ROLE');
      const has = await read('hasRole', [role, addr(0)]);
      expect(has).toBe(true);
    });

    it('deployer has GAME_MASTER_ROLE', async () => {
      const role = await read('GAME_MASTER_ROLE');
      const has = await read('hasRole', [role, addr(0)]);
      expect(has).toBe(true);
    });

    it('non-admin does not have GAME_MASTER_ROLE', async () => {
      const role = await read('GAME_MASTER_ROLE');
      const has = await read('hasRole', [role, addr(1)]);
      expect(has).toBe(false);
    });
  });

  // --- Constants ---

  describe('constants', () => {
    it('TOTAL_LOCKS is 5', async () => {
      expect(await read('TOTAL_LOCKS')).toBe(5n);
    });

    it('MAX_TOOLS is 5', async () => {
      expect(await read('MAX_TOOLS')).toBe(5n);
    });

    it('MAX_GAME_PLAYERS is 4', async () => {
      expect(await read('MAX_GAME_PLAYERS')).toBe(4n);
    });

    it('MIN_GAME_PLAYERS is 2', async () => {
      expect(await read('MIN_GAME_PLAYERS')).toBe(2n);
    });

    it('ROUND_TIMEOUT is 300 (5 minutes)', async () => {
      expect(await read('ROUND_TIMEOUT')).toBe(300n);
    });
  });

  // --- Game Creation & Registration ---

  describe('game creation and registration', () => {
    let gameId;

    it('creates a game and emits GameCreated', async () => {
      const receipt = await exec(0, 'createGame');
      const events = getEvents(receipt, 'GameCreated');
      expect(events.length).toBe(1);
      gameId = events[0].args.gameID;
      expect(gameId).toBe(1n);
      expect(events[0].args.creator).toBe(addr(0));
    });

    it('increments totalGames', async () => {
      expect(await read('totalGames')).toBe(1n);
    });

    it('game starts in OPEN state', async () => {
      const info = await read('getGameInfo', [gameId]);
      expect(Number(info[0])).toBe(0); // OPEN
      expect(info[2]).toBe(0n); // playerCount
    });

    it('registers player and emits PlayerJoined', async () => {
      const receipt = await exec(1, 'registerPlayer', [gameId]);
      const events = getEvents(receipt, 'PlayerJoined');
      expect(events.length).toBe(1);
      expect(events[0].args.player).toBe(addr(1));
      expect(events[0].args.playerIndex).toBe(1n);
    });

    it('rejects duplicate registration', async () => {
      await expect(exec(1, 'registerPlayer', [gameId])).rejects.toThrow(
        /Already registered/
      );
    });

    it('registers additional players', async () => {
      await exec(2, 'registerPlayer', [gameId]);
      await exec(3, 'registerPlayer', [gameId]);
      await exec(4, 'registerPlayer', [gameId]);
      const info = await read('getGameInfo', [gameId]);
      expect(info[2]).toBe(4n); // playerCount
    });

    it('rejects 5th player (game full)', async () => {
      await expect(exec(0, 'registerPlayer', [gameId])).rejects.toThrow(
        /Game is full/
      );
    });

    it('getPlayerAddress returns correct addresses', async () => {
      expect(await read('getPlayerAddress', [gameId, 1n])).toBe(addr(1));
      expect(await read('getPlayerAddress', [gameId, 2n])).toBe(addr(2));
      expect(await read('getPlayerAddress', [gameId, 3n])).toBe(addr(3));
      expect(await read('getPlayerAddress', [gameId, 4n])).toBe(addr(4));
    });

    it('getPlayerState shows registered with zero progress', async () => {
      const state = await read('getPlayerState', [gameId, addr(1)]);
      expect(state[0]).toBe(0n); // locksCracked
      expect(state[1]).toBe(0n); // tools
      expect(state[2]).toBe(false); // stunned
      expect(state[3]).toBe(true); // registered
      expect(state[4]).toBe(false); // actionSubmitted
    });

    it('getPlayerState returns zeroes for non-player', async () => {
      const state = await read('getPlayerState', [gameId, addr(0)]);
      expect(state[3]).toBe(false); // not registered
    });
  });

  // --- Game Start ---

  describe('game start', () => {
    let gameId;

    beforeAll(async () => {
      const receipt = await exec(0, 'createGame');
      gameId = getEvents(receipt, 'GameCreated')[0].args.gameID;
      await exec(1, 'registerPlayer', [gameId]);
      await exec(2, 'registerPlayer', [gameId]);
    });

    it('rejects start from non-GM account', async () => {
      await expect(exec(1, 'startGame', [gameId])).rejects.toThrow();
    });

    it('rejects start with fewer than 2 players', async () => {
      const r = await exec(0, 'createGame');
      const soloId = getEvents(r, 'GameCreated')[0].args.gameID;
      await exec(1, 'registerPlayer', [soloId]);
      await expect(exec(0, 'startGame', [soloId])).rejects.toThrow(
        /Not enough players/
      );
    });

    it('starts the game and emits GameStarted', async () => {
      const receipt = await exec(0, 'startGame', [gameId]);
      const events = getEvents(receipt, 'GameStarted');
      expect(events.length).toBe(1);
      expect(events[0].args.gameID).toBe(gameId);
    });

    it('game is ACTIVE at round 1', async () => {
      const info = await read('getGameInfo', [gameId]);
      expect(Number(info[0])).toBe(1); // ACTIVE
      expect(info[1]).toBe(1n); // currentRound
    });

    it('rejects registration on active game', async () => {
      await expect(exec(3, 'registerPlayer', [gameId])).rejects.toThrow(
        /Game not open/
      );
    });

    it('rejects starting an already active game', async () => {
      await expect(exec(0, 'startGame', [gameId])).rejects.toThrow(
        /Game not open/
      );
    });
  });

  // --- Action Submission & Round Resolution ---

  describe('action submission and round resolution', () => {
    let gameId;

    beforeAll(async () => {
      gameId = await setupGame([1, 2]);
    });

    it('submits PICK and emits ActionSubmitted', async () => {
      const receipt = await exec(1, 'submitAction', [gameId, PICK, zeroAddress]);
      const events = getEvents(receipt, 'ActionSubmitted');
      expect(events.length).toBe(1);
      expect(events[0].args.player).toBe(addr(1));
      expect(events[0].args.round).toBe(1n);
    });

    it('player state shows actionSubmitted = true', async () => {
      const state = await read('getPlayerState', [gameId, addr(1)]);
      expect(state[4]).toBe(true); // actionSubmitted
    });

    it('rejects duplicate action in same round', async () => {
      await expect(
        exec(1, 'submitAction', [gameId, SEARCH, zeroAddress])
      ).rejects.toThrow(/Action already submitted/);
    });

    it('allActionsSubmitted is false with one pending', async () => {
      expect(await read('allActionsSubmitted', [gameId])).toBe(false);
    });

    it('rejects resolve when not all submitted and timeout not reached', async () => {
      await expect(exec(0, 'resolveRound', [gameId])).rejects.toThrow();
    });

    it('rejects action from non-player', async () => {
      await expect(
        exec(0, 'submitAction', [gameId, PICK, zeroAddress])
      ).rejects.toThrow(/Not a registered player/);
    });

    it('submits second player action', async () => {
      await exec(2, 'submitAction', [gameId, SEARCH, zeroAddress]);
    });

    it('allActionsSubmitted is true', async () => {
      expect(await read('allActionsSubmitted', [gameId])).toBe(true);
    });

    it('resolves round and emits RoundResolved', async () => {
      const receipt = await exec(0, 'resolveRound', [gameId]);
      const events = getEvents(receipt, 'RoundResolved');
      expect(events.length).toBe(1);
      expect(events[0].args.round).toBe(1n);
    });

    it('advances to round 2', async () => {
      const info = await read('getGameInfo', [gameId]);
      if (Number(info[0]) === 1) {
        expect(info[1]).toBe(2n);
      }
    });

    it('clears pending actions after resolution', async () => {
      const state = await read('getPlayerState', [gameId, addr(1)]);
      expect(state[4]).toBe(false); // actionSubmitted cleared
    });
  });

  // --- Input Validation ---

  describe('input validation', () => {
    let gameId;

    beforeAll(async () => {
      gameId = await setupGame([1, 2]);
    });

    it('rejects NONE action (enum value 0)', async () => {
      await expect(
        exec(1, 'submitAction', [gameId, 0, zeroAddress])
      ).rejects.toThrow(/Invalid action/);
    });

    it('rejects self-sabotage', async () => {
      await expect(
        exec(1, 'submitAction', [gameId, SABOTAGE, addr(1)])
      ).rejects.toThrow(/Cannot sabotage yourself/);
    });

    it('rejects sabotage targeting non-player', async () => {
      await expect(
        exec(1, 'submitAction', [gameId, SABOTAGE, addr(0)])
      ).rejects.toThrow(/Target not in game/);
    });

    it('accepts valid sabotage targeting another player', async () => {
      const receipt = await exec(1, 'submitAction', [gameId, SABOTAGE, addr(2)]);
      const events = getEvents(receipt, 'ActionSubmitted');
      expect(events.length).toBe(1);
    });
  });

  // --- Stun Mechanics & Tool Theft ---

  describe('stun mechanics and tool theft', () => {
    let gameId;

    beforeAll(async () => {
      gameId = await setupGame([1, 2]);

      // Both players SEARCH until Player 2 has at least 1 tool
      let p2Tools = 0n;
      let rounds = 0;
      while (p2Tools === 0n && rounds < 50) {
        await exec(1, 'submitAction', [gameId, SEARCH, zeroAddress]);
        await exec(2, 'submitAction', [gameId, SEARCH, zeroAddress]);
        await exec(0, 'resolveRound', [gameId]);
        const state = await read('getPlayerState', [gameId, addr(2)]);
        p2Tools = state[1];
        rounds++;
      }
    });

    it('player 2 has tools from searching', async () => {
      const state = await read('getPlayerState', [gameId, addr(2)]);
      expect(state[1]).toBeGreaterThan(0n);
    });

    it('sabotage stuns target, steals a tool, and emits events', async () => {
      const p1Before = await read('getPlayerState', [gameId, addr(1)]);
      const p2Before = await read('getPlayerState', [gameId, addr(2)]);

      // Player 1 SABOTAGEs Player 2, Player 2 PICKs
      await exec(1, 'submitAction', [gameId, SABOTAGE, addr(2)]);
      await exec(2, 'submitAction', [gameId, PICK, zeroAddress]);
      const receipt = await exec(0, 'resolveRound', [gameId]);

      // Verify events
      const sabotageEvents = getEvents(receipt, 'PlayerSabotaged');
      expect(sabotageEvents.length).toBe(1);
      expect(sabotageEvents[0].args.attacker).toBe(addr(1));
      expect(sabotageEvents[0].args.victim).toBe(addr(2));

      const stunEvents = getEvents(receipt, 'PlayerStunned');
      expect(stunEvents.length).toBe(1);
      expect(stunEvents[0].args.player).toBe(addr(2));

      // Verify tool theft
      const p1After = await read('getPlayerState', [gameId, addr(1)]);
      const p2After = await read('getPlayerState', [gameId, addr(2)]);
      expect(p1After[1]).toBe(p1Before[1] + 1n); // gained 1 tool
      expect(p2After[1]).toBe(p2Before[1] - 1n); // lost 1 tool

      // Verify stun applied
      expect(p2After[2]).toBe(true);
    });

    it('stunned player PICK auto-fails', async () => {
      // Confirm Player 2 is stunned
      const p2Before = await read('getPlayerState', [gameId, addr(2)]);
      expect(p2Before[2]).toBe(true);
      const locksBefore = p2Before[0];

      // Player 2 PICKs while stunned (should auto-fail)
      await exec(1, 'submitAction', [gameId, SEARCH, zeroAddress]);
      await exec(2, 'submitAction', [gameId, PICK, zeroAddress]);
      await exec(0, 'resolveRound', [gameId]);

      const p2After = await read('getPlayerState', [gameId, addr(2)]);
      expect(p2After[0]).toBe(locksBefore); // locksCracked unchanged
    });

    it('stun clears after one round', async () => {
      const state = await read('getPlayerState', [gameId, addr(2)]);
      expect(state[2]).toBe(false); // no longer stunned
    });
  });

  // --- Timeout Resolution ---

  describe('timeout resolution', () => {
    let gameId;

    beforeAll(async () => {
      gameId = await setupGame([1, 2]);
    });

    it('rejects resolve before timeout when not all submitted', async () => {
      await exec(1, 'submitAction', [gameId, PICK, zeroAddress]);
      await expect(exec(0, 'resolveRound', [gameId])).rejects.toThrow();
    });

    it('resolves after ROUND_TIMEOUT with partial submissions', async () => {
      // Advance time past 5-minute timeout
      await testClient.increaseTime({ seconds: 301 });
      await testClient.mine({ blocks: 1 });

      const receipt = await exec(0, 'resolveRound', [gameId]);
      const events = getEvents(receipt, 'RoundResolved');
      expect(events.length).toBe(1);
      expect(events[0].args.round).toBe(1n);
    });

    it('non-submitting player is unaffected (no crash)', async () => {
      // Player 2 did not submit in round 1 but game should still advance
      const info = await read('getGameInfo', [gameId]);
      expect(Number(info[0])).toBe(1); // still ACTIVE
      expect(info[1]).toBe(2n); // round 2
    });
  });

  // --- Full Game Playthrough ---

  describe('full game playthrough', () => {
    it('plays until a winner is found', async () => {
      const gameId = await setupGame([1, 2]);

      let gameState = 1; // ACTIVE
      let round = 0;
      let lastReceipt;

      while (gameState === 1 && round < 100) {
        await exec(1, 'submitAction', [gameId, PICK, zeroAddress]);
        await exec(2, 'submitAction', [gameId, PICK, zeroAddress]);
        lastReceipt = await exec(0, 'resolveRound', [gameId]);
        round++;

        const info = await read('getGameInfo', [gameId]);
        gameState = Number(info[0]);
      }

      // With 40% success per PICK over 100 rounds, a win is virtually certain
      expect(gameState).toBe(2); // COMPLETE

      // Verify GameWon event on the winning round
      const wonEvents = getEvents(lastReceipt, 'GameWon');
      expect(wonEvents.length).toBe(1);

      // Winner is one of the two players
      const info = await read('getGameInfo', [gameId]);
      const winner = info[4];
      expect(winner === addr(1) || winner === addr(2)).toBe(true);

      // Winner has >= 5 locks cracked
      const winnerState = await read('getPlayerState', [gameId, winner]);
      expect(winnerState[0]).toBeGreaterThanOrEqual(5n);
    });

    it('rejects actions on completed game', async () => {
      // Find a completed game
      const total = await read('totalGames');
      let completedGameId;
      for (let i = 1n; i <= total; i++) {
        const info = await read('getGameInfo', [i]);
        if (Number(info[0]) === 2) {
          completedGameId = i;
          break;
        }
      }
      expect(completedGameId).toBeDefined();

      await expect(
        exec(1, 'submitAction', [completedGameId, PICK, zeroAddress])
      ).rejects.toThrow(/Game not active/);
    });
  });
});
