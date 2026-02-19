# Lucky Machines Game Core

Components for building on-chain game backends.

## Overview

Game Core is a modular smart contract framework for creating fully on-chain games. It provides the foundational infrastructure -- game boards, player management, zone-based movement, rule systems, and randomness -- so game developers can focus on gameplay logic rather than boilerplate.

The framework follows a factory pattern: deploy the core infrastructure once, then dynamically create game instances with custom boards, zones, and rulesets.

## Installation

```bash
yarn add @luckymachines/game-core
```

or

```bash
npm install @luckymachines/game-core
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
│   │   ├── PlayerRegistry.sol    # Player registration and management
│   │   ├── PlayZone.sol          # Individual play zone logic
│   │   ├── PlayZoneFactory.sol   # Factory for creating play zones
│   │   ├── RandomnessConsumer.sol # Chainlink VRF + Band Protocol VRF
│   │   ├── Ruleset.sol           # Game rule definitions
│   │   ├── libraries/
│   │   │   └── XYCoords.sol      # Coordinate string generation (up to 50x50)
│   │   ├── custom_boards/
│   │   │   └── HexGrid.sol       # Hexagonal grid board implementation
│   │   └── custom_zones/
│   │       ├── BackDoor.sol      # Zone that kicks players to a specific path
│   │       └── LuckyDuck.sol     # Zone with random path selection
│   └── abi/v0.0/                 # Compiled contract ABIs
├── games/
│   └── hexploration/             # Hexploration game implementation
│       ├── abi/                   # Game-specific ABIs
│       ├── deployments.json       # Deployed contract addresses (3 networks)
│       └── README.md              # Hexploration API documentation
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
| **RandomnessConsumer** | Dual randomness provider supporting Chainlink VRF v2 and Band Protocol VRF |

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

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@openzeppelin/contracts` | ^4.6.0 | AccessControl, Counters |
| `@chainlink/contracts` | ^0.5.1 | VRF v2 randomness |

## Games

### Hexploration

An on-chain adventure/exploration game played on a 10x10 hexagonal grid. Players explore zones, collect artifacts, draw event cards (Ambush, Event, Treasure, Relic decks), and manage inventory across Day/Night phase cycles. 1-4 players per game.

See [`games/hexploration/README.md`](games/hexploration/README.md) for the full API reference including contract functions, events, enumerations, and structs.

#### Quick Start (Frontend Integration)

```js
import GameSummaryABI from "@luckymachines/game-core/games/hexploration/abi/GameSummary.json";
import PlayerSummaryABI from "@luckymachines/game-core/games/hexploration/abi/PlayerSummary.json";
import ControllerABI from "@luckymachines/game-core/games/hexploration/abi/HexplorationController.json";
import EventsABI from "@luckymachines/game-core/games/hexploration/abi/GameEvents.json";
```

#### Key Integration Points

| Contract | Role |
|----------|------|
| **HexplorationController** | Players submit moves (register, request new game, submit actions) |
| **GameEvents** | Subscribe to game events (phase changes, actions, game over, etc.) |
| **GameSummary** | Read game state: zones, locations, inventories, artifacts (view functions, no gas) |
| **PlayerSummary** | Read player state: stats, inventory, location, status (view functions, no gas) |
| **PlayZoneSummary** | Read zone inventories (view functions, no gas) |

#### Deployed Networks

Contract addresses for all networks are in [`games/hexploration/deployments.json`](games/hexploration/deployments.json).

| Network | Status | Randomness Provider |
|---------|--------|---------------------|
| **Sepolia** | Active | Chainlink VRF v2 |
| **Godwoken Testnet** | Active | Band Protocol VRF |
| **Mumbai** (Polygon) | Historical | Chainlink VRF v2 + Band Protocol |

## NPM Scripts

```bash
npm run import-abis          # Import Hexploration ABIs from deployment
npm run chainlink-addresses  # Generate Chainlink address information
```

## License

[GPL-3.0-or-later](LICENSE) (GNU General Public License v3)
