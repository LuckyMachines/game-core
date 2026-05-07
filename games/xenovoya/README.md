# Setup

## Install Game Core

`yarn add @luckymachines/game-core`

or

`npm install @luckymachines/game-core`

## Import ABIs

    import GameSummaryABI from "@luckymachines/game-core/games/xenovoya/abi/GameSummary.json";
    import PlayerSummaryABI from "@luckymachines/game-core/games/xenovoya/abi/PlayerSummary.json";
    import ControllerABI from "@luckymachines/game-core/games/xenovoya/abi/XenovoyaController.json";
    import EventsABI from "@luckymachines/game-core/games/xenovoya/abi/GameEvents.json";
    import BoardABI from "@luckymachines/game-core/games/xenovoya/abi/XenovoyaBoard.json";
    import QueueABI from "@luckymachines/game-core/games/xenovoya/abi/XenovoyaQueue.json";
    import GameplayABI from "@luckymachines/game-core/games/xenovoya/abi/XenovoyaGameplay.json";
    import GameSetupABI from "@luckymachines/game-core/games/xenovoya/abi/GameSetup.json";
    import CardDeckABI from "@luckymachines/game-core/games/xenovoya/abi/CardDeck.json";
    import GameTokenABI from "@luckymachines/game-core/games/xenovoya/abi/GameToken.json";
    import PlayZoneSummaryABI from "@luckymachines/game-core/games/xenovoya/abi/PlayZoneSummary.json";

---

# Architecture Overview

## Contract Dependency Diagram

```
                          ┌──────────────────────┐
                          │  XenovoyaController│  (Player entry point)
                          └──────────┬───────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
           ┌──────────────┐  ┌─────────────┐  ┌──────────────┐
           │XenovoyaBoard│  │XenovoyaQueue│  │  GameSetup   │
           └──────┬───────┘  └──────┬──────┘  └──────┬───────┘
                  │                 │                 │
        ┌─────┬──┴──┬─────┐       │          Chainlink VRF
        ▼     ▼     ▼     ▼       ▼
   ┌───────┐┌───────┐┌───────┐ ┌──────────────────┐
   │CardDeck││GameToken││PlayZone│ │XenovoyaGameplay│
   └───────┘└───────┘└───────┘ └──────────────────┘
                                        │
                                        ▼
                                 ┌─────────────┐
                                 │  GameEvents  │  (Event emitter)
                                 └─────────────┘
        ┌────────────┐ ┌──────────────┐ ┌───────────────────┐
        │ GameSummary │ │PlayerSummary │ │ PlayZoneSummary   │
        └────────────┘ └──────────────┘ └───────────────────┘
                    (Read-only summary contracts)
```

## Contract Roles

| **Contract** | **Role** | **ABI** |
| --- | --- | --- |
| XenovoyaController | Player-facing entry point for creating, joining, and playing games | Yes |
| XenovoyaBoard | Core game board state: zones, players, relics, game lifecycle | Yes |
| XenovoyaQueue | Turn queue management, action submission, VRF randomness | Yes |
| XenovoyaGameplay | Action resolution engine, play-through processing, state updates | Yes |
| GameSetup | Game initialization, VRF requests for landing site, player registration triggers | Yes |
| CardDeck | Card data storage for Event, Ambush, Treasure, Land, and Relic decks | Yes |
| GameToken | ERC-like token system for items, statuses, enemies, relics, disasters | Yes |
| GameEvents | Event emitter for all game state changes | Yes |
| GameSummary | Read-only aggregate game state queries | Yes |
| PlayerSummary | Read-only player state queries | Yes |
| PlayZoneSummary | Read-only zone inventory queries | Yes |
| Utilities | Shared utility helpers | Yes |

## Deployed Contracts (Sepolia)

| **Contract** | **Address** |
| --- | --- |
| XENOVOYA_BOARD | `0x52771fad873a64Ed6c5385f74d81F99f2106fb19` |
| XENOVOYA_CONTROLLER | `0x5515C1158a84CAb258d2d8c294c4b7C69AEf0BBc` |
| GAME_QUEUE | `0x0272b8984b3e522dC2cF3eFDa35f894aFfB66Afb` |
| GAMEPLAY | `0x4CfB2bf3478c64F626c8E6E1c27bE28987B8cb16` |
| GAME_SETUP | `0x8d30483953fbB1b97C68ff7eE2be1163AaA2033d` |
| GAME_EVENTS | `0x419136D10EEa5973ffE28b5111b2094fc0b90f4C` |
| GAME_SUMMARY | `0x2e551b294e6FbC41F88eb4539cd47fC6F8981F24` |
| PLAYER_SUMMARY | `0x4C217eF31e8EE755151FF396FE49DD067d6C8E37` |
| PLAY_ZONE_SUMMARY | `0xF6B6734822D22d952ae8De4d487E76A92608Fa7b` |
| GAME_REGISTRY | `0x39363E9E2dE3902c195f5BA501976C615Edbc6E2` |
| EVENT_DECK | `0xb8c8C1f1ba65d1d4154bD5Cb1e964ed4099026db` |
| AMBUSH_DECK | `0x77B34d8D884DbAD8416E1A8e816967831465E2F0` |
| TREASURE_DECK | `0xD2e6ebfbf197C3962F70f3c4711BE92f7519D827` |
| LAND_DECK | `0x58a4Ec84a93165A1209502a5137E81bD397d6361` |
| RELIC_DECK | `0x97a264a0d2F1C4e4fE21119A97b5Bd480ee96fCb` |
| DAY_NIGHT_TOKEN | `0xc9C290758B2257650fD2810A3fB25573D2BB216B` |
| DISASTER_TOKEN | `0xAB4f8F24DC7124477cB015a380CEB16d9B083217` |
| ENEMY_TOKEN | `0xe93CA4D562a2bd00D2652461C1297a511e2801b1` |
| ITEM_TOKEN | `0xf39D30995A7e4cEcc9dD76001113BC3bD3732bfC` |
| PLAYER_STATUS_TOKEN | `0xF6e77c9C53494664720E72d61Af3bf12D5efE486` |
| RELIC_TOKEN | `0xd836aCAce63D0df67b107F60758cb92eaBBF0Fd0` |
| TOKEN_INVENTORY | `0xB72Ea5750B138b1dad9d8316b9776e48d920A39A` |
| PLAYER_REGISTRY | `0x2fe668537ad5D0DdE91410948b041c2ac1fC3BBd` |

