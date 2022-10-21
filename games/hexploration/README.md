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

#### activeZones

Description goes here

```solidity
activeZones(address gameBoardAddress, uint256 gameID)
    public
    view
    returns (string[] memory zones, uint16[] memory tiles)
```

##### Parameters

- `(uint256)param1`: param 1 description

##### Return Values

- `(uint256)returnValue1`: What gets returned

#### allPlayerLocations

Description goes here

    methodSignature goes here

##### Parameters

- `(uint256)param1`: param 1 description

##### Return Values

- `(uint256)returnValue1`: What gets returned

#### boardSize

Description goes here

    methodSignature goes here

##### Parameters

- `(uint256)param1`: param 1 description

##### Return Values

- `(uint256)returnValue1`: What gets returned

#### canDigAtZone

Description goes here

    methodSignature goes here

##### Parameters

- `(uint256)param1`: param 1 description

##### Return Values

- `(uint256)returnValue1`: What gets returned

#### currentGameplayQueue

Description goes here

    methodSignature goes here

##### Parameters

- `(uint256)param1`: param 1 description

##### Return Values

- `(uint256)returnValue1`: What gets returned

#### currentPhase

Description goes here

    methodSignature goes here

##### Parameters

- `(uint256)param1`: param 1 description

##### Return Values

- `(uint256)returnValue1`: What gets returned

#### getAvailableGames

Description goes here

    methodSignature goes here

##### Parameters

- `(uint256)param1`: param 1 description

##### Return Values

- `(uint256)returnValue1`: What gets returned

#### landingSite

Description goes here

    methodSignature goes here

##### Parameters

- `(uint256)param1`: param 1 description

##### Return Values

- `(uint256)returnValue1`: What gets returned

#### lastDayPhaseEvents

Description goes here

    methodSignature goes here

##### Parameters

- `(uint256)param1`: param 1 description

##### Return Values

- `(uint256)returnValue1`: What gets returned

#### lastPlayerActions

Description goes here

    methodSignature goes here

##### Parameters

- `(uint256)param1`: param 1 description

##### Return Values

- `(uint256)returnValue1`: What gets returned

#### totalPlayers

Description goes here

    methodSignature goes here

##### Parameters

- `(uint256)param1`: param 1 description

##### Return Values

- `(uint256)returnValue1`: What gets returned

#### getPlayerID

Description goes here

    methodSignature goes here

##### Parameters

- `(uint256)param1`: param 1 description

##### Return Values

- `(uint256)returnValue1`: What gets returned

#### isActive

Description goes here

    methodSignature goes here

##### Parameters

- `(uint256)param1`: param 1 description

##### Return Values

- `(uint256)returnValue1`: What gets returned

#### isRegistered

Description goes here

    methodSignature goes here

##### Parameters

- `(uint256)param1`: param 1 description

##### Return Values

- `(uint256)returnValue1`: What gets returned

#### activeAction

Description goes here

    methodSignature goes here

##### Parameters

- `(uint256)param1`: param 1 description

##### Return Values

- `(uint256)returnValue1`: What gets returned

#### activeInventory

Description goes here

    methodSignature goes here

##### Parameters

- `(uint256)param1`: param 1 description

##### Return Values

- `(uint256)returnValue1`: What gets returned

#### currentHandInventory

Description goes here

    methodSignature goes here

##### Parameters

- `(uint256)param1`: param 1 description

##### Return Values

- `(uint256)returnValue1`: What gets returned

#### currentLocation

Description goes here

    methodSignature goes here

##### Parameters

- `(uint256)param1`: param 1 description

##### Return Values

- `(uint256)returnValue1`: What gets returned

#### currentPlayerStats

Description goes here

    methodSignature goes here

##### Parameters

- `(uint256)param1`: param 1 description

##### Return Values

- `(uint256)returnValue1`: What gets returned

#### inactiveInventory

Description goes here

    methodSignature goes here

##### Parameters

- `(uint256)param1`: param 1 description

##### Return Values

- `(uint256)returnValue1`: What gets returned

