# Lucky Machines Game Core

Components for building on-chain game backends.

## Overview

Game Core is a modular smart contract framework for creating fully on-chain games. It provides the foundational infrastructure -- game boards, player management, zone-based movement, rule systems, gas management, and randomness -- so game developers can focus on gameplay logic rather than boilerplate.

The framework follows a factory pattern: deploy the core infrastructure once, then dynamically create game instances with custom boards, zones, and rulesets.

## Installation

### As a Git Submodule (Foundry projects)

The recommended way to use Game Core in a Foundry project:

```bash
forge install LuckyMachines/game-core
```

Then add the remapping to `remappings.txt`:

```
@luckymachines/game-core/=lib/game-core/
```

Import in your Solidity contracts:

```solidity
import "@luckymachines/game-core/contracts/src/v0.0/GameBoard.sol";
```

### Via npm (legacy)

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

## Games Built on Game Core

### Hexploration

An on-chain multiplayer explore & escape game played on a 10x10 hexagonal grid. Players explore zones, collect artifacts, draw event cards, and manage inventory across Day/Night phase cycles. 1-4 players per game. Uses 12+ contracts including the full Game Core framework with Chainlink VRF for randomness.

**Repo:** [LuckyMachines/hexploration](https://github.com/LuckyMachines/hexploration)

### Plundrix

A single-contract heist game where 2-4 rival operatives compete to crack a vault with 5 locks. Each round, players choose PICK, SEARCH, or SABOTAGE. Self-contained in one contract with on-chain pseudo-random resolution.

**Repo:** [LuckyMachines/plundrix](https://github.com/LuckyMachines/plundrix)

## License

[GPL-3.0-or-later](LICENSE) (GNU General Public License v3)