All deployment addresses across networks can be found in [games/xenovoya/deployments.json](https://github.com/LuckyMachines/game-core/blob/docs/games/xenovoya/deployments.json).

---

# Game Flow

## Game Lifecycle

```
  Create Game          Register Players        Start Game           Play Turns            End Game
 ┌──────────┐         ┌──────────────┐        ┌──────────┐       ┌──────────────┐      ┌──────────┐
 │requestNew│───────▶ │registerFor   │──────▶ │allPlayers│─────▶ │submitAction  │────▶ │GameOver  │
 │  Game()  │         │  Game()      │        │Registered│       │  (repeat)    │      │          │
 └──────────┘         └──────────────┘        └──────────┘       └──────────────┘      └──────────┘
  Controller           Controller              GameSetup           Controller            Board
```

1. **Create**: Anyone calls `XenovoyaController.requestNewGame()` with a player limit (1-4).
2. **Register**: Players call `XenovoyaController.registerForGame()` to join an open game.
3. **Start**: Once all players register, `GameSetup.allPlayersRegistered()` is triggered. A Chainlink VRF request determines the landing site. Once fulfilled, the game begins.
4. **Play**: Players submit actions each turn via `XenovoyaController.submitAction()`. Actions are queued, randomness is requested, and outcomes are resolved.
5. **End**: The game ends when all players escape, are defeated, or the end-game scenario completes. `XenovoyaBoard.setGameOver()` is called.

## Turn Cycle

Each turn follows a processing pipeline managed by the `XenovoyaQueue`:

```
  Submission ──▶ Processing ──▶ PlayThrough ──▶ Processed ──▶ Closed
     │               │               │               │           │
  Players         VRF request    Actions are      State is     New queue
  submit          for random     resolved with    finalized    created for
  actions         numbers        randomness                   next phase
```

1. **Submission**: Players submit actions during the current phase window. The queue accepts `submitActionForPlayer()` calls.
2. **Processing**: Once all players have submitted (or time expires), `requestProcessActions()` triggers a VRF randomness request.
3. **PlayThrough**: After randomness is fulfilled, `XenovoyaGameplay.processPlayThrough()` resolves all player actions using the random values.
4. **Processed**: State updates are applied to the board (position changes, inventory transfers, stat adjustments).
5. **Closed**: The queue is closed and a new queue is created for the next phase.

## Day / Night Phases

Each in-game day consists of two phases:

- **Day Phase**: Players submit movement and action choices. After processing, each player receives an **Event** or **Ambush** card that affects their stats/inventory.
- **Night Phase**: Players submit actions again. Night affects available movement (reduced visibility). After processing, phase advances to the next Day.

The `isDayPhase` flag on the queue tracks the current phase. The `GamePhaseChange` event is emitted on each transition.

## Randomness Flow

Xenovoya uses **Chainlink VRF** (Verifiable Random Function) for provably fair randomness:

1. `XenovoyaQueue.requestProcessActions()` → requests random words from Chainlink VRF
2. Chainlink VRF Coordinator calls `rawFulfillRandomWords()` with the random values
3. Random values are stored per queue and used during `processPlayThrough()` for:
   - Card draws (which card from a deck)
   - Card outcome rolls (which of 3 outcomes)
   - Tile reveals (what terrain type)
   - Landing site selection (initial zone)

---

# Documentation

## Getting Started:

Frontends will interact with some or all of these contracts:

**Player-facing contracts:**

- [Game Controller](#game-controller-xenovoyacontrollersol): Players submit game moves through this contract.
- [Game Events](#game-events-gameeventssol): All game events are emitted here. Subscribe to any events from this contract.

**Read-only summary contracts (view functions, no gas cost):**

- [Game Summary](#game-summary-gamesummarysol): Various summaries of current game state.
- [Player Summary](#player-summary-playersummarysol): Various summaries of current player state.
- [Play Zone Summary](#play-zone-summary-playzonesummarysol): Various summaries of play zones on the game board.

**Core game engine contracts (called internally, documented for reference):**

- [Xenovoya Board](#xenovoya-board-xenovoyaboardsol): Core game board state management, zones, players, relics.
- [Xenovoya Queue](#xenovoya-queue-xenovoyaqueuesol): Turn queue management, action queuing, VRF randomness.
- [Xenovoya Gameplay](#xenovoya-gameplay-xenovoyagameplaysol): Action resolution engine and play-through processing.
- [Game Setup](#game-setup-gamesetupsol): Game initialization and VRF requests for landing site selection.
- [Card Deck](#card-deck-carddecksol): Card data storage for Event, Ambush, Treasure, Land, and Relic decks.
- [Game Token](#game-token-gametokensol): Token system for items, statuses, enemies, relics, and disasters.

## Deployed Contracts:

See the [Architecture Overview](#deployed-contracts-sepolia) for a full table of Sepolia addresses, or [games/xenovoya/deployments.json](https://github.com/LuckyMachines/game-core/blob/docs/games/xenovoya/deployments.json) for all networks.

---

## Game Summary (GameSummary.sol)

A contract with all view functions that return summaries of current game state.

### Game Summary Functions

| **Name**                                                      | **Description**                                                                   | **Caller** |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------- |
| [activeZones](#activezones)                                   | All zones that have been revealed                                                 | Public     |
| [allPlayZoneInventories](#allplayzoneinventories)             | Calls same function on [Play Zone Summary](#play-zone-summary-playzonesummarysol) | Public     |
| [allPlayerActiveInventories](#allplayeractiveinventories)     | All players active inventories                                                    | Public     |
| [allPlayerInactiveInventories](#allplayerinactiveinventories) | All players inactive inventories                                                  | Public     |
| [allPlayerLocations](#allplayerlocations)                     | Locations of all players in the game                                              | Public     |
| [allPlayers](#allplayers)                                     | Player info for all registered players                                            | Public     |
| [boardSize](#boardsize)                                       | The size of the game board (rows x cols)                                          | Public     |
| [canDigAtZone](#candigatzone)                                 | Check if digging is available                                                     | Public     |
| [currentDay](#currentday)                                     | The current day of a given game                                                   | Public     |
| [currentGameplayQueue](#currentgameplayqueue)                 | The ID of the current gameplay queue                                              | Public     |
| [currentPhase](#currentphase)                                 | The current game phase (Day / Night)                                              | Public     |
| [gameStarted](#gamestarted)                                   | Check if a game has started                                                       | Public     |
| [getAvailableGames](#getavailablegames)                       | All available open games                                                          | Public     |
| [landingSite](#landingsite)                                   | The landing site for a given game                                                 | Public     |
| [lastDayPhaseEvents](#lastdayphaseevents)                     | Summary of the latest day phase events                                            | Public     |
| [lastPlayerActions](#lastplayeractions)                       | Summary of the latest player actions                                              | Public     |
| [recoveredArtifacts](#recoveredartifacts)                     | List of all recovered artifacts                                                   | Public     |
| [playZoneInventory](#playzoneinventory)                       | Calls same function on [Play Zone Summary](#play-zone-summary-playzonesummarysol) | Public     |
| [totalPlayers](#totalplayers)                                 | Total players registered for a game                                               | Public     |

#### activeZones

All zones which have been revealed on the game board and their corresponding tiles.

```solidity
activeZones(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (
            string[] memory zones,
            uint16[] memory tiles,
            bool[] memory campsites
        )
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

##### Return Values

`(string[])zones`: An array of all zones which have been revealed on the game board. Zones are labeled as a string in the form "x,y", representing the coordinates on the game board grid. (TODO: show sample grid)

`(uint16[])tiles`: An array of all revealed zone tiles. Position corresponds with position of zones, e.g. tiles[1] will be the tile associated with zones[1]. See [Tile enumeration](#tiles).

`(bool[])campsites`: An array of whether or not a campsite is setup at each zone.

#### allPlayerActiveInventories

The active inventories of all players in the game

```solidity
allPlayerActiveInventories(
        address gameBoardAddress,
        uint256 gameID
    )
        public
        view
        returns (
            uint256[] memory playerIDs,
            string[] memory artifacts,
            string[] memory statuses,
            string[] memory relics,
            bool[] memory shields,
            bool[] memory campsites,
            string[] memory leftHandItems,
            string[] memory rightHandItems
        )
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

##### Return Values

`(uint256[])playerIDs`: An array of player IDs of all players registered for game.

`(string[])artifacts`: The artifact held by each player or an empty string if none.

`(string[])statuses`: Any special player statuses or an empty string if none.

`(string[])relics`: The relic held by each player or an empty string if none.

`(bool[])shields`: Whether or not each player is equipped with a shield.

`(bool[])campsites`: Whether or not each player has a campsite in their inventory.

`(string[])leftHandItems`: The item equipped to each player's left hand or an empty string if none.

`(string[])rightHandItems`: The item equipped to each player's right hand or an empty string if none.

#### allPlayerInactiveInventories

The inactive inventories of all players in the game.

```solidity
allPlayerInactiveInventories(
        address gameBoardAddress,
        uint256 gameID
    )
        public
        view
        returns (
            uint256[] memory playerIDs,
            string[][] memory itemTypes,
            uint256[][] memory itemBalances
        )
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

##### Return Values

`(uint256[])playerIDs`: An array of player IDs of all players registered for game.

`(string[][])itemTypes`: An array of item types for each player.

`(uint256[][])itemBalances`: An array of player balances of items corresponding to itemTypes for each player.

#### allPlayerLocations

The locations of all players on the game board.

```solidity
allPlayerLocations(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (uint256[] memory playerIDs, string[] memory playerZones)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

##### Return Values

`(uint256[])playerIDs`: An array of player IDs of all players registered for game.

`(string[])playerZones`: An array of zones in which each of the players is currently located. Position corresponds with position of playerIDs, e.g. playerZones[2] will be the location of the player with ID playerIDs[2].

#### allPlayers

Player info for all players registered in a specified game.

```solidity
function allPlayers(
        address gameBoardAddress,
        uint256 gameID
    ) public view returns (PlayerInfo[] memory players)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

##### Return Values

`(PlayerInfo[])players`: An array of [PlayerInfo](#playerinfo) structs.

#### boardSize

The size of the board in terms of rows and columns that make up the hex grid. (TODO: show example)

```solidity
boardSize(address gameBoardAddress)
        public
        view
        returns (uint256 rows, uint256 columns)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

##### Return Values

`(uint256)rows`: Number of rows in the game board hex grid.

`(uint256)columns`: Number of columns in the game board hex grid.

#### canDigAtZone

Checks if digging is available at a given play zone. This is a general method and does not take into account a player who possesses an Artifact and is thus unable to dig at any site until the Artifact is dropped off at the ship.

```solidity
canDigAtZone(
        address gameBoardAddress,
        uint256 gameID,
        string memory _zoneAlias
    ) public view returns (bool diggingAllowed)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

`(uint256)_zoneAlias`: Alias of the zone to query. This is the string representation of the column(x) and the row(y) in the form "x,y", e.g. "2,3" for zone at column 2, row 3.

##### Return Values

`(bool)diggingAllowed`: Whether or not digging is allowed at this site.

#### currentDay

Returns the current day for a given game. Each day consists of a Day phase and Night phase.

```solidity
currentDay(address gameBoardAddress, uint256 gameID)
        public
        returns (uint256 day)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

##### Return Values

`(uint256)day`: The current day of the game.

#### currentGameplayQueue

The current queue ID with player actions for the current turn. This queue ID gets updated at each new game phase (day / night).

```solidity
currentGameplayQueue(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (uint256 queueID)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

##### Return Values

`(uint256)queueID`: The current queue ID.

#### currentPhase

The current game phase, either Night or Day.

```solidity
currentPhase(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (string memory phase)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

##### Return Values

`(string)phase`: Current game phase.

#### gameStarted

Returns whether or not a game has started.

```solidity
gameStarted(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (bool gameHasStarted)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

##### Return Values

`(bool)gameHasStarted`: Whether or not the specified game has started.

#### getAvailableGames

Returns a list of all open games that can be joined by a player. Once a game is full, it will not show up in this list any more.

```solidity
getAvailableGames(
        address gameBoardAddress,
        address gameRegistryAddress
    )
        public
        view
        returns (
            uint256[] memory gameIDs,
            uint256[] memory maxPlayers,
            uint256[] memory currentRegistrations
        )
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

##### Return Values

`(uint256[])gameIDs`: An array of Game IDs open for players to join.

`(uint256[])maxPlayers`: An array of the maximum players that can register for a given game.

`(uint256[])currentRegistrations`: An array of current registration slots filled for a given game. This will be some number less than maxPlayers, as once a game reaches it's limit, it will no longer be open for new players to join.

#### landingSite

This is where the ship lands at the beginning of the game. All players begin at this location and aim to return here to drop off Artifacts and to escape off the planet at the end of the game.

```solidity
landingSite(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (string memory zoneAlias)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

##### Return Values

`(string)zoneAlias`: The zone alias of the landing site.

#### lastDayPhaseEvents

A summary of all events that occurred during the latest day events. These return the outcomes of daily events where all players receive either an Ambush or Event card.

```solidity
lastDayPhaseEvents(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (
            uint256[] memory playerIDs,
            string[] memory cardTypes,
            string[] memory cardsDrawn,
            string[] memory cardResults,
            string[3][] memory inventoryChanges,
            int8[3][] memory statUpdates
        )
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

##### Return Values

`(uint256[])playerIDs`: An array of player IDs of all players registered for the game.

`(string[])cardTypes`: An array of card types drawn by each player during the day phase events, i.e. Ambush or Event.

`(string[])cardsDrawn`: An array of the titles of cards drawn by each player during the day phase events.

`(string[])cardResults`: An array of the descriptions of the result of each card drawn by each player during the day phase events.

`(string[3][])inventoryChanges`: The inventory changes that occur as a result of the card drawn. There are 3 values that get returned, `[item loss, item gain, hand loss]`, where item loss is an item that is removed from the player's inventory (if present), item gain is an item that is added to the player's inventory, and hand loss is either "Right" or "Left" to represent a player losing whatever item they have equipped in that particular hand. Any or all of these 3 array elements may be empty strings, which represents no action.

`(int8[3][])statUpdates`: An array of player attribute adjustments with a representation of `[movement adjustment, agility adjustment, dexterity adjustment]`. Each value can be a positive or negative integer. A positive value will increase a particular attribute up to the maximum allowed and negative will reduce a particular attribute down to a minimum of 0.

#### lastPlayerActions

A summary of the latest actions taken by the player and their outcomes where necessary.

```solidity
lastPlayerActions(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (EventSummary[] memory playerActions)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

##### Return Values

`(EventSummary[])playerActions`: An array of [EventSummary](#event-summary) structs.

##### EventSummary

#### recoveredArtifacts

A list of all artifacts recovered in a given game.

```solidity
recoveredArtifacts(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (string[] memory artifacts)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

##### Return Values

`(string[])artifacts`: A list of all artifacts recovered (returned to ship).

#### totalPlayers

The total number of players registered for a given game.

```solidity
totalPlayers(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (uint256 numPlayers)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

##### Return Values

`(uint256)numPlayers`: How many players are registered for the specified game.

---

## Player Summary (PlayerSummary.sol)

A contract with all view functions that return summaries of current player state. All methods are callable directly by the player or by anyone if the player ID or player address (depending on the method) is passed as the last parameter. When not passing the Player ID, functions must be called directly from the player wallet.

### Player Summary Functions

| **Name**                                              | **Description**                               | **Caller**      |
| ----------------------------------------------------- | --------------------------------------------- | --------------- |
| [getPlayerID](#getplayerid)                           | The ID of a given player used in game         | Public / Player |
| [isActive](#isactive)                                 | Check if player is active in game             | Public / Player |
| [isRegistered](#isregistered)                         | Check if player is registered for a game      | Public / Player |
| [activeAction](#activeaction)                         | Latest action taken by player                 | Public / Player |
| [activeInventory](#activeinventory)                   | Active inventory on player card               | Public / Player |
| [availableMovement](#availablemovement)               | How many spaces a player can move             | Public / Player |
| [currentHandInventory](#currenthandinventory)         | Items equipped to left & right hands          | Public / Player |
| [currentLocation](#currentlocation)                   | Current location of player                    | Public / Player |
| [currentPlayerStats](#currentplayerstats)             | Current player attributes                     | Public / Player |
| [getPlayerAddress](#getplayeraddress)                 | The address of a player from a player ID      | Public          |
| [getPlayerID](#getplayerid)                           | The ID of a player for a given game           | Public / Player |
| [inactiveInventory](#inactiveinventory)               | Items held by player, but not active (in bag) | Public / Player |
| [isAtCampsite](#isatcampsite)                         | Check if player is at a campsite              | Public / Player |
| [playerRecoveredArtifacts](#playerrecoveredartifacts) | List of all artifacts recovered by player     | Public / Player |

#### isActive

Returns whether or not a given player is active in a given game. Players might get kicked from idleness, which would put them into this inactive state.

```solidity
isActive(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (bool playerIsActive)

isActive(
        address gameBoardAddress,
        uint256 gameID,
        address playerAddress
    ) public view returns (bool playerIsActive)

isActive(
        address gameBoardAddress,
        uint256 gameID,
        uint256 playerID
    ) public view returns (bool playerIsActive)

```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

`(address)playerAddress or (uint256)playerID`: This is an overloaded function so you can either pass the wallet address of the player or the player ID for the given game.

##### Return Values

`(bool)playerIsActive`: Whether or not the player is active in the specified game.

#### isRegistered

Returns whether or not a player is registered for a given game. Players might be registered, but inactive, so this is only valuable to learn who originally joined a game, not necessarily who is currently active. See [isActive](#isactive).

```solidity
isRegistered(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (bool playerIsRegistered)

isRegistered(
        address gameBoardAddress,
        uint256 gameID,
        address playerAddress
    ) public view returns (bool)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

##### Return Values

`(bool)playerIsRegistered`: Whether or not the player is registered for the specified game.

#### activeAction

The latest action submitted by the player.

```solidity
activeAction(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (string memory action)

activeAction(
        address gameBoardAddress,
        uint256 gameID,
        uint256 playerID
    ) public view returns (string memory action)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

##### Return Values

`(string)action`: Latest action for the current player

#### activeInventory

This represents a player's active inventory, i.e. all of the tokens active on their player card.

```solidity
activeInventory(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (
            string memory artifact,
            string memory status,
            string memory relic,
            bool shield,
            bool campsite,
            string memory leftHandItem,
            string memory rightHandItem
        )

activeInventory(
        address gameBoardAddress,
        uint256 gameID,
        uint256 playerID
    )
        public
        view
        returns (
            string memory artifact,
            string memory status,
            string memory relic,
            bool shield,
            bool campsite,
            string memory leftHandItem,
            string memory rightHandItem
        )
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

##### Return Values

`(string)artifact`: The artifact held by the player or an empty string if none.

`(string)status`: Any special player status or an empty string if none.

`(string)relic`: The relic held by a player or an empty string if none.

`(bool)shield`: Whether or not the player is equipped with a shield.

`(bool)campsite`: Whether or not the player has a campsite in their inventory.

`(string)leftHandItem`: The item equipped to the left hand or an empty string if none.

`(string)rightHandItem`: The item equipped to the right hand or an empty string if none.

#### availableMovement

Returns the total number of spaces a player can move under the current conditions. Time of day and terrain affect the outcome of this.

```solidity
availableMovement(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (uint8 movement)

availableMovement(
        address gameBoardAddress,
        uint256 gameID,
        uint256 playerID
    ) public view returns (uint8 movement)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

##### Return Values

`(uint8)movement`: How many spaces a player can move on this turn.

#### currentHandInventory

The items equipped in the player's hands, as represented on the player card.

```solidity
currentHandInventory(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (string memory leftHandItem, string memory rightHandItem)

currentHandInventory(
        address gameBoardAddress,
        uint256 gameID,
        uint256 playerID
    )
        public
        view
        returns (string memory leftHandItem, string memory rightHandItem)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

##### Return Values

`(string)leftHandItem`: The item equipped to the player's left hand.

`(string)rightHandItem`: The item equipped to the player's right hand.

#### currentLocation

The current location of the player for a given game.

```solidity
currentLocation(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (string memory location)

currentLocation(
        address gameBoardAddress,
        uint256 gameID,
        uint256 playerID
    ) public view returns (string memory location)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

##### Return Values

`(string)location`: The zone in which the players is currently located, represented as "x,y".

#### currentPlayerStats

The current values of all player attributes: movement, agility, and dexterity.

```solidity
currentPlayerStats(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (
            uint8 movement,
            uint8 agility,
            uint8 dexterity
        )

currentPlayerStats(
        address gameBoardAddress,
        uint256 gameID,
        uint256 playerID
    )
        public
        view
        returns (
            uint8 movement,
            uint8 agility,
            uint8 dexterity
        )
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

##### Return Values

`(uint8)movement`: The player's current movement score and the maximum number of spaces a player can move on a given turn.

`(uint8)agility`: The player's current agility score.

`(uint8)dexterity`: The player's current dexterity score.

#### getPlayerID

Returns a player ID from a specified wallet address.

```solidity
getPlayerID(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (uint256 playerID)

getPlayerID(
        address gameBoardAddress,
        uint256 gameID,
        address playerAddress
    ) public view returns (uint256 playerID)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

`(address)playerAddress`: Wallet address of the player.

##### Return Values

`(uint256)playerID`: The player ID used to represent a player in a given game.

#### getPlayerAddress

Returns the player's wallet address from specified player ID.

```solidity
function getPlayerAddress(
        address gameBoardAddress,
        uint256 gameID,
        uint256 playerID
    ) public view returns (address playerAddress)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

`(uint256)playerID`: ID of the player within the given game.

##### Return Values

`(address)playerAddress`: The player's wallet address.

#### inactiveInventory

The inventory owned by a player, but not in use. This is what is in the player's possession, but may not have been played yet.

```solidity
inactiveInventory(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (string[] memory itemTypes, uint256[] memory itemBalances)

inactiveInventory(
        address gameBoardAddress,
        uint256 gameID,
        uint256 playerID
    )
        public
        view
        returns (string[] memory itemTypes, uint256[] memory itemBalances)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

##### Return Values

`(string[])itemTypes`: An array of item types.

`(uint256[])itemBalances`: An array of player balances of items corresponding to itemTypes.

#### isAtCampsite

Check's whether a player is at a campsite. This is useful to know before submitting a dig or rest move.

```solidity
isAtCampsite(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (bool atCampsite)

isAtCampsite(
        address gameBoardAddress,
        uint256 gameID,
        uint256 playerID
    ) public view returns (bool atCampsite)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

##### Return Values

`(bool)atCampsite`: Whether or not the player is currently at a campsite.

#### playerRecoveredArtifacts

A list of artifacts that have been recovered by the player in a given game.

```solidity
playerRecoveredArtifacts(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (string[] memory artifacts)

playerRecoveredArtifacts(
        address gameBoardAddress,
        uint256 gameID,
        uint256 playerID
    ) public view returns (string[] memory artifacts)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

##### Return Values

`(string[])artifacts`: A list of all artifacts recovered (returned to ship) by the player.

---

## Play Zone Summary (PlayZoneSummary.sol)

A contract with all view functions that return summaries of play zones on the game board. Note: these functions are callable via GameSummary.sol, so an additional ABI import is not necessary.

### Play Zone Summary Functions

function playZoneInventory(
address gameBoardAddress,
uint256 gameID,
string memory zoneAlias
)

| **Name**                                          | **Description**                                 | **Caller** |
| ------------------------------------------------- | ----------------------------------------------- | ---------- |
| [allPlayZoneInventories](#allplayzoneinventories) | Inventories of all play zones on the game board | Public     |
| [playZoneInventory](#playzoneinventory)           | Inventory held by a given play zone alias       | Public     |

#### allPlayZoneInventories

Returns all inventory items held by all play zones on the game board.

```solidity
function allPlayZoneInventories(
        address gameBoardAddress,
        uint256 gameID
    ) public view returns (ZoneInventory[] memory allInventory)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

##### Return Values

`(ZoneInventory[])allInventory`: An array of all zones on the board and their associated inventories. Returns an array of [ZoneInventory](#zoneinventory) structs

#### playZoneInventory

Returns all inventory items held by a specified play zone on the game board.

```solidity
function playZoneInventory(
        address gameBoardAddress,
        uint256 gameID,
        string memory zoneAlias
    ) public view returns (InventoryItem[] memory inventory)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

`(string)zoneAlias`: Alias of the play zone, e.g. `"2,1"`

##### Return Values

`(InventoryItem[])inventory`: An array of all inventory items held by the specified play zone. Returns an array of [InventoryItem](#inventoryitem) structs.

---

## Game Controller (XenovoyaController.sol)

A contract with all of the interactions required by the player to [create](#requestnewgame), [join](#registerforgame), and [play](#submitaction) Xenovoya. This contract is generally meant to be interacted with directly by the player, so these methods should always be called from a player's connected wallet. The exception is in [requesting a new game](#requestnewgame), which is a function callable by anyone, so it can potentially be called via a private provider.

### Functions

| **Name**                            | **Description**                          |
| ----------------------------------- | ---------------------------------------- |
| [registerForGame](#registerforgame) | Register for an open game                |
| [requestNewGame](#requestnewgame)   | Request new game with player limit 1 - 4 |
| [submitAction](#submitaction)       | Submit player action for a given game    |

#### registerForGame

Registers a player for the specified game. Available games can be found in the [Game Summary](#getavailablegames).

```solidity
registerForGame(uint256 gameID, address boardAddress) public
```

##### Parameters

`(uint256)gameID`: ID of the game.

`(address)boardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

#### requestNewGame

Requests a new game, with a designated player size of 1 - 4. Games created from this method can be found in the [Game Summary](#getavailablegames).

```solidity
requestNewGame(
    address gameRegistryAddress,
    address boardAddress,
    uint256 totalPlayers
) public
```

##### Parameters

`(address)gameRegistryAddress`: Game registry contract on which to request new game. This can be found in [deployments.json](#deployed-contracts).

`(address)boardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)totalPlayers`: Total players to allow in game. This can be between 1 - 4.

#### submitAction

Submit actions and equip item for a specified game. Players can submit one action and one hand equip each turn. The transaction will fail if multiple hands are submitted in the same submission.

```solidity
submitAction(
        uint256 playerID,
        uint8 actionIndex,
        string[] memory options,
        string memory leftHand,
        string memory rightHand,
        uint256 gameID,
        address boardAddress
    ) public
```

##### Parameters

`(uint256)playerID`: Player ID for whom this move is intended.

`(uint8)actionIndex`: Index of the action to submit. See [Action enumeration](#actions).

`(string[])options`: [Options](#action-options) that correspond with the submitted action.

`(string)leftHand`: Item to equip in left hand or pass "" to bypass. Pass "None" to remove item from left hand.

`(string)rightHand`: Item to equip in right hand or pass "" to bypass. Pass "None" to remove item from right hand.

`(uint256)gameID`: ID of the game.

`(address)boardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

##### Action options

Action options are passed as an array of strings. For single values pass an array with that one element. When passing an integer, use the string representation of the value.

- **Move**: The path of movement as an array of strings, e.g. `["2,2","3,3","4,3"]`.

- **Help**: The ID of the player to help / revive and the attribute to transfer e,g, `["3"], ["Agility]`.

- **Rest**: The attribute to rest and improve. Can choose `["Movement"]`, `["Agility"]`, or `["Dexterity"]`.

---

## Game Events (GameEvents.sol)

### Events

| **Name**                                        | **Description**                              |
| ----------------------------------------------- | -------------------------------------------- |
| [ActionSubmit](#actionsubmit)                   | A player action was submitted                |
| [EndGameStarted](#endgamestarted)               | The end game has started                     |
| [GameOver](#gameover)                           | All players defeated or successfully escaped |
| [GamePhaseChange](#gamephasechange)             | Game phase has changed (night / day)         |
| [GameRegistration](#gameregistration)           | A player registered for the game             |
| [GameStart](#gamestart)                         | The game has started                         |
| [LandingSiteSet](#landingsiteset)               | The landing site has been chosen             |
| [PlayerIdleKick](#playeridlekick)               | A player was kicked due to idleness          |
| [ProcessingPhaseChange](#processingphasechange) | The turn processing is in a new phase        |
| [TurnProcessingFailed](#turnprocessingfailed)   | The turn processing failed.                  |
| [TurnProcessingStart](#turnprocessingstart)     | The first phase of turn processing began     |

#### ActionSubmit

This event is emitted each time a player submits a move.

```solidity
event ActionSubmit(
    uint256 indexed gameID,
    uint256 playerID,
    uint256 actionID,
    uint256 timeStamp
);
```

##### Parameters

`(uint256)gameID`: The game to which the action was submitted.

`(uint256)playerID`: The player that submitted the action.

`(uint256)actionID`: The [enumerated action](#actions) that was submitted.

`(uint256)timeStamp`: The time the action was submitted.

#### EndGameStarted

This event is emitted when the end game has begun.

```solidity
event EndGameStarted(
        uint256 indexed gameID,
        uint256 timeStamp,
        string scenario
    )
```

##### Parameters

`(uint256)gameID`: The game in which the end game began.

`(uint256)timeStamp`: The time the end game was started.

`(string)scenario`: The end game scenario to take place.

#### GameOver

This event is emitted when all players have been defeated and gameplay has ended.

```solidity
event GameOver(uint256 indexed gameID, uint256 timeStamp)
```

##### Parameters

`(uint256)gameID`: The game that has ended.

`(uint256)timeStamp`: The time the end game ended.

#### GamePhaseChange

This event is emitted when the game phase changes between `"Night"` and `"Day"`.

```solidity
event GamePhaseChange(
        uint256 indexed gameID,
        uint256 timeStamp,
        string newPhase
    )
```

##### Parameters

`(uint256)gameID`: The game in which the phase changed.

`(uint256)timeStamp`: The time the game phase changed.

`(string)newPhase`: The current game phase, either `"Night"` or `"Day"`.

#### GameRegistration

This event is emitted each time a player registers for a game.

```solidity
event GameRegistration(
        uint256 indexed gameID,
        address playerAddress,
        uint256 playerID
    );
```

##### Parameters

`(uint256)gameID`: The game for which the player registered.

`(address)playerAddress`: The wallet address of the registered player.

`(uint256)playerID`: The player ID assigned for the registered game.

#### GameStart

This event is emitted when a game begins. A game begins after a landing site has been chosen and all players can begin to submit actions.

```solidity
event GameStart(uint256 indexed gameID, uint256 timeStamp)
```

##### Parameters

`(uint256)gameID`: The game that started.

`(uint256)timeStamp`: The time the game started.

#### LandingSiteSet

This event is emitted once a location for the landing site has been set.

```solidity
event LandingSiteSet(uint256 indexed gameID, string landingSite)
```

##### Parameters

`(uint256)gameID`: The game in which the landing site was set.

`(string)landingSite`: The play zone alias of the landing site.

#### PlayerIdleKick

This event is emitted when a player is kicked from the game due to idleness. This is currently happens if a player does not submit an action for 3 consecutive turns.

```solidity
event PlayerIdleKick(
        uint256 indexed gameID,
        uint256 playerID,
        uint256 timeStamp
    )
```

##### Parameters

`(uint256)gameID`: The game from which the player was kicked.

`(uint256)playerID`: The player that was kicked from the game.

`(uint256)timeStamp`: The time the player was kicked from the game.

#### ProcessingPhaseChange

This event is emitted when the turn processing enters a new phase. The sequence of phases can be seen in the [Game Turn Processing enumeration](#game-turn-processing).

```solidity
event ProcessingPhaseChange(
        uint256 indexed gameID,
        uint256 timeStamp,
        uint256 newPhase
    )
```

##### Parameters

`(uint256)gameID`: The game in which the processing phase changed.

`(uint256)timeStamp`: The time the processing phase was changed.

`(uint256)newPhase`: The current [enumerated processing phase](#game-turn-processing).

#### TurnProcessingFailed

This event is emitted wht the game is unable to process the [turn processing phase](#game-turn-processing) and it cannot be set to `Processing`.

```solidity
event TurnProcessingFail(
        uint256 indexed gameID,
        uint256 queueID,
        uint256 timeStamp
    )
```

##### Parameters

`(uint256)gameID`: The game in which the turn processing failed.

`(uint256)queueID`: The associated turn queue that failed to process.

`(uint256)timeStamp`: The time the game failed processing.

#### TurnProcessingStart

This event is emitted when the [turn processing phase](#game-turn-processing) is set to `Processing`.

```solidity
event TurnProcessingStart(uint256 indexed gameID, uint256 timeStamp)
```

##### Parameters

`(uint256)gameID`: The game in which the turn processing phase started.

`(uint256)timeStamp`: The time the action was submitted.

---

## Xenovoya Board (XenovoyaBoard.sol)

The core game board contract that manages all on-chain game state: game creation, zone management, player registration, relic/artifact tracking, and game lifecycle. This contract is the central data store that other contracts read from and write to. Most functions require role-based access (`GAME_MASTER_ROLE`, `VERIFIED_CONTROLLER_ROLE`, or `FACTORY_ROLE`).

### Board Functions

| **Name** | **Description** | **Caller** |
| --- | --- | --- |
| [createGame](#creategame) | Create a new game instance | Factory / Admin |
| [start](#start) | Start a game (enable initial game state) | Game Master |
| [setGameOver](#setgameover) | Mark a game as over | Game Master |
| [enableZone](#enablezone) | Reveal a zone with a specific tile type | Game Master |
| [addZoneConnections](#addzoneconnections) | Define adjacency between zones | Game Master |
| [moveThroughPath](#movethroughpath) | Move a player through a path of zones | Game Master |
| [addRelic](#addrelic) | Place a relic at a specific zone | Game Master |
| [setArtifactFound](#setartifactfound) | Mark an artifact as found at a zone | Game Master |
| [setArtifactRetrieved](#setartifactretrieved) | Record an artifact retrieval by a player | Game Master |
| [registerPlayer](#registerplayer) | Register a player for a game | Verified Controller |
| [enterPlayer](#enterplayer) | Place a player at a starting zone | Game Master |
| [setPlayerActive](#setplayeractive) | Mark a player as active | Game Master |
| [setPlayerInactive](#setplayerinactive) | Mark a player as inactive (kicked/defeated) | Game Master |
| [openGames](#opengames) | Get all open games accepting players | Public |
| [getZoneAliases](#getzonealiases) | Get all zone coordinate aliases for the board | Public |
| [hasOutput](#hasoutput) | Check if a zone has a path to another zone | Public |
| [getPlayZones](#getplayzones) | Get all play zone aliases for a game | Public |
| [getRelics](#getrelics) | Get all relics in a game | Public |
| [getArtifactsRetrieved](#getartifactsretrieved-board) | Get all artifacts retrieved by a player | Public |

#### createGame

Creates a new game instance on the board. There are two overloads: one that takes registry addresses only, and one that also accepts initial play zone addresses and aliases.

```solidity
createGame(
    address _playerRegistry,
    address _gameRegistry
) public returns (uint256 gameID)

createGame(
    address _playerRegistry,
    address _gameRegistry,
    address[] memory playZoneAddresses,
    string[] memory zoneAliases
) public returns (uint256 gameID)
```

##### Parameters

`(address)_playerRegistry`: Address of the player registry contract.

`(address)_gameRegistry`: Address of the game registry contract.

`(address[])playZoneAddresses` *(optional overload)*: Array of play zone contract addresses.

`(string[])zoneAliases` *(optional overload)*: Array of zone aliases (e.g., `["1,1", "1,2"]`).

##### Return Values

`(uint256)gameID`: The ID of the newly created game.

#### start

Starts a game, transitioning it from the registration phase to active gameplay.

```solidity
start(uint256 gameID) public
```

##### Parameters

`(uint256)gameID`: ID of the game to start.

#### setGameOver

Marks a game as complete. No further actions can be submitted.

```solidity
setGameOver(uint256 gameID) public
```

##### Parameters

`(uint256)gameID`: ID of the game to end.

#### enableZone

Reveals a zone on the game board by assigning it a tile type. Zones start unrevealed and are enabled as players explore.

```solidity
enableZone(
    string memory _zoneAlias,
    uint8 tile,
    uint256 gameID
) public
```

##### Parameters

`(string)_zoneAlias`: Zone coordinate alias, e.g. `"3,4"`.

`(uint8)tile`: The [Tile enumeration](#tiles) value to assign to this zone.

`(uint256)gameID`: ID of the game.

#### addZoneConnections

Defines adjacency connections between zones, allowing player movement between them.

```solidity
addZoneConnections(
    uint256 gameID,
    string[2][] memory connections
) public
```

##### Parameters

`(uint256)gameID`: ID of the game.

`(string[2][])connections`: Array of zone pairs that should be connected, e.g. `[["1,1","1,2"], ["1,2","2,2"]]`.

#### moveThroughPath

Moves a player through a series of connected zones, revealing tiles along the path.

```solidity
moveThroughPath(
    string[] memory zonePath,
    uint256 playerID,
    uint256 gameID,
    uint8[] memory tiles
) public
```

##### Parameters

`(string[])zonePath`: Array of zone aliases defining the movement path.

`(uint256)playerID`: ID of the player moving.

`(uint256)gameID`: ID of the game.

`(uint8[])tiles`: Array of [Tile enumeration](#tiles) values to assign to newly revealed zones along the path.

#### addRelic

Places a relic at a specific zone on the board.

```solidity
addRelic(
    uint256 gameID,
    string memory relicType,
    string memory _zoneAlias
) public
```

##### Parameters

`(uint256)gameID`: ID of the game.

`(string)relicType`: The type/name of the relic.

`(string)_zoneAlias`: Zone where the relic is placed.

#### setArtifactFound

Marks that an artifact has been discovered at a zone. Once found, the zone cannot yield another artifact.

```solidity
setArtifactFound(
    uint256 gameID,
    string memory _zoneAlias
) public
```

##### Parameters

`(uint256)gameID`: ID of the game.

`(string)_zoneAlias`: Zone where the artifact was found.

#### setArtifactRetrieved

Records that a player has successfully retrieved an artifact (returned it to the ship).

```solidity
setArtifactRetrieved(
    uint256 gameID,
    uint256 playerID,
    string memory artifact
) public
```

##### Parameters

`(uint256)gameID`: ID of the game.

`(uint256)playerID`: ID of the player who retrieved the artifact.

`(string)artifact`: Name of the artifact retrieved.

#### registerPlayer

Registers a player's wallet address for a specific game.

```solidity
registerPlayer(
    address playerAddress,
    uint256 gameID
) public
```

##### Parameters

`(address)playerAddress`: Wallet address of the player.

`(uint256)gameID`: ID of the game.

#### enterPlayer

Places a registered player at a specific zone on the board (typically the landing site at game start).

```solidity
enterPlayer(
    address playerAddress,
    uint256 gameID,
    string memory zone
) public
```

##### Parameters

`(address)playerAddress`: Wallet address of the player.

`(uint256)gameID`: ID of the game.

`(string)zone`: Zone alias where the player enters.

#### setPlayerActive

Marks a player as active in the game.

```solidity
setPlayerActive(uint256 _playerID, uint256 gameID) public
```

##### Parameters

`(uint256)_playerID`: ID of the player.

`(uint256)gameID`: ID of the game.

#### setPlayerInactive

Marks a player as inactive (e.g., kicked for idleness or defeated).

```solidity
setPlayerInactive(uint256 _playerID, uint256 gameID) public
```

##### Parameters

`(uint256)_playerID`: ID of the player.

`(uint256)gameID`: ID of the game.

#### openGames

Returns all games that are currently open and accepting player registrations.

```solidity
openGames(address gameRegistryAddress)
    public
    view
    returns (
        uint256[] memory availableGames,
        uint256[] memory playerLimit,
        uint256[] memory currentRegistrations
    )
```

##### Parameters

`(address)gameRegistryAddress`: Address of the game registry contract.

##### Return Values

`(uint256[])availableGames`: Array of game IDs that are open.

`(uint256[])playerLimit`: Maximum players for each game.

`(uint256[])currentRegistrations`: Current number of registered players for each game.

#### getZoneAliases

Returns all zone coordinate aliases defined for the board grid.

```solidity
getZoneAliases() public view returns (string[] memory)
```

##### Return Values

`(string[])`: Array of all zone aliases (e.g., `["1,1", "1,2", "2,1", ...]`).

#### hasOutput

Checks whether a path exists from one zone to another (i.e., they are connected).

```solidity
hasOutput(
    string memory fromZone,
    string memory toZone
) public view returns (bool zoneHasOutput)
```

##### Parameters

`(string)fromZone`: Source zone alias.

`(string)toZone`: Destination zone alias.

##### Return Values

`(bool)zoneHasOutput`: Whether a connection exists from the source to the destination.

#### getPlayZones

Returns all play zone aliases for a given game.

```solidity
getPlayZones(uint256 gameID) public view returns (string[] memory)
```

##### Parameters

`(uint256)gameID`: ID of the game.

##### Return Values

`(string[])`: Array of zone aliases.

#### getRelics

Returns all relics placed in a given game.

```solidity
getRelics(uint256 gameID) public view returns (string[] memory)
```

##### Parameters

`(uint256)gameID`: ID of the game.

##### Return Values

`(string[])`: Array of relic type names.

#### getArtifactsRetrieved (Board)

Returns all artifacts retrieved by a specific player in a given game.

```solidity
getArtifactsRetrieved(
    uint256 gameID,
    uint256 playerID
) public view returns (string[] memory)
```

##### Parameters

`(uint256)gameID`: ID of the game.

`(uint256)playerID`: ID of the player.

##### Return Values

`(string[])`: Array of artifact names retrieved by the player.

---

## Xenovoya Queue (XenovoyaQueue.sol)

Manages the turn-based action queue for each game phase. Players submit actions to the queue, which then coordinates randomness requests (via Chainlink VRF) and triggers action resolution. Each game phase (Day or Night) creates a new queue. The queue also tracks player idle turns for the kick mechanic.

### Queue Functions

| **Name** | **Description** | **Caller** |
| --- | --- | --- |
| [requestGameQueue](#requestgamequeue) | Create a new queue for a game | Gameplay Role |
| [submitActionForPlayer](#submitactionforplayer) | Submit a player's action to the queue | Verified Controller |
| [requestProcessActions](#requestprocessactions) | Trigger VRF request and begin processing | Gameplay Role |
| [getRandomness](#getrandomness) | Get random values for a queue | Public |
| [getAllPlayers](#getallplayers-queue) | Get all player IDs in a queue | Public |
| [getStatsAtSubmission](#getstatsatsubmission) | Get player stats snapshot at submission time | Public |
| [getSubmissionOptions](#getsubmissionoptions) | Get the options submitted with a player's action | Public |
| [currentPhase (Queue)](#currentphase-queue) | Get the processing phase of a queue | Public |
| [getQueueIDs](#getqueueids) | Get all queue IDs for a game | Public |
| [getFailedQueue](#getfailedqueue) | Get failed queue IDs for a game | Public |

#### requestGameQueue

Creates a new turn queue for a game with the given number of players.

```solidity
requestGameQueue(
    uint256 gameID,
    uint256 _totalPlayers
) public returns (uint256)
```

##### Parameters

`(uint256)gameID`: ID of the game.

`(uint256)_totalPlayers`: Number of active players in the game.

##### Return Values

`(uint256)`: The new queue ID.

#### submitActionForPlayer

Submits a player's action and hand equipment choices to the queue for the current turn.

```solidity
submitActionForPlayer(
    uint256 playerID,
    uint8 action,
    string[] memory options,
    string memory leftHand,
    string memory rightHand,
    uint256 _queueID,
    bool _isDayPhase
) public
```

##### Parameters

`(uint256)playerID`: ID of the player.

`(uint8)action`: The [Action enumeration](#actions) index.

`(string[])options`: Action options (e.g., movement path for Move action).

`(string)leftHand`: Item to equip in left hand (or `""` to skip, `"None"` to remove).

`(string)rightHand`: Item to equip in right hand (or `""` to skip, `"None"` to remove).

`(uint256)_queueID`: ID of the current queue.

`(bool)_isDayPhase`: Whether this is a Day phase submission.

#### requestProcessActions

Triggers the processing phase for a queue. This sends a VRF randomness request. Once randomness is fulfilled, the play-through can begin.

```solidity
requestProcessActions(
    uint256 _queueID,
    bool _isDayPhase
) public
```

##### Parameters

`(uint256)_queueID`: ID of the queue to process.

`(bool)_isDayPhase`: Whether this queue is for a Day phase.

#### getRandomness

Returns the random values received from VRF for a given queue. Used by the gameplay engine to resolve actions.

```solidity
getRandomness(uint256 _queueID)
    public
    view
    returns (uint256[] memory)
```

##### Parameters

`(uint256)_queueID`: ID of the queue.

##### Return Values

`(uint256[])`: Array of random words from VRF.

#### getAllPlayers (Queue)

Returns all player IDs that are part of a given queue.

```solidity
getAllPlayers(uint256 _queueID)
    public
    view
    returns (uint256[] memory)
```

##### Parameters

`(uint256)_queueID`: ID of the queue.

##### Return Values

`(uint256[])`: Array of player IDs.

#### getStatsAtSubmission

Returns a snapshot of a player's stats (movement, agility, dexterity) at the time they submitted their action. This is used for fair resolution since stats may change during processing.

```solidity
getStatsAtSubmission(
    uint256 _queueID,
    uint256 _playerID
) public view returns (uint8[3] memory)
```

##### Parameters

`(uint256)_queueID`: ID of the queue.

`(uint256)_playerID`: ID of the player.

##### Return Values

`(uint8[3])`: Array of `[movement, agility, dexterity]` at submission time.

#### getSubmissionOptions

Returns the options that a player submitted with their action (e.g., movement path zones).

```solidity
getSubmissionOptions(
    uint256 _queueID,
    uint256 _playerID
) public view returns (string[] memory)
```

##### Parameters

`(uint256)_queueID`: ID of the queue.

`(uint256)_playerID`: ID of the player.

##### Return Values

`(string[])`: Array of option strings.

#### currentPhase (Queue)

Returns the current [ProcessingPhase](#game-turn-processing) of a queue.

```solidity
currentPhase(uint256 queueID) public view returns (uint8)
```

##### Parameters

`(uint256)queueID`: ID of the queue.

##### Return Values

`(uint8)`: The [ProcessingPhase enumeration](#game-turn-processing) value.

#### getQueueIDs

Returns all queue IDs associated with a game.

```solidity
getQueueIDs(uint256 gameID)
    public
    view
    returns (uint256[] memory)
```

##### Parameters

`(uint256)gameID`: ID of the game.

##### Return Values

`(uint256[])`: Array of queue IDs.

#### getFailedQueue

Returns queue IDs that failed processing for a game.

```solidity
getFailedQueue(uint256 gameID)
    public
    view
    returns (uint256[] memory)
```

##### Parameters

`(uint256)gameID`: ID of the game.

##### Return Values

`(uint256[])`: Array of failed queue IDs.

---

## Xenovoya Gameplay (XenovoyaGameplay.sol)

The action resolution engine that processes submitted player actions using randomness from the queue. This contract reads queued actions, draws cards, resolves outcomes, and produces state update batches that are then applied to the board. It also supports Chainlink Automation via `shouldProgressLoop` / `progressLoop`.

### Gameplay Functions

| **Name** | **Description** | **Caller** |
| --- | --- | --- |
| [processPlayThrough](#processplaythrough) | Process all actions in a queue | Verified Controller |
| [processPlayerActions](#processplayeractions) | Apply resolved state updates to the board | Verified Controller |
| [shouldProgressLoop](#shouldprogressloop-gameplay) | Check if automation should trigger | Public |
| [progressLoop](#progressloop-gameplay) | Execute the next automation step | Verified Controller |
| [getUpdateInfo](#getupdateinfo) | Get encoded update data for a queue | Public |
| [getSummaryForUpkeep](#getsummaryforupkeep) | Decode upkeep data into a DataSummary | Public |

#### processPlayThrough

Processes all player actions in a queue. This is the main resolution function that uses VRF randomness to draw cards, determine outcomes, and compute state changes for all players in the queue.

```solidity
processPlayThrough(uint256 queueID) public
```

##### Parameters

`(uint256)queueID`: ID of the queue to process.

#### processPlayerActions

Applies resolved state updates to the game board. Takes a `DataSummary` struct describing the batch sizes of each update type.

```solidity
processPlayerActions(
    uint256 queueID,
    DataSummary memory summary
) public
```

##### Parameters

`(uint256)queueID`: ID of the queue.

`(DataSummary)summary`: A [DataSummary](#datasummary) struct describing the update batch.

#### shouldProgressLoop (Gameplay)

Returns whether the gameplay loop has work to do and the encoded data needed to perform it. Used by Chainlink Automation keepers to determine if `performUpkeep` should be called.

```solidity
shouldProgressLoop()
    public
    view
    returns (bool loopIsReady, bytes memory progressWithData)
```

##### Return Values

`(bool)loopIsReady`: Whether there is work to process.

`(bytes)progressWithData`: Encoded data to pass to `progressLoop`.

#### progressLoop (Gameplay)

Executes the next step in the gameplay processing loop. Called by Chainlink Automation or manually.

```solidity
progressLoop(bytes memory progressWithData) public
```

##### Parameters

`(bytes)progressWithData`: Encoded data from `shouldProgressLoop`.

#### getUpdateInfo

Returns encoded update information for a queue at a specific processing phase. Used internally to batch state updates.

```solidity
getUpdateInfo(
    uint256 queueID,
    uint256 processingPhase
) public view returns (bytes memory)
```

##### Parameters

`(uint256)queueID`: ID of the queue.

`(uint256)processingPhase`: The processing phase to get updates for.

##### Return Values

`(bytes)`: ABI-encoded update data.

#### getSummaryForUpkeep

Decodes upkeep perform data into a readable `DataSummary` struct, queue ID, and processing phase.

```solidity
getSummaryForUpkeep(bytes memory performData)
    public
    pure
    returns (
        DataSummary memory summary,
        uint256 queueID,
        uint256 processingPhase
    )
```

##### Parameters

`(bytes)performData`: Encoded data from upkeep.

##### Return Values

`(DataSummary)summary`: The decoded [DataSummary](#datasummary) struct.

`(uint256)queueID`: The queue being processed.

`(uint256)processingPhase`: The current processing phase.

---

## Game Setup (GameSetup.sol)

Handles game initialization, including VRF randomness requests for determining the landing site, and triggering the game start sequence once all players have registered. Also supports the `shouldProgressLoop` / `progressLoop` pattern for Chainlink Automation compatibility.

### Game Setup Functions

| **Name** | **Description** | **Caller** |
| --- | --- | --- |
| [allPlayersRegistered](#allplayersregistered) | Trigger game start sequence after all players register | Verified Controller |
| [shouldProgressLoop](#shouldprogressloop-setup) | Check if automation should trigger | Public |
| [progressLoop](#progressloop-setup) | Execute the next setup automation step | Verified Controller |

#### allPlayersRegistered

Called when all players have registered for a game. This triggers a VRF randomness request to determine the landing site. Once randomness is fulfilled, the game board is initialized and the game begins.

```solidity
allPlayersRegistered(
    uint256 gameID,
    address boardAddress
) public
```

##### Parameters

`(uint256)gameID`: ID of the game.

`(address)boardAddress`: Address of the XenovoyaBoard contract.

#### shouldProgressLoop (Setup)

Returns whether the setup loop has work to do (e.g., VRF randomness has been fulfilled and the landing site can be set).

```solidity
shouldProgressLoop()
    public
    view
    returns (bool loopIsReady, bytes memory progressWithData)
```

##### Return Values

`(bool)loopIsReady`: Whether there is setup work to process.

`(bytes)progressWithData`: Encoded data to pass to `progressLoop`.

#### progressLoop (Setup)

Executes the next setup step (e.g., setting the landing site after VRF fulfillment).

```solidity
progressLoop(bytes memory progressWithData) public
```

##### Parameters

`(bytes)progressWithData`: Encoded data from `shouldProgressLoop`.

---

## Card Deck (CardDeck.sol)

Stores all card data for the game's various decks. Each card has a title, description, quantity in the deck, and up to 3 possible outcomes determined by roll thresholds. Outcomes can adjust player stats, grant/remove items, force hand loss, and trigger movement. There are 5 deck types deployed as separate contracts:

| **Deck** | **Purpose** | **Sepolia Address** |
| --- | --- | --- |
| Event | Drawn during Day phase events | `0xb8c8C1f1ba65d1d4154bD5Cb1e964ed4099026db` |
| Ambush | Drawn during Day phase (combat encounters) | `0x77B34d8D884DbAD8416E1A8e816967831465E2F0` |
| Treasure | Drawn when digging at certain sites | `0xD2e6ebfbf197C3962F70f3c4711BE92f7519D827` |
| Land | Drawn when entering new terrain types | `0x58a4Ec84a93165A1209502a5137E81bD397d6361` |
| Relic | Drawn at relic sites | `0x97a264a0d2F1C4e4fE21119A97b5Bd480ee96fCb` |

### Card Outcome System

Each card supports a **3-outcome system** driven by roll thresholds:

- **Outcome 1**: Triggered when the roll is below threshold[0]
- **Outcome 2**: Triggered when the roll is between threshold[0] and threshold[1]
- **Outcome 3**: Triggered when the roll is above threshold[1]

Each outcome can specify:
- **Stat adjustments**: `[movement, agility, dexterity]` changes (positive or negative)
- **Item gain**: An item added to the player's inventory
- **Item loss**: An item removed from the player's inventory
- **Hand loss**: `"Left"` or `"Right"` to remove the equipped item from that hand
- **Outcome description**: Text describing what happened
- **Movement vectors**: X/Y offsets for forced movement

### Card Deck Functions

| **Name** | **Description** | **Caller** |
| --- | --- | --- |
| [drawCard](#drawcard) | Draw a random card using a VRF random word | Public |
| [chooseCard](#choosecard) | Get a specific card's outcome by name | Public |
| [getDeck](#getdeck) | Get all card titles in the deck | Public |
| [getDescription](#getdescription) | Get a card's description | Public |
| [getQuantity](#getquantity) | Get how many copies of a card are in the deck | Public |
| [getRollThresholds](#getrollthresholds) | Get the 3 roll threshold values for a card | Public |
| [getRollTypeRequired](#getrolltyperequired) | Get which stat is used for the roll check | Public |
| [getOutcomeDescription](#getoutcomedescription) | Get the 3 outcome descriptions for a card | Public |
| [getMovementAdjust](#getmovementadjust) | Get movement stat adjustments for 3 outcomes | Public |
| [getAgilityAdjust](#getagilityadjust) | Get agility stat adjustments for 3 outcomes | Public |
| [getDexterityAdjust](#getdexterityadjust) | Get dexterity stat adjustments for 3 outcomes | Public |
| [getItemGain](#getitemgain) | Get item gains for 3 outcomes | Public |
| [getItemLoss](#getitemloss) | Get item losses for 3 outcomes | Public |
| [getHandLoss](#gethandloss) | Get hand losses for 3 outcomes | Public |
| [getMovementX](#getmovementx) | Get X movement vectors for 3 outcomes | Public |
| [getMovementY](#getmovementy) | Get Y movement vectors for 3 outcomes | Public |

#### drawCard

Draws a random card from the deck using a VRF-generated random word. Returns the resolved outcome based on the roll values.

```solidity
drawCard(
    uint256 randomWord,
    uint256[3] memory rollValues
) public view returns (
    string memory _card,
    int8 _movementAdjust,
    int8 _agilityAdjust,
    int8 _dexterityAdjust,
    string memory _itemLoss,
    string memory _itemGain,
    string memory _handLoss,
    string memory _outcomeDescription
)
```

##### Parameters

`(uint256)randomWord`: A VRF-generated random number used to select the card.

`(uint256[3])rollValues`: Three values `[movement, agility, dexterity]` used against roll thresholds to determine which outcome occurs.

##### Return Values

`(string)_card`: Title of the drawn card.

`(int8)_movementAdjust`: Movement stat change from the resolved outcome.

`(int8)_agilityAdjust`: Agility stat change from the resolved outcome.

`(int8)_dexterityAdjust`: Dexterity stat change from the resolved outcome.

`(string)_itemLoss`: Item removed from inventory (empty string if none).

`(string)_itemGain`: Item added to inventory (empty string if none).

`(string)_handLoss`: `"Left"` or `"Right"` hand item loss (empty string if none).

`(string)_outcomeDescription`: Description of the resolved outcome.

#### chooseCard

Gets the resolved outcome for a specific card by name (instead of drawing randomly).

```solidity
chooseCard(
    string memory cardName,
    uint256[3] memory rollValues
) public view returns (
    string memory _card,
    int8 _movementAdjust,
    int8 _agilityAdjust,
    int8 _dexterityAdjust,
    string memory _itemLoss,
    string memory _itemGain,
    string memory _handLoss,
    string memory _outcomeDescription
)
```

##### Parameters

`(string)cardName`: Title of the card.

`(uint256[3])rollValues`: Three roll values for outcome resolution.

##### Return Values

Same as [drawCard](#drawcard).

#### getDeck

Returns the titles of all cards in the deck.

```solidity
getDeck() public view returns (string[] memory)
```

##### Return Values

`(string[])`: Array of all card titles.

#### getRollThresholds

Returns the 3 threshold values that determine which outcome is triggered for a card.

```solidity
getRollThresholds(string memory cardTitle)
    public
    view
    returns (uint256[3] memory)
```

##### Parameters

`(string)cardTitle`: Title of the card.

##### Return Values

`(uint256[3])`: Array of 3 threshold values.

---

## Game Token (GameToken.sol)

An ERC-like token system used to represent all in-game items, statuses, and entities. Tokens are tracked per game, per holder (player or zone), with support for minting, transfers between players and zones, and state management (ACTIVE vs INACTIVE). There are 6 token contract instances deployed, one for each token category:

| **Token Type** | **Purpose** | **Sepolia Address** |
| --- | --- | --- |
| DayNight | Tracks day/night phase tokens | `0xc9C290758B2257650fD2810A3fB25573D2BB216B` |
| Disaster | Disaster event tokens (e.g., volcanic eruption) | `0xAB4f8F24DC7124477cB015a380CEB16d9B083217` |
| Enemy | Enemy encounter tokens | `0xe93CA4D562a2bd00D2652461C1297a511e2801b1` |
| Item | Player items (weapons, shields, tools) | `0xf39D30995A7e4cEcc9dD76001113BC3bD3732bfC` |
| PlayerStatus | Status effects on players | `0xF6e77c9C53494664720E72d61Af3bf12D5efE486` |
| Relic | Relic tokens placed at zones | `0xd836aCAce63D0df67b107F60758cb92eaBBF0Fd0` |

### Token State

```solidity
enum TokenState {
    ACTIVE,
    INACTIVE
}
```

- **ACTIVE**: Token is in play and affects gameplay (e.g., an equipped item, an active enemy).
- **INACTIVE**: Token exists but is dormant (e.g., an item in the player's bag, not yet equipped).

### Token Functions

| **Name** | **Description** | **Caller** |
| --- | --- | --- |
| [mint](#mint) | Mint tokens to the game supply | Controller |
| [mintTo](#mintto) | Mint tokens directly to a specific holder | Controller |
| [mintAllTokens](#mintalltokens) | Mint all registered token types for a game | Controller |
| [transfer](#transfer-token) | Transfer tokens between players | Controller |
| [transferToZone](#transfertozone) | Transfer tokens from a player to a zone | Controller |
| [transferFromZone](#transferfromzone) | Transfer tokens from a zone to a player | Controller |
| [transferZoneToZone](#transferzonetozone) | Transfer tokens between zones | Controller |
| [getTokenTypes](#gettokentypes) | Get all registered token type names | Public |
| [balance](#balance) | Get token balance for a holder in a game | Public |
| [zoneBalance](#zonebalance) | Get token balance for a zone in a game | Public |
| [tokenState](#tokenstate) | Get the state of a token for a holder | Public |
| [setTokenState](#settokenstate) | Set ACTIVE/INACTIVE state for a token | Controller |

#### mint

Mints a quantity of a specific token type into the game supply (holder ID 0).

```solidity
mint(
    string memory tokenType,
    uint256 gameID,
    uint256 quantity
) public
```

##### Parameters

`(string)tokenType`: Name of the token type.

`(uint256)gameID`: ID of the game.

`(uint256)quantity`: Number of tokens to mint.

#### mintTo

Mints tokens directly to a specific recipient (player or zone).

```solidity
mintTo(
    uint256 recipient,
    string memory tokenType,
    uint256 gameID,
    uint256 quantity
) public
```

##### Parameters

`(uint256)recipient`: ID of the recipient (player ID or zone index).

`(string)tokenType`: Name of the token type.

`(uint256)gameID`: ID of the game.

`(uint256)quantity`: Number of tokens to mint.

#### mintAllTokens

Mints a quantity of every registered token type for a game. Has an overload that also sets the initial token state.

```solidity
mintAllTokens(uint256 gameID, uint256 quantity) public

mintAllTokens(
    uint256 gameID,
    uint256 quantity,
    uint8 withState
) public
```

##### Parameters

`(uint256)gameID`: ID of the game.

`(uint256)quantity`: Number of each token type to mint.

`(uint8)withState` *(optional overload)*: Initial [TokenState](#token-state) (0 = ACTIVE, 1 = INACTIVE).

#### transfer (Token)

Transfers tokens between two player holders within the same game.

```solidity
transfer(
    string memory tokenType,
    uint256 gameID,
    uint256 fromID,
    uint256 toID,
    uint256 quantity
) public
```

##### Parameters

`(string)tokenType`: Name of the token type.

`(uint256)gameID`: ID of the game.

`(uint256)fromID`: Source player ID.

`(uint256)toID`: Destination player ID.

`(uint256)quantity`: Number of tokens to transfer.

#### transferToZone

Transfers tokens from a player to a zone.

```solidity
transferToZone(
    string memory tokenType,
    uint256 gameID,
    uint256 fromID,
    uint256 toZoneIndex,
    uint256 quantity
) public
```

##### Parameters

`(string)tokenType`: Name of the token type.

`(uint256)gameID`: ID of the game.

`(uint256)fromID`: Source player ID.

`(uint256)toZoneIndex`: Destination zone index.

`(uint256)quantity`: Number of tokens to transfer.

#### transferFromZone

Transfers tokens from a zone to a player.

```solidity
transferFromZone(
    string memory tokenType,
    uint256 gameID,
    uint256 fromZoneIndex,
    uint256 toID,
    uint256 quantity
) public
```

##### Parameters

`(string)tokenType`: Name of the token type.

`(uint256)gameID`: ID of the game.

`(uint256)fromZoneIndex`: Source zone index.

`(uint256)toID`: Destination player ID.

`(uint256)quantity`: Number of tokens to transfer.

#### transferZoneToZone

Transfers tokens between two zones.

```solidity
transferZoneToZone(
    string memory tokenType,
    uint256 gameID,
    uint256 fromZoneIndex,
    uint256 toZoneIndex,
    uint256 quantity
) public
```

##### Parameters

`(string)tokenType`: Name of the token type.

`(uint256)gameID`: ID of the game.

`(uint256)fromZoneIndex`: Source zone index.

`(uint256)toZoneIndex`: Destination zone index.

`(uint256)quantity`: Number of tokens to transfer.

#### getTokenTypes

Returns all registered token type names for this token contract.

```solidity
getTokenTypes() public view returns (string[] memory)
```

##### Return Values

`(string[])`: Array of token type names.

#### balance

Returns the balance of a specific token type for a holder in a game.

```solidity
balance(
    string memory tokenType,
    uint256 gameID,
    uint256 holderID
) public view returns (uint256)
```

##### Parameters

`(string)tokenType`: Name of the token type.

`(uint256)gameID`: ID of the game.

`(uint256)holderID`: Player ID of the holder.

##### Return Values

`(uint256)`: Token balance.

#### zoneBalance

Returns the balance of a specific token type for a zone in a game.

```solidity
zoneBalance(
    string memory tokenType,
    uint256 gameID,
    uint256 zoneIndex
) public view returns (uint256)
```

##### Parameters

`(string)tokenType`: Name of the token type.

`(uint256)gameID`: ID of the game.

`(uint256)zoneIndex`: Index of the zone.

##### Return Values

`(uint256)`: Token balance at the zone.

---

## Automation / Keeper Integration

Both `XenovoyaGameplay` and `GameSetup` implement the `shouldProgressLoop` / `progressLoop` pattern, making them compatible with **Chainlink Automation** (formerly Chainlink Keepers).

### How It Works

Chainlink Automation nodes periodically call `shouldProgressLoop()` (a view function) to check if work needs to be done. If it returns `true`, the keeper calls `progressLoop(data)` to execute the next step.

```
┌──────────────────┐       ┌───────────────────┐       ┌─────────────────┐
│ Chainlink Keeper │──────▶│shouldProgressLoop()│──────▶│ progressLoop()  │
│  (off-chain)     │ poll  │   (view, no gas)   │ true  │ (state change)  │
└──────────────────┘       └───────────────────┘       └─────────────────┘
```

### Automation Flow

The full turn processing automation flow:

1. **Players submit actions** → actions queued in `XenovoyaQueue`
2. **All players submitted (or time limit)** → `requestProcessActions()` triggers VRF request
3. **VRF fulfilled** → `shouldProgressLoop()` returns `true` on `XenovoyaGameplay`
4. **Keeper calls `progressLoop()`** → `processPlayThrough()` resolves actions
5. **Play-through complete** → `shouldProgressLoop()` returns `true` again
6. **Keeper calls `progressLoop()`** → `processPlayerActions()` applies state updates
7. **State applied** → queue closed, new queue created, phase advances

### Idle Kick Mechanics

The `XenovoyaQueue` tracks idle turns per player via `idleTurns(queueID, playerID)`. If a player does not submit an action for **3 consecutive turns**, they are kicked from the game:

- `XenovoyaBoard.setPlayerInactive()` is called
- A `PlayerIdleKick` event is emitted from `GameEvents`
- The player can no longer submit actions for that game

---

## Enumerations

### Tiles

```solidity
enum Tile {
        Default,
        Jungle,
        Plains,
        Desert,
        Mountain,
        LandingSite,
        RelicMystery,
        Relic1,
        Relic2,
        Relic3,
        Relic4,
        Relic5
    }
```

### Actions

```solidity
enum Action {
        Idle,
        Move,
        SetupCamp,
        BreakDownCamp,
        Dig,
        Rest,
        Help
    }
```

### Game Turn Processing

```solidity
enum ProcessingPhase {
        Start,
        Submission,
        Processing,
        PlayThrough,
        Processed,
        Closed,
        Failed
    }
```

## Structs

### DataSummary

Used by `XenovoyaGameplay.processPlayerActions()` to describe the batch sizes of state updates to apply.

```solidity
struct DataSummary {
    uint256 playerPositionUpdates;
    uint256 playerEquips;
    uint256 zoneTransfers;
    uint256 activeActions;
    uint256 playerTransfers;
    uint256 playerStatUpdates;
}
```

#### Parameters

`(uint256)playerPositionUpdates`: Number of player position changes to process.

`(uint256)playerEquips`: Number of hand equipment changes to process.

`(uint256)zoneTransfers`: Number of zone-to-zone token transfers to process.

`(uint256)activeActions`: Number of active action updates to process.

`(uint256)playerTransfers`: Number of player-to-player token transfers to process.

`(uint256)playerStatUpdates`: Number of player stat (movement/agility/dexterity) updates to process.

### Event Summary

```solidity
struct EventSummary {
        uint256 playerID;
        string cardType;
        string cardDrawn;
        uint8 currentAction;
        string cardResult;
        string[3] inventoryChanges;
        int8[3] statUpdates;
        string[] movementPath;
    }
```

#### Parameters

`(uint256)playerID`: The ID of the player associated with this event.

`(string)cardType`: The card type drawn during the event, e.g. Ambush, Event, Treasure.

`(string)cardDrawn`: The card title drawn by each player during the event.

`(string)cardResult`: A description of the result of the card drawn during the event.

`(string[3])inventoryChanges`: The inventory changes that occur as a result of the card drawn. There are 3 values that get returned, `[item loss, item gain, hand loss]`, where item loss is an item that is removed from the player's inventory (if present), item gain is an item that is added to the player's inventory, and hand loss is either "Right" or "Left" to represent a player losing whatever item they have equipped in that particular hand. Any or all of these 3 array elements may be empty strings, which represents no action.

`(int8[3])statUpdates`: An array of player attribute adjustments with a representation of `[movement adjustment, agility adjustment, dexterity adjustment]`. Each value can be a positive or negative integer. A positive value will increase a particular attribute up to the maximum allowed and negative will reduce a particular attribute down to a minimum of 0.

`(string[])movementPath`: An array of zone aliases which define the movement path of the player during the event.

### InventoryItem

```solidity
struct InventoryItem {
        string item;
        uint256 quantity;
    }
```

#### Parameters

`(string)item`: The name of the item in inventory.

`(uint256)quantity`: The quantity of this item held in inventory.

### ZoneInventory

```solidity
 struct ZoneInventory {
        string zoneAlias;
        InventoryItem[] inventory;
    }
```

#### Parameters

`(string)zoneAlias`: The alias of the play zone, e.g. `"3,4"`

`(InventoryItem[])inventory`: An array of [InventoryItem](#inventoryitem) structs.

### PlayerInfo

```solidity
struct PlayerInfo {
        uint256 playerID;
        address playerAddress;
        uint256 idleTurns;
        bool isActive;
    }
```

#### Parameters

`uint256(playerID)`: The ID of the player used within the game.

`address(playerAddress)`: The address of the player.

`uint256(idleTurns)`: How many turns the player has been idle for.

`bool(isActive)`: Whether or not the player is active in this game. Players may be registered but not active.
