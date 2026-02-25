# Plundrix

A single-zone heist game where 2-4 rival operatives compete to crack a vault with 5 locks. Each round, players choose one of three actions. First player to crack all 5 locks wins.

## Install Game Core

`yarn add @luckymachines/game-core`

or

`npm install @luckymachines/game-core`

## Import ABI

```js
import PlundrixABI from "@luckymachines/game-core/games/plundrix/abi/PlundrixGame.json";
```

---

# Architecture Overview

## Contract Diagram

```
┌───────────────────────────────┐
│         PlundrixGame          │  (Single self-contained contract)
│                               │
│  ┌─────────────────────────┐  │
│  │  RBAC (AccessControl)   │  │
│  │  DEFAULT_ADMIN_ROLE     │  │
│  │  GAME_MASTER_ROLE       │  │
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │  Game Lifecycle          │  │
│  │  OPEN → ACTIVE → COMPLETE│ │
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │  Player Registration    │  │
│  │  Built-in (2-4 players) │  │
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │  Turn Resolution        │  │
│  │  Pseudo-random (block   │  │
│  │  hash + keccak256)      │  │
│  └─────────────────────────┘  │
└───────────────────────────────┘
```

Unlike Hexploration (which uses multiple contracts, Chainlink VRF, and an autoloop keeper), Plundrix is intentionally minimal:

- **Single contract** -- no GameBoard, PlayZone, PlayerRegistry, GameEvents, or GameController needed
- **No VRF** -- uses on-chain pseudo-randomness (`keccak256(blockhash, gameID, round, timestamp, seed)`)
- **No autoloop** -- no `_gamesNeedUpdates` queue, no `runUpdate()`, no off-chain keeper
- **No external dependencies** beyond OpenZeppelin

---

# Game Rules

## Actions

Each round, every player submits one of three actions:

| Action | Effect | Success Rate |
|--------|--------|-------------|
| **PICK** | Attempt to crack a lock | Base 40% + 15% per tool held (max 95%). Auto-fails if stunned. |
| **SEARCH** | Look for lockpicking tools | 60% (30% if stunned). Tools accumulate up to max 5. |
| **SABOTAGE** | Target another player | Always succeeds. Stuns target for 1 round. Steals 1 tool if target has any. |

## Win Condition

First player to crack all **5 locks** wins the game.

## Stun Mechanic

- A sabotaged player is **stunned** for the following round
- Stunned players: PICK auto-fails, SEARCH drops to 30% success
- Stun clears after one round of being affected
- Sabotage itself is not affected by stun

## Round Resolution Order

1. **PICK and SEARCH** actions resolve first (using current stun state)
2. **Existing stuns** are cleared
3. **SABOTAGE** actions resolve (applying new stuns for next round, stealing tools)
4. **Winner check** -- if any player has cracked all 5 locks, game ends
5. **Round advances** if no winner

## Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `TOTAL_LOCKS` | 5 | Locks to crack to win |
| `MAX_TOOLS` | 5 | Maximum tools a player can hold |
| `MAX_GAME_PLAYERS` | 4 | Maximum players per game |
| `MIN_GAME_PLAYERS` | 2 | Minimum players to start |
| `ROUND_TIMEOUT` | 5 minutes | Time before round can resolve without all actions |

---

# Game Lifecycle

```
 ┌──────────┐    startGame()    ┌──────────┐    resolveRound()   ┌──────────┐
 │   OPEN   │ ───────────────→  │  ACTIVE  │  ───────────────→  │ COMPLETE │
 └──────────┘                   └──────────┘   (winner found)    └──────────┘
      │                              │
  createGame()                  submitAction()
  registerPlayer()              resolveRound()
                                  (loops until winner)
```

1. **Create** -- Anyone calls `createGame()` to create a new game (state: `OPEN`)
2. **Register** -- Players call `registerPlayer(gameID)` to join (2-4 players)
3. **Start** -- Game master calls `startGame(gameID)` (state: `OPEN` → `ACTIVE`)
4. **Play** -- Each round:
   - All players call `submitAction(gameID, action, target)`
   - Anyone calls `resolveRound(gameID)` when all actions are in (or timeout reached)
5. **Win** -- When a player cracks all 5 locks (state: `ACTIVE` → `COMPLETE`)

---

# Function Reference

## Game Lifecycle

### `createGame() → uint256 gameID`

Create a new game. No role required.

### `registerPlayer(uint256 gameID)`

Join an open game. Reverts if game is not `OPEN`, is full, or caller already registered.

### `startGame(uint256 gameID)`

Start the game. Requires `GAME_MASTER_ROLE`. Reverts if fewer than 2 players.

## Player Actions

### `submitAction(uint256 gameID, Action action, address sabotageTarget)`

Submit an action for the current round. Must be a registered player. Each player submits once per round.

