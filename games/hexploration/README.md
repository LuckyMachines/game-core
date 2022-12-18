# Setup

## Install Game Core

`yarn add @luckymachines/game-core`

or

`npm install @luckymachines/game-core`

## Import ABIs

    import GameSummaryABI from "@luckymachines/game-core/games/hexploration/abi/GameSummary.json";
    import PlayerSummaryABI from "@luckymachines/game-core/games/hexploration/abi/PlayerSummary.json";
    import ControllerABI from "@luckymachines/game-core/games/hexploration/abi/HexplorationController.json";
    import EventsABI from "@luckymachines/game-core/games/hexploration/abi/GameEvents.json";

# Documentation

## Getting Started:

All frontend interactions will potentially interact with three contracts:

- [Game Controller](#game-controller-hexplorationcontrollersol): Players submit game moves through this contract.
- [Game Events](#game-events-gameeventssol): All game events are emitted here. Subscribe to any events from this contract.
- [Game Summary](#game-summary-gamesummarysol): Various summaries of current game state. These are all view functions and can be called freely at no cost.
- [Player Summary](#player-summary-playersummarysol): Various summaries of current player state. These are all view functions and can be called freely at no cost.

## Deployed Contracts:

Deployed contract addresses can be found in [games/hexploration/deployments.json](https://github.com/LuckyMachines/game-core/blob/docs/games/hexploration/deployments.json)

---

## Game Summary (GameSummary.sol)

A contract with all view functions that return summaries of current game state.

### Game Summary Functions

| **Name**                                                      | **Description**                          | **Caller** |
| ------------------------------------------------------------- | ---------------------------------------- | ---------- |
| [activeZones](#activezones)                                   | All zones that have been revealed        | Public     |
| [allPlayerActiveInventories](#allplayeractiveinventories)     | All players active inventories           | Public     |
| [allPlayerInactiveInventories](#allplayerinactiveinventories) | All players inactive inventories         | Public     |
| [allPlayerLocations](#allplayerlocations)                     | Locations of all players in the game     | Public     |
| [boardSize](#boardsize)                                       | The size of the game board (rows x cols) | Public     |
| [canDigAtZone](#candigatzone)                                 | Check if digging is available            | Public     |
| [currentDay](#currentday)                                     | The current day of a given game          | Public     |
| [currentGameplayQueue](#currentgameplayqueue)                 | The ID of the current gameplay queue     | Public     |
| [currentPhase](#currentphase)                                 | The current game phase (Day / Night)     | Public     |
| [gameStarted](#gamestarted)                                   | Check if a game has started              | Public     |
| [getAvailableGames](#getavailablegames)                       | All available open games                 | Public     |
| [landingSite](#landingsite)                                   | The landing site for a given game        | Public     |
| [lastDayPhaseEvents](#lastdayphaseevents)                     | Summary of the latest day phase events   | Public     |
| [lastPlayerActions](#lastplayeractions)                       | Summary of the latest player actions     | Public     |
| [recoveredArtifacts](#recoveredartifacts)                     | List of all recovered artifacts          | Public     |
| [totalPlayers](#totalplayers)                                 | Total players registered for a game      | Public     |

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

`(string[3])inventoryChanges`: The inventory changes that occur as a result of the card drawn. There are 3 values that get returned, `[item loss, item gain, hand loss]`, where item loss is an item that is removed from the player's inventory (if present), item gain is an item that is added to the player's inventory, and hand loss is either "Right" or "Left" to represent a player losing whatever item they have equipped in that particular hand. Any or all of these 3 array elements may be empty strings, which represents no action.

`(int8[3])statUpdates`: An array of player attribute adjustments with a representation of `[movement adjustment, agility adjustment, dexterity adjustment]`. Each value can be a positive or negative integer. A positive value will increase a particular attribute up to the maximum allowed and negative will reduce a particular attribute down to a minimum of 0.

#### lastPlayerActions

A summary of the latest actions taken by the player and their outcomes where necessary.

```solidity
lastPlayerActions(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (
            uint256[] memory playerIDs,
            string[] memory activeActionCardTypes,
            string[] memory activeActionCardsDrawn,
            uint8[] memory currentActiveActions,
            string[] memory activeActionCardResults,
            string[3][] memory activeActionCardInventoryChanges,
            int8[3][] memory activeActionStatUpdates
        )
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board. This can be found in [deployments.json](#deployed-contracts).

`(uint256)gameID`: ID of the game.

##### Return Values

`(uint256[])playerIDs`: An array of player IDs of all players registered for the game

`(string[])activeActionCardTypes`: An array of card types drawn by each player during the player action processing phase (if any). Cards are drawn as a result of a dig and will be of type Ambush or Treasure.

`(string[])activeActionCardsDrawn`: An array of the titles of cards drawn by each player during the player action processing phase.

`(uint8[])currentActiveActions`: An array of actions being performed by each player during the player action processing phase. See [Action enumeration](#actions).

`(string[])cardResults`: An array of the descriptions of the result of each card drawn by each player during the player action processing phase.

`(string[3])inventoryChanges`: The inventory changes that occur as a result of the card drawn. There are 3 values that get returned, `[item loss, item gain, hand loss]`, where item loss is an item that is removed from the player's inventory (if present), item gain is an item that is added to the player's inventory, and hand loss is either "Right" or "Left" to represent a player losing whatever item they have equipped in that particular hand. Any or all of these 3 array elements may be empty strings, which represents no action.

`(int8[3])statUpdates`: An array of player attribute adjustments with a representation of `[movement adjustment, agility adjustment, dexterity adjustment]`. Each value can be a positive or negative integer. A positive value will increase a particular attribute up to the maximum allowed and negative will reduce a particular attribute down to a minimum of 0.

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
| [inactiveInventory](#inactiveinventory)               | Items held by player, but not active (in bag) | Public / Player |
| [isAtCampsite](#isatcampsite)                         | Check if player is at a campsite              | Public / Player |
| [playerRecoveredArtifacts](#playerrecoveredartifacts) | List of all artifacts recovered by player     | Public / Player |

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

## Game Controller (HexplorationController.sol)

A contract with all of the interactions required by the player to [create](#requestnewgame), [join](#registerforgame), and [play](#submitaction) Hexploration. This contract is generally meant to be interacted with directly by the player, so these methods should always be called from a player's connected wallet. The exception is in [requesting a new game](#requestnewgame), which is a function callable by anyone, so it can potentially be called via a private provider.

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

- **Help**: The ID of the player to help / revive, e,g, `["3"]`.

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
event GameRegistration(uint256 indexed gameID, address playerAddress)
```

##### Parameters

`(uint256)gameID`: The game for which the player registered.

`(address)playerAddress`: The wallet address of the registered player.

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

#### TurnProcessingStart

This event is emitted when the [turn processing phase](#game-turn-processing) is set to `Processing`.

```solidity
event TurnProcessingStart(uint256 indexed gameID, uint256 timeStamp)
```

##### Parameters

`(uint256)gameID`: The game in which the turn processing phase started.

`(uint256)timeStamp`: The time the action was submitted.

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