#### isAtCampsite

Description goes here

    methodSignature goes here

##### Parameters

- `(uint256)param1`: param 1 description

##### Return Values

- `(uint256)returnValue1`: What gets returned

## Game Controller (HexplorationController.sol)

### Functions

| **Name**                                    | **Description**                      |
| ------------------------------------------- | ------------------------------------ | ------ |
| [](#)                                       |                                      | Player |
| [](#)                                       |                                      | Player |
| [](#)                                       |                                      | Player |
| [](#)                                       |                                      | Player |
| [](#)                                       |                                      | Player |
| [](#)                                       |                                      | Player |
| [getRace](#getrace)                         | Gets race log with all race data.    |        |
| [registerRace](#races)                      | Creates a new Race Log.              |        |
| [enterRace](#enterrace)                     | Enters a racer into a race.          |        |
| [getMyRaces](#getmyraces)                   | Gets registered races                |        |
| [getCurrentPositions](#getcurrentpositions) | Get positions of all racers          |        |
| [getCurrentStats](#getcurrentpositions)     | Get speed and position of a racer.   |        |
| [getItemInventory](#getiteminventory)       | Get a racer's available items.       |        |
| [getRacers](#getracers)                     | Get all racers in a race.            |        |
| [isInRace](#isinrace)                       | Check if in race & retrieve racer ID |        |
| [submitUserChoices](#submituserchoices)     | Submit user action and lane choice.  |        |
| [testPickupAction](#testpickupaction)       | Testing: manually add to inventory   |        |

#### getRace

Get logs for a given race.

    function getRace(uint raceID) public view returns(RaceLog memory race)

##### Parameters

- `raceID`: The ID of the race

##### Return Values

- `race`: A [RaceLog struct](#racelog) with all logged race data

##### RaceLog

    struct RaceLog {
            uint256 id;
            address coordinator;
            address gameLoop;
            uint256 trackId;
            uint256 laps;
            uint256 spaces;
            uint256[] racers;
            uint256[3][] actionsAcquired;
            uint256[3][] actionsUsed;
            uint256[3][] laneChanges;
            uint256[2][] randomNumbers;
            uint256[][] boostsUsed;
            uint256[] results;
            uint256 entryFee;
            uint256 updates;
            uint256 lastUpdate;
        }

## Game Events (GameEvents.sol)

### Functions

| **Name**                                    | **Description**                      |
| ------------------------------------------- | ------------------------------------ |
| [getRace](#getrace)                         | Gets race log with all race data.    |
| [registerRace](#races)                      | Creates a new Race Log.              |
| [enterRace](#enterrace)                     | Enters a racer into a race.          |
| [getMyRaces](#getmyraces)                   | Gets registered races                |
| [getCurrentPositions](#getcurrentpositions) | Get positions of all racers          |
| [getCurrentStats](#getcurrentpositions)     | Get speed and position of a racer.   |
| [getItemInventory](#getiteminventory)       | Get a racer's available items.       |
| [getRacers](#getracers)                     | Get all racers in a race.            |
| [isInRace](#isinrace)                       | Check if in race & retrieve racer ID |
| [submitUserChoices](#submituserchoices)     | Submit user action and lane choice.  |
| [testPickupAction](#testpickupaction)       | Testing: manually add to inventory   |

#### getRace

Get logs for a given race.

    function getRace(uint raceID) public view returns(RaceLog memory race)

##### Parameters

- `raceID`: The ID of the race

##### Return Values

- `race`: A [RaceLog struct](#racelog) with all logged race data

##### RaceLog

    struct RaceLog {
            uint256 id;
            address coordinator;
            address gameLoop;
            uint256 trackId;
            uint256 laps;
            uint256 spaces;
            uint256[] racers;
            uint256[3][] actionsAcquired;
            uint256[3][] actionsUsed;
            uint256[3][] laneChanges;
            uint256[2][] randomNumbers;
            uint256[][] boostsUsed;
            uint256[] results;
            uint256 entryFee;
            uint256 updates;
            uint256 lastUpdate;
        }
