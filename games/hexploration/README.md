# Setup

## Install Game Core

`yarn add @luckymachines/game-core`

or

`npm install @luckymachines/game-core`

## Import ABIs

    import SummaryABI from "@luckymachines/game-core/games/hexploration/abi/GameSummary.json";
    import ControllerABI from "@luckymachines/game-core/games/hexploration/abi/HexplorationController.json";
    import EventsABI from "@luckymachines/game-core/games/hexploration/abi/GameEvents.json";

# Documentation

## Deployed Contracts:

Deployed contract addresses can be found in games/hexploration/deployments.json

## Game Summary (GameSummary.sol)

A contract with all view functions that return summaries of current game state. Some methods are callable by anyone (designated as Public in the table below), others are designed to be called directly by the player (designated as Player in the table below). Player designated functions should always be called via the user's connected wallet to return specific information to their game. Public designated functions can be called from any source, including a private provider.

### Game Summary Functions

| **Name**                                      | **Description**                          | **Caller** |
| --------------------------------------------- | ---------------------------------------- | ---------- |
| [activeZones](#activezones)                   |                                          | Public     |
| [allPlayerLocations](#allplayerlocations)     |                                          | Public     |
| [boardSize](#boardsize)                       | The size of the game board (rows x cols) | Public     |
| [canDigAtZone](#candigatzone)                 |                                          | Public     |
| [currentGameplayQueue](#currentgameplayqueue) |                                          | Public     |
| [currentPhase](#currentphase)                 |                                          | Public     |
| [getAvailableGames](#getavailablegames)       |                                          | Public     |
| [landingSite](#landingsite)                   |                                          | Public     |
| [lastDayPhaseEvents](#lastdayphaseevents)     |                                          | Public     |
| [lastPlayerActions](#lastplayeractions)       |                                          | Public     |
| [totalPlayers](#totalplayers)                 |                                          | Public     |

### Player Summary Functions

| **Name**                                      | **Description** | **Caller** |
| --------------------------------------------- | --------------- | ---------- |
| [getPlayerID](#getplayerid)                   |                 | Public     |
| [isActive](#isactive)                         |                 | Public     |
| [isRegistered](#isregistered)                 |                 | Public     |
| [activeAction](#activeaction)                 |                 | Player     |
| [activeInventory](#activeinventory)           |                 | Player     |
| [currentHandInventory](#currenthandinventory) |                 | Player     |
| [currentLocation](#currentlocation)           |                 | Player     |
| [currentPlayerStats](#currentplayerstats)     |                 | Player     |
| [inactiveInventory](#inactiveinventory)       |                 | Player     |
| [isAtCampsite](#isatcampsite)                 |                 | Player     |

### Enumerations

#### Tiles

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

#### Actions

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

#### activeZones

Description goes here

```solidity
activeZones(address gameBoardAddress, uint256 gameID)
    public
    view
    returns (string[] memory zones, uint16[] memory tiles)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board.

`(uint256)gameID`: ID of the game.

##### Return Values

`(string[])zones`: An array of all zones which have been revealed on the game board. Zones are labeled as a string in the form "x,y", representing the coordinates on the game board grid. (TODO: show sample grid)

`(uint16[])tiles`: An array of all revealed zone tiles. Position corresponds with position of zones, e.g. tiles[1] will be the tile associated with zones[1]. See [Tile enumeration](#tiles).

#### allPlayerLocations

Description goes here

```solidity
allPlayerLocations(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (uint256[] memory playerIDs, string[] memory playerZones)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board.

`(uint256)gameID`: ID of the game.

##### Return Values

`(uint256[])playerIDs`: An array of player IDs of all players registered for game.

`(string[])playerZones`: An array of zones in which each of the players is currently located. Position corresponds with position of playerIDs, e.g. playerZones[2] will be the location of the player with ID playerIDs[2].

#### boardSize

Description goes here

```solidity
boardSize(address gameBoardAddress)
        public
        view
        returns (uint256 rows, uint256 columns)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board.

##### Return Values

`(uint256)rows`: Number of rows in the game board hex grid.

`(uint256)columns`: Number of columns in the game board hex grid.

#### canDigAtZone

Description goes here

```solidity
canDigAtZone(
        address gameBoardAddress,
        uint256 gameID,
        string memory _zoneAlias
    ) public view returns (bool diggingAllowed)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board.

`(uint256)gameID`: ID of the game.

`(uint256)_zoneAlias_`: Alias of the zone to query. This is the string representation of the column(x) and the row(y) in the form "x,y", e.g. "2,3" for zone at column 2, row 3.

##### Return Values

`(bool)diggingAllowed`: Whether or not digging is allowed at this site. This is a general method for all players and does not take into account a player who possesses an Artifact, and is thus unable to dig at any site until the Artifact is dropped off at the ship.

#### currentGameplayQueue

Description goes here

```solidity
currentGameplayQueue(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (uint256 queueID)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board.

`(uint256)gameID`: ID of the game.

##### Return Values

`(uint256)queueID`: The current queue ID with player actions for the current turn. This queue ID gets updated at each new game phase (day / night).

#### currentPhase

Description goes here

```solidity
currentPhase(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (string memory phase)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board.

`(uint256)gameID`: ID of the game.

##### Return Values

`(string)phase`: Current game phase, i.e. day or night.

#### getAvailableGames

Description goes here

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

`(address)gameBoardAddress`: Contract address of the game board.

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

`(address)gameBoardAddress`: Contract address of the game board.

`(uint256)gameID`: ID of the game.

##### Return Values

`(string)zoneAlias`: The zone alias of the landing site.

#### lastDayPhaseEvents

Description goes here

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

`(address)gameBoardAddress`: Contract address of the game board.

`(uint256)gameID`: ID of the game.

##### Return Values

`(uint256[])playerIDs`: An array of player IDs of all players registered for the game.

`(string[])cardTypes`: An array of card types drawn by each player during the day phase events, i.e. Ambush or Event.

`(string[])cardsDrawn`: An array of the titles of cards drawn by each player during the day phase events.

`(string[])cardResults`: An array of the descriptions of the result of each card drawn by each player during the day phase events.

`(string[3])inventoryChanges`: The inventory changes that occur as a result of the card drawn. There are 3 values that get returned, `[item loss, item gain, hand loss]`, where item loss is an item that is removed from the player's inventory (if present), item gain is an item that is added to the player's inventory, and hand loss is either "Right" or "Left" to represent a player losing whatever item they have equipped in that particular hand. Any or all of these 3 array elements may be empty strings, which represents no action.

`(int8[3])statUpdates`: An array of player attribute adjustments with a representation of `[movement adjustment, agility adjustment, dexterity adjustment]`. Each value can be a positive or negative integer. A positive value will increase a particular attribute up to the maximum allowed and negative will reduce a particular attribute down to a minimum of 0.

#### lastPlayerActions

Description goes here

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

`(address)gameBoardAddress`: Contract address of the game board.

`(uint256)gameID`: ID of the game.

##### Return Values

`(uint256[])playerIDs`: An array of player IDs of all players registered for the game

`(string[])activeActionCardTypes`: An array of card types drawn by each player during the player action processing phase (if any). Cards are drawn as a result of a dig and will be of type Ambush or Treasure.

`(string[])activeActionCardsDrawn`: An array of the titles of cards drawn by each player during the player action processing phase.

`(uint8[])currentActiveActions`: An array of actions being performed by each player during the player action processing phase. See [Action enumeration](#actions).

`(string[])cardResults`: An array of the descriptions of the result of each card drawn by each player during the player action processing phase.

`(string[3])inventoryChanges`: The inventory changes that occur as a result of the card drawn. There are 3 values that get returned, `[item loss, item gain, hand loss]`, where item loss is an item that is removed from the player's inventory (if present), item gain is an item that is added to the player's inventory, and hand loss is either "Right" or "Left" to represent a player losing whatever item they have equipped in that particular hand. Any or all of these 3 array elements may be empty strings, which represents no action.

`(int8[3])statUpdates`: An array of player attribute adjustments with a representation of `[movement adjustment, agility adjustment, dexterity adjustment]`. Each value can be a positive or negative integer. A positive value will increase a particular attribute up to the maximum allowed and negative will reduce a particular attribute down to a minimum of 0.

#### totalPlayers

The total number of players registered for a given game.

```solidity
totalPlayers(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (uint256 numPlayers)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board.

`(uint256)gameID`: ID of the game.

##### Return Values

`(uint256)numPlayers`: How many players are registered for the specified game.

#### getPlayerID

Returns a player ID from a specified wallet address.

```solidity
getPlayerID(
        address gameBoardAddress,
        uint256 gameID,
        address playerAddress
    ) public view returns (uint256 playerID)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board.

`(uint256)gameID`: ID of the game.

`(address)playerAddress`: Wallet address of the player.

##### Return Values

`(uint256)playerID`: The player ID used to represent a player in a given game.

#### isActive

Returns whether or not a given player is active in a given game. Players might get kicked from idleness, which would put them into this inactive state.

```solidity
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

`(address)gameBoardAddress`: Contract address of the game board.

`(uint256)gameID`: ID of the game.

`(address)playerAddress or (uint256)playerID`: This is an overloaded function so you can either pass the wallet address of the player or the player ID for the given game.

##### Return Values

`(bool)playerIsActive`: Whether or not the player is active in the specified game.

#### isRegistered

Returns whether or not a player is registered for a given game. Players might be registered, but inactive, so this is only valuable to learn who originally joined a game, not necessarily who is currently active. See [isActive](#isactive).

```solidity
isRegistered(
        address gameBoardAddress,
        uint256 gameID,
        address playerAddress
    ) public view returns (bool)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board.

`(uint256)gameID`: ID of the game.

##### Return Values

`(bool)playerIsRegistered`: Whether or not the player is registered for the specified game.

#### activeAction

Description goes here

```solidity
activeAction(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (string memory action)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board.

`(uint256)gameID`: ID of the game.

##### Return Values

`(string)action`: Latest action for the current player

#### activeInventory

This represents a player's active inventory: all of the tokens active on their player card.

```solidity
activeInventory(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (
            string memory artifact,
            string memory status,
            string memory relic,
            bool shield,
            bool campsite
        )
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board.

`(uint256)gameID`: ID of the game.

##### Return Values

`(string)artifact`:

`(string)status`:

`(string)relic`:

`(bool)shield`:

`(bool)campsite`:

#### currentHandInventory

The items equipped in the player's hands, as represented on the player card.

```solidity
currentHandInventory(address gameBoardAddress, uint256 gameID)
        public
        view
        returns (string memory leftHandItem, string memory rightHandItem)
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board.

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
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board.

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
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board.

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
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board.

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
```

##### Parameters

`(address)gameBoardAddress`: Contract address of the game board.

`(uint256)gameID`: ID of the game.

##### Return Values

`(bool)atCampsite`: Whether or not the player is currently at a campsite.

## Game Controller (HexplorationController.sol)

### Functions

| **Name** | **Description** |
| -------- | --------------- |
|          |                 |
|          |                 |
|          |                 |
|          |                 |
|          |                 |
|          |                 |
|          |                 |
|          |                 |

#### methodName

Method description

    method signature

##### Parameters

- `(type)parameter1`: About param 1

##### Return Values

- `(type)return1`: About return 1

## Game Events (GameEvents.sol)

### Functions

| **Name** | **Description** |
| -------- | --------------- |
|          |                 |
|          |                 |
|          |                 |
|          |                 |
|          |                 |
|          |                 |
|          |                 |
|          |                 |

#### methodName

Method description

    method signature

##### Parameters

- `(type)parameter1`: About param 1

##### Return Values

- `(type)return1`: About return 1

## Game Events (GameEvents.sol)