- `action`: `1` = PICK, `2` = SEARCH, `3` = SABOTAGE
- `sabotageTarget`: Target address (only checked for SABOTAGE, ignored otherwise)

## Round Resolution

### `resolveRound(uint256 gameID)`

Resolve the current round. Can be called by anyone. Requires either all actions submitted or round timeout reached.

## View Functions

### `getPlayerState(uint256 gameID, address playerAddr) → (uint256 locksCracked, uint256 tools, bool stunned, bool registered, bool actionSubmitted)`

Get full player state. Returns zeroed values for unregistered addresses.

### `getGameInfo(uint256 gameID) → (GameState state, uint256 currentRound, uint256 playerCount, uint256 roundStartTime, address winner)`

Get high-level game info. `GameState`: `0` = OPEN, `1` = ACTIVE, `2` = COMPLETE.

### `getPlayerAddress(uint256 gameID, uint256 playerIndex) → address`

Get a player's address by 1-based index.

### `allActionsSubmitted(uint256 gameID) → bool`

Check if all players have submitted actions for the current round.

### `totalGames() → uint256`

Total number of games created.

---

# Event Reference

| Event | Parameters | When |
|-------|-----------|------|
| `GameCreated` | `gameID`, `creator`, `timeStamp` | New game created |
| `PlayerJoined` | `gameID`, `player`, `playerIndex`, `timeStamp` | Player registered |
| `GameStarted` | `gameID`, `timeStamp` | Game master started the game |
| `ActionSubmitted` | `gameID`, `player`, `round`, `timeStamp` | Player submitted an action |
| `RoundResolved` | `gameID`, `round`, `timeStamp` | Round finished resolving |
| `LockCracked` | `gameID`, `player`, `totalCracked`, `timeStamp` | Player cracked a lock |
| `ToolFound` | `gameID`, `player`, `totalTools`, `timeStamp` | Player found a tool |
| `PlayerSabotaged` | `gameID`, `attacker`, `victim`, `timeStamp` | Player sabotaged another |
| `PlayerStunned` | `gameID`, `player`, `timeStamp` | Player was stunned |
| `GameWon` | `gameID`, `winner`, `rounds`, `timeStamp` | Player won the game |

All events have `gameID` as an `indexed` parameter for efficient filtering.

---

# Integration Example

```js
import { createPublicClient, createWalletClient, http, parseAbi } from "viem";
import { sepolia } from "viem/chains";
import PlundrixABI from "@luckymachines/game-core/games/plundrix/abi/PlundrixGame.json";

const PLUNDRIX_ADDRESS = "0x..."; // deployed address

// Read game state
const gameInfo = await publicClient.readContract({
  address: PLUNDRIX_ADDRESS,
  abi: PlundrixABI,
  functionName: "getGameInfo",
  args: [gameID],
});

// Register as a player
await walletClient.writeContract({
  address: PLUNDRIX_ADDRESS,
  abi: PlundrixABI,
  functionName: "registerPlayer",
  args: [gameID],
});

// Submit a PICK action (action enum: 1=PICK, 2=SEARCH, 3=SABOTAGE)
await walletClient.writeContract({
  address: PLUNDRIX_ADDRESS,
  abi: PlundrixABI,
  functionName: "submitAction",
  args: [gameID, 1, "0x0000000000000000000000000000000000000000"],
});

// Submit a SABOTAGE action targeting another player
await walletClient.writeContract({
  address: PLUNDRIX_ADDRESS,
  abi: PlundrixABI,
  functionName: "submitAction",
  args: [gameID, 3, targetPlayerAddress],
});

// Listen for game events
publicClient.watchContractEvent({
  address: PLUNDRIX_ADDRESS,
  abi: PlundrixABI,
  eventName: "LockCracked",
  onLogs: (logs) => {
    console.log("Lock cracked!", logs);
  },
});

// Resolve the round (anyone can call)
await walletClient.writeContract({
  address: PLUNDRIX_ADDRESS,
  abi: PlundrixABI,
  functionName: "resolveRound",
  args: [gameID],
});
```

---

# Comparison with Hexploration

| Feature | Hexploration | Plundrix |
|---------|-------------|----------|
| Contracts | 12+ (Board, Controller, Queue, Gameplay, ...) | 1 (PlundrixGame) |
| Randomness | Chainlink VRF v2 / Band Protocol | On-chain pseudo-random (blockhash) |
| Autoloop | Required (`runUpdate()` keeper) | Not needed |
| Zones | 100 (10x10 hex grid) | Single zone (the vault) |
| Players | 1-4 | 2-4 |
| Complexity | High (exploration, inventory, cards, day/night) | Low (3 actions, 5 locks) |
| Deploy | Multi-step (factory, zones, decks, tokens) | Single contract deploy |

Both games demonstrate game-core's patterns (RBAC roles, event-driven state, on-chain gameplay) at different complexity levels.
