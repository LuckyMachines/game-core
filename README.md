# Lucky Machines Game Core

Components for building on-chain game backends.

## Overview

Game Core is a modular smart contract framework for creating fully on-chain games. It provides the foundational infrastructure -- game boards, player management, zone-based movement, rule systems, gas management, and randomness -- so game developers can focus on gameplay logic rather than boilerplate.

The framework follows a factory pattern: deploy the core infrastructure once, then dynamically create game instances with custom boards, zones, and rulesets.

## AI Agent Quickstart

Machine-readable repository context is available in `llms.txt`.

Recommended flow for autonomous tooling:

1. Read `llms.txt` and this `README.md`
2. Validate JavaScript tests with `npm test`
3. Validate Solidity transit lifecycle with `npm run test:solidity`
4. Start integration from `contracts/src/v0.0/GameBoard.sol` and `GameFactory.sol`

## Installation

### Via npm (recommended)

Game Core is published to the Lucky Machines Verdaccio registry.

Set the registry profile for this repo:

```bash
npm run registry:local    # http://localhost:4873
npm run registry:staging  # https://staging-packages.luckymachines.io
npm run registry:prod     # https://packages.luckymachines.io
npm run registry:set -- custom https://your-registry.example.com
npm run registry:ping
```

Then install:

```bash
npm install @luckymachines/game-core
```

Publish to the configured registry:

```bash
npm run publish:registry
```

For Hardhat projects, imports resolve automatically from `node_modules`:

```solidity
import "@luckymachines/game-core/contracts/src/v0.0/GameBoard.sol";
```

For Foundry projects, add a remapping to `remappings.txt`:

```
@luckymachines/game-core/=node_modules/@luckymachines/game-core/
```

### As a Git Submodule (alternative)

```bash
forge install LuckyMachines/game-core
```

Then add the remapping to `remappings.txt`:

```
@luckymachines/game-core/=lib/game-core/
```

## Project Structure

```
game-core/
├── contracts/
│   ├── src/v0.0/                 # Solidity source contracts
│   │   ├── GameBoard.sol         # Game board with zones and player positioning
│   │   ├── GameFactory.sol       # Creates game boards and player registries
│   │   ├── GameRegistry.sol      # Universal registry for all games
│   │   ├── GameController.sol    # Player action submission
│   │   ├── GameEvents.sol        # Centralized event emission
│   │   ├── GasStation.sol        # Gas management for meta-transactions
│   │   ├── PlayerRegistry.sol    # Player registration and management
│   │   ├── PlayZone.sol          # Individual play zone logic
│   │   ├── PlayZoneFactory.sol   # Factory for creating play zones
│   │   ├── RandomnessConsumer.sol # Chainlink VRF + Mock VRF
│   │   ├── Ruleset.sol           # Game rule definitions
│   │   ├── libraries/
│   │   │   └── XYCoords.sol      # Coordinate string generation (up to 50x50)
│   │   ├── custom_boards/
│   │   │   └── HexGrid.sol       # Hexagonal grid board implementation
│   │   └── custom_zones/
│   │       ├── BackDoor.sol      # Zone that kicks players to a specific path
│   │       └── LuckyDuck.sol     # Zone with random path selection
│   └── abi/v0.0/                 # Compiled contract ABIs
├── package.json
└── LICENSE                        # GPL-3.0-or-later
```

## Architecture

### Core Contracts

| Contract | Purpose |
|----------|---------|
| **GameRegistry** | Universal registry that tracks all game IDs and board addresses across the system |
| **GameFactory** | Creates new `GameBoard` + `PlayerRegistry` pairs; supports standard and custom boards |
| **GameBoard** | Manages game state, play zones, zone connections (inputs/outputs), and player positions |
| **PlayerRegistry** | Per-board player registration with limits, locking, and active/inactive tracking |
| **PlayZone** | Individual zone contract handling player entry/exit, capacity, and ruleset behavior |
| **PlayZoneFactory** | Factory for deploying new PlayZone instances |
| **Ruleset** | Configurable game rules: max capacity, entry/exit sizes, payouts, lockable rulesets |
| **GameEvents** | Centralized event emission contract decoupled from game state logic |
| **GameController** | Interface for players to submit actions |
| **GasStation** | Gas management contract for subsidizing player transactions |
| **RandomnessConsumer** | Randomness provider supporting Chainlink VRF v2 and mock VRF for testing |
| **VRFVerifier** | ECVRF-SECP256K1-SHA256-TAI proof verification library for AutoLoop VRF |

### Custom Implementations

| Contract | Purpose |
|----------|---------|
| **HexGrid** | Extends `GameBoard` to create hexagonal grids of configurable width x height with coordinate-based zone aliases (e.g., `"2,3"`) |
| **BackDoor** | Custom `PlayZone` that kicks players out to a designated path |
| **LuckyDuck** | Custom `PlayZone` with randomized path selection |

### Design Patterns

