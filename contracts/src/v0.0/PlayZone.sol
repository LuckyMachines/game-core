// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "./Ruleset.sol";
import "./GameBoard.sol";
import "./GameRegistry.sol";

contract PlayZone is AccessControlEnumerable {
    bytes32 public constant GAME_BOARD_ROLE = keccak256("GAME_BOARD_ROLE");
    bytes32 public constant FACTORY_ROLE = keccak256("FACTORY_ROLE");
    bytes32 public constant CONTROLLER_ROLE = keccak256("CONTROLLER_ROLE");

    Ruleset internal RULESET;
    address public gameRegistryAddress;
    address public rulesetAddress;
    uint256 public rulesetVersion;

    // Mappings from GameID => alias (set in gameboard)
    mapping(uint256 => mapping(string => uint256)) public ruleset; // returns ruleset ID
    mapping(uint256 => mapping(string => uint256)) public entryCount;
    mapping(uint256 => mapping(string => uint256)) public playerCount;
    mapping(uint256 => mapping(string => uint256)) public exitCount;
    mapping(uint256 => mapping(string => mapping(address => bool)))
        internal playerInZone;

    // right now players can interact with zone,
    // zone cannot perform action on all players
    // as no list of players is stored here
    // May be able to query game board for list of players if necessary

    // integrated custom game contract may have this capability, but
    // zone itself can only check if player is allowed to play and
    // ensure total number of players is correct

    // game board may attempt to exit player
    // zone logic will determine if this is allowed

    modifier onlyFactoryAdmin() {
        require(
            hasRole(FACTORY_ROLE, _msgSender()) ||
                hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            "Game Master or Factory role required"
        );
        _;
    }

    constructor(
        address _rulesetAddress,
        address _gameRegistryAddress,
        address adminAddress,
        address factoryAddress
    ) {
        RULESET = Ruleset(_rulesetAddress);
        gameRegistryAddress = _gameRegistryAddress;
        rulesetAddress = _rulesetAddress;
        rulesetVersion = RULESET.version();
        _setupRole(DEFAULT_ADMIN_ROLE, adminAddress);
        if (factoryAddress != address(0)) {
            _setupRole(FACTORY_ROLE, factoryAddress);
        }
    }

    function addGameBoard(address gameBoardAddress) public onlyFactoryAdmin {
        _setupRole(GAME_BOARD_ROLE, gameBoardAddress);
    }

    function removeGameBoard(address gameBoardAddress)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _revokeRole(GAME_BOARD_ROLE, gameBoardAddress);
    }

    function addController(address controllerAddress) public onlyFactoryAdmin {
        _setupRole(CONTROLLER_ROLE, controllerAddress);
    }

    function removeController(address controllerAddress)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _revokeRole(CONTROLLER_ROLE, controllerAddress);
    }

    function setRules(
        uint256 rulesetID,
        uint256 gameID,
        string memory zoneAlias
    ) public onlyFactoryAdmin {
        ruleset[gameID][zoneAlias] = rulesetID;
    }

    // Player functions
    function attemptExit(
        uint256 exitPathIndex,
        uint256 gameID,
        address gameBoardAddress
    ) public {
        GameBoard(gameBoardAddress).exitToPath(
            gameID,
            msg.sender,
            exitPathIndex
        );
    }

    function attemptExitFor(
        address playerAddress,
        uint256 exitPathIndex,
        uint256 gameID,
        string memory zoneAlias,
        address gameBoardAddress
    ) public {
        require(
            playerCanExit(playerAddress, gameID, zoneAlias),
            "player cannot exit zone"
        );
        bool exitSuccess = GameBoard(gameBoardAddress).exitToPath(
            gameID,
            playerAddress,
            exitPathIndex
        );
        require(exitSuccess, "player unable to enter on exit");
    }

    // Validation etc is done on the custom contract in _customAction()
    function performCustomAction(
        string[] memory stringParams,
        address[] memory addressParams,
        uint256[] memory uintParams
    ) public {
        _customAction(stringParams, addressParams, uintParams);
    }

    function playersInZone() public view returns (uint256[] memory) {
        // cycle through registry, return list of players in zone
    }

    // TODO: figure this out...
    // function resetZone() public onlyRole(???) {}

    function playerInPlayableState(address playerAddress, uint256 gameID)
        internal
        view
        returns (bool playable)
    {
        address gameBoard = GameRegistry(gameRegistryAddress).gameBoard(gameID);
        if (GameBoard(gameBoard).gameState(gameID) > 1) {
            playable = true;
        } else {
            playable = false;
        }

        // TODO: check for transit group action
    }

    function playerCanEnter(
        address playerAddress,
        uint256 gameID,
        string memory zoneAlias
    ) public view virtual returns (bool canEnter) {
        canEnter = true;
        //canEnter = playerInPlayableState(playerAddress, gameID);
        if (playerInZone[gameID][zoneAlias][playerAddress]) {
            // already here, can't enter again
            canEnter = false;
        } else {
            uint256 rulesetID = ruleset[gameID][zoneAlias];
            if (rulesetID != 0) {
                // check against rules if set
                if (
                    RULESET.rules(rulesetID, 0) &&
                    playerCount[gameID][zoneAlias] >=
                    RULESET.maxCapacity(rulesetID)
                ) {
                    canEnter = false;
                } else if (
                    RULESET.rules(rulesetID, 1) &&
                    entryCount[gameID][zoneAlias] >=
                    RULESET.maxEntrySize(rulesetID)
                ) {
                    canEnter = false;
                }
            }
        }
        //TODO: make sure payout on exit / entry can be paid before allowing entry
    }

    function playerCanExit(
        address playerAddress,
        uint256 gameID,
        string memory zoneAlias
    ) public view virtual returns (bool canExit) {
        canExit = true;
        //canExit = playerInPlayableState(playerAddress, gameID);

        if (!playerInZone[gameID][zoneAlias][playerAddress]) {
            // not here, can't exit if already gone
            canExit = false;
        } else {
            uint256 rulesetID = ruleset[gameID][zoneAlias];
            if (rulesetID != 0) {
                if (
                    RULESET.rules(rulesetID, 2) &&
                    exitCount[gameID][zoneAlias] >=
                    RULESET.maxExitSize(rulesetID)
                ) {
                    canExit = false;
                }
            }
        }
    }

    function enterPlayer(
        address playerAddress,
        uint256 gameID,
        string memory zoneAlias
    ) external onlyRole(GAME_BOARD_ROLE) {
        require(
            playerCanEnter(playerAddress, gameID, zoneAlias),
            "player cannot enter zone"
        );
        _enterPlayer(playerAddress, gameID, zoneAlias);
    }

    function exitPlayer(
        address playerAddress,
        uint256 gameID,
        string memory zoneAlias
    ) external onlyRole(GAME_BOARD_ROLE) {
        require(
            playerCanExit(playerAddress, gameID, zoneAlias),
            "player cannot exit zone"
        );
        _exitPlayer(playerAddress, gameID, zoneAlias);
    }

    // used when a player is entirely removed from game, e.g. runs out of credits
    function removePlayer(
        address playerAddress,
        uint256 gameID,
        string memory zoneAlias
    ) external onlyRole(GAME_BOARD_ROLE) {
        _removePlayer(playerAddress, gameID, zoneAlias);
    }

    function _enterPlayer(
        address playerAddress,
        uint256 gameID,
        string memory zoneAlias
    ) internal {
        _playerWillEnter(playerAddress, gameID, zoneAlias);
        //TODO:
        // payout on entry if set and balance allows
        playerInZone[gameID][zoneAlias][playerAddress] = true;
        playerCount[gameID][zoneAlias]++;
        entryCount[gameID][zoneAlias]++;
        // tell game board to update player position
        address gbAddress = GameRegistry(gameRegistryAddress).gameBoard(gameID);
        GameBoard(gbAddress).playerEnteredZone(
            gameID,
            playerAddress,
            zoneAlias
        );
        _playerDidEnter(playerAddress, gameID, zoneAlias);
    }

    function _exitPlayer(
        address playerAddress,
        uint256 gameID,
        string memory zoneAlias
    ) internal {
        _playerWillExit(playerAddress, gameID, zoneAlias);
        playerInZone[gameID][zoneAlias][playerAddress] = false;
        playerCount[gameID][zoneAlias] = playerCount[gameID][zoneAlias] > 0
            ? playerCount[gameID][zoneAlias] - 1
            : 0;
        exitCount[gameID][zoneAlias]++;
        //TODO:
        // payout on exit if set and balance allows
        _playerDidExit(playerAddress, gameID, zoneAlias);
    }

    function _removePlayer(
        address playerAddress,
        uint256 gameID,
        string memory zoneAlias
    ) internal {
        // TODO: remove from current location on game board
        _playerWillBeRemoved(playerAddress, gameID, zoneAlias);
        playerCount[gameID][zoneAlias] = playerCount[gameID][zoneAlias] > 0
            ? playerCount[gameID][zoneAlias] - 1
            : 0;
        _playerWasRemoved(playerAddress, gameID, zoneAlias);
    }

    // Override for custom game
    function _playerWillEnter(
        address playerAddress,
        uint256 gameID,
        string memory zoneAlias
    ) internal virtual {}

    function _playerDidEnter(
        address playerAddress,
        uint256 gameID,
        string memory zoneAlias
    ) internal virtual {}

    function _playerWillExit(
        address playerAddress,
        uint256 gameID,
        string memory zoneAlias
    ) internal virtual {}

    function _playerDidExit(
        address playerAddress,
        uint256 gameID,
        string memory zoneAlias
    ) internal virtual {}

    function _playersWillEnter(
        uint256 gameID,
        uint256 groupID,
        string memory zoneAlias
    ) internal virtual {
        // called when batch of players are being entered from lobby or previous zone
        // individual player entries are called from _playerDidEnter
    }

    function _allPlayersEntered(
        uint256 gameID,
        uint256 groupID,
        string memory zoneAlias
    ) internal virtual {
        // called after player group has all been entered
    }

    function _playerWillBeRemoved(
        address playerAddress,
        uint256 gameID,
        string memory zoneAlias
    ) internal virtual {}

    function _playerWasRemoved(
        address playerAddress,
        uint256 gameID,
        string memory zoneAlias
    ) internal virtual {}

    function _customAction(
        string[] memory stringParams,
        address[] memory addressParams,
        uint256[] memory uintParams
    ) internal virtual {
        // should definitiely do some checks when implementing this function
        // make sure the sender is correct and nothing malicious is going on
    }
}