- **Role-Based Access Control (RBAC)**: Uses OpenZeppelin's `AccessControlEnumerable` with custom roles (`GAME_MASTER_ROLE`, `FACTORY_ROLE`, `VERIFIED_CONTROLLER_ROLE`, `PLAY_ZONE_ROLE`, `EVENT_SENDER_ROLE`)
- **Factory Pattern**: `GameFactory` and `PlayZoneFactory` enable dynamic creation of game instances and zones
- **Registry Pattern**: `GameRegistry` and `PlayerRegistry` provide enumerable tracking of games and players
- **Modular Zone Design**: `PlayZone` serves as a base contract; custom zones inherit and override entry/exit behavior
- **Event-Driven Architecture**: `GameEvents` centralizes all event emission, allowing off-chain systems to subscribe to a single contract

### Deployment Bootstrap

1. Deploy `GameRegistry` (universal, one per ecosystem)
2. Deploy `GameFactory` (points to the registry)
3. Deploy `Ruleset` contract(s) for your game rules
4. Deploy `PlayZone` implementation(s)
5. Use `GameFactory` to create `GameBoard` + `PlayerRegistry` dynamically

### Group Transit (Mass Movement)

`GameBoard` now includes first-class queued transit for moving multiple players in controlled batches:

1. `queueExitToPaths(gameID, playerAddresses, pathIndices, transitID)` - queue one transit batch from a PlayZone
2. `startTransit(transitID)` - mark the queued batch active
3. `_progressTransit(transitID)` - controller processes up to `MAX_BATCH_SIZE` moves per call

Status helpers:

- `getTransitLength(gameID, transitID)`
- `getTransitEntry(gameID, transitID, index)`
- `transitStarted(gameID, transitID)`
- `transitComplete(gameID, transitID)`
- `transitProgress(gameID, transitID)`

Emitted events:

- `TransitQueued`
- `TransitStarted`
- `TransitStepProcessed`
- `TransitCompleted`

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@openzeppelin/contracts` | ^5.5.0 | AccessControlEnumerable, ReentrancyGuard |
| `@chainlink/contracts` | ^0.5.1 | VRF v2 randomness |

## Testing

JavaScript tests:

```bash
npm test
```

Solidity integration tests (Foundry):

```bash
npm run test:solidity
```

The transit lifecycle coverage lives in:

- `test/GameBoardTransit.t.sol`
- `test/GameBoardTransitBatch.t.sol` (multi-call progression when queued actions exceed `MAX_BATCH_SIZE`)

## Randomness Options

Game Core supports three randomness approaches:

### Mock VRF (testing / low-cost)

`RandomnessConsumer` provides a built-in mock VRF that uses blockhash-based pseudo-randomness. No external tokens or subscriptions required. Suitable for testing and low-cost deployments where provable fairness is not critical.

### Chainlink VRF (alternative)

`RandomnessConsumer` also supports Chainlink VRF v2 for provably fair randomness. Requires a funded Chainlink VRF subscription and LINK tokens. Two-transaction pattern: request randomness, then a separate callback fulfills it.

### AutoLoop VRF (recommended for production)

`VRFVerifier` enables a single-transaction VRF pattern when combined with [AutoLoop](https://github.com/LuckyMachines/autoloop). The automation worker generates an ECVRF proof off-chain, passes it to `progressLoop()`, and the contract verifies the proof on-chain — all in one transaction.

Benefits over the 2-tx pattern:
- **Cheaper** — no separate VRF fulfillment transaction
- **Faster** — randomness arrives in the same call as game processing
- **Cryptographically verifiable** — ECVRF-SECP256K1-SHA256-TAI proof verified on-chain
- **No Chainlink fees** — no LINK tokens or VRF subscription needed

To use AutoLoop VRF in your game:
1. Import `VRFVerifier.sol` from game-core
2. Use `AutoLoopVRFCompatible` from the [autoloop repo](https://github.com/LuckyMachines/autoloop) as your base contract
3. Implement VRF proof generation in your automation worker (see Hexploration for a reference implementation)

## Games Built on Game Core

### Hexploration

An on-chain multiplayer explore & escape game played on a 10x10 hexagonal grid. Players explore zones, collect artifacts, draw event cards, and manage inventory across Day/Night phase cycles. 1-4 players per game. Uses 12+ contracts including the full Game Core framework with Chainlink VRF for randomness.

**Repo:** [LuckyMachines/hexploration](https://github.com/LuckyMachines/hexploration)

### Plundrix

A single-contract heist game where 2-4 rival operatives compete to crack a vault with 5 locks. Each round, players choose PICK, SEARCH, or SABOTAGE. Self-contained in one contract with on-chain pseudo-random resolution.

**Repo:** [LuckyMachines/plundrix](https://github.com/LuckyMachines/plundrix)

### About the Local `games/` Folder

`games/` is treated as local workspace material (for example, local app builds or temporary checkouts) and is not the source of truth for Hexploration or Plundrix. The canonical code for those games is in their dedicated repositories above.

## License

[GPL-3.0-or-later](LICENSE) (GNU General Public License v3)
