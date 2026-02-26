// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.34;

import "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";
import "./PlayerRegistry.sol";
import "./GameRegistry.sol";
import "./PlayZone.sol";

contract GameBoard is AccessControlEnumerable {
    bytes32 public constant VERIFIED_CONTROLLER_ROLE =
        keccak256("VERIFIED_CONTROLLER_ROLE");
    bytes32 public constant GAME_MASTER_ROLE = keccak256("GAME_MASTER_ROLE");
    bytes32 public constant FACTORY_ROLE = keccak256("FACTORY_ROLE");
    bytes32 public constant PLAY_ZONE_ROLE = keccak256("PLAY_ZONE_ROLE");
    PlayerRegistry internal PLAYER_REGISTRY;

    uint256 public constant MAX_BATCH_SIZE = 200;

    uint256[] internal _gamesNeedUpdates;

    // Mappings from GameID
    mapping(uint256 => uint256) public gameState; // 0 = start, 1=continue initializing, 2=initialized
    mapping(uint256 => uint256) public lastEntryPlayerID;
    // Play zones + connections
    // playZones[gameID] = array of play zone addresses
    // TODO:
    // make sure these aliases work instead of addresses
    mapping(uint256 => string[]) public playZones;
    mapping(uint256 => string) public initialPlayZone;
    mapping(uint256 => mapping(string => address)) public zoneAlias; // returns address of zone alias
    // playZoneInputs[gameID][zone alias] = array of inputs for given zone
    mapping(uint256 => mapping(string => string[])) public playZoneInputs;
    // playZoneOutputs[gameID][zone alias] = array of outputs for given zone
    mapping(uint256 => mapping(string => string[])) public playZoneOutputs;

    // Player Registry
    // playerRegistry[gameID] = player registry ID for game
    mapping(uint256 => uint256) public playerRegistry;

    // Player positions
    // currentPlayZone[gameID][playerID] = alias of zone (playZones[gameID]) player is in
    mapping(uint256 => mapping(uint256 => string)) public currentPlayZone;
    mapping(uint256 => uint256[]) public entryQueue; //overflow if playzone 0 cannot be entered

    struct TransitAction {
        address playerAddress;
        uint256 pathIndex;
        bool processed;
        bool success;
    }

    // Transit state
    mapping(uint256 => uint256) public transitGameID; // transitID -> gameID
    mapping(uint256 => mapping(uint256 => TransitAction[])) private transitQueue;
    mapping(uint256 => mapping(uint256 => bool)) public transitStarted;
    mapping(uint256 => mapping(uint256 => bool)) public transitComplete;
    mapping(uint256 => mapping(uint256 => uint256)) public transitProgress;
    mapping(uint256 => mapping(uint256 => uint256)) public transitSuccessfulMoves;
    mapping(uint256 => mapping(uint256 => uint256)) public transitFailedMoves;

    event TransitQueued(
        uint256 indexed gameID,
        uint256 indexed transitID,
        uint256 queuedCount
    );
    event TransitStarted(
        uint256 indexed gameID,
        uint256 indexed transitID,
        uint256 totalQueued
    );
    event TransitStepProcessed(
        uint256 indexed gameID,
        uint256 indexed transitID,
        uint256 index,
        address playerAddress,
        bool success
    );
    event TransitCompleted(
        uint256 indexed gameID,
        uint256 indexed transitID,
        uint256 successfulMoves,
        uint256 failedMoves
    );

    modifier onlyFactoryGM() {
        require(
            hasRole(FACTORY_ROLE, _msgSender()) ||
                hasRole(GAME_MASTER_ROLE, _msgSender()),
            "Game Master or Factory role required"
        );
        _;
    }

    constructor(address adminAddress) {
        // Admin set as game master
        // Can revoke role if desired
        _grantRole(DEFAULT_ADMIN_ROLE, adminAddress);
        _grantRole(GAME_MASTER_ROLE, adminAddress);
    }

    function prAddress() public view returns (address) {
        return address(PLAYER_REGISTRY);
    }

    function createGame(
        address _playerRegistry,
        address _gameRegistry,
        address[] memory playZoneAddresses,
        string[] memory zoneAliases
    ) public onlyFactoryGM returns (uint256 gameID) {
        require(
            playZoneAddresses.length == zoneAliases.length,
            "addresses & aliases different lengths"
        );
        // first play zone is default / entry point
        if (playZoneAddresses.length > 0) {
            _addZones(playZoneAddresses, zoneAliases, gameID);
        }
        PLAYER_REGISTRY = PlayerRegistry(_playerRegistry);
        gameID = GameRegistry(_gameRegistry).registerGame();
    }

    function createGame(address _playerRegistry, address _gameRegistry)
        public
        onlyFactoryGM
        returns (uint256 gameID)
    {
        PLAYER_REGISTRY = PlayerRegistry(_playerRegistry);
        gameID = GameRegistry(_gameRegistry).registerGame();
    }

    function addFactory(address factoryAddress)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _grantRole(FACTORY_ROLE, factoryAddress);
    }

    function isFactory(address factoryAddress)
        public
        view
        returns (bool factoryIsAuthorized)
    {
        factoryIsAuthorized = hasRole(FACTORY_ROLE, factoryAddress);
    }

    // adds zones to be used in game, only add 1 per address, use aliases for zone variations
    function addZones(
        address[] memory playZoneAddresses,
        string[] memory zoneAliases,
        uint256 gameID
    ) public onlyRole(GAME_MASTER_ROLE) {
        require(
            playZoneAddresses.length == zoneAliases.length,
            "addresses & aliases different lengths"
        );
        _addZones(playZoneAddresses, zoneAliases, gameID);
    }

    function _addZones(
        address[] memory playZoneAddresses,
        string[] memory zoneAliases,
        uint256 gameID
    ) internal {
        for (uint256 i = 0; i < playZoneAddresses.length; i++) {
            playZones[gameID].push(zoneAliases[i]);
            zoneAlias[gameID][zoneAliases[i]] = playZoneAddresses[i];
            if (!hasRole(PLAY_ZONE_ROLE, playZoneAddresses[i])) {
                _grantRole(PLAY_ZONE_ROLE, playZoneAddresses[i]);
            }
        }
    }

    function addKeeper(address keeperAddress)
        public
        onlyRole(GAME_MASTER_ROLE)
    {
        _grantRole(VERIFIED_CONTROLLER_ROLE, keeperAddress);
    }

    function addVerifiedController(address vcAddress)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        grantRole(VERIFIED_CONTROLLER_ROLE, vcAddress);
    }

    function setInitialPlayZone(string memory initialZone, uint256 gameID)
        public
        onlyRole(VERIFIED_CONTROLLER_ROLE)
    {
        require(
            gameState[gameID] == 0,
            "can't set initial zone, game already started"
        );
        initialPlayZone[gameID] = initialZone;
    }

    function startGame(uint256 gameID) public onlyRole(GAME_MASTER_ROLE) {
        // lock registration
        //_startGameInit(gameID);
        // set needs loop
        _gamesNeedUpdates.push(gameID);
    }

    function setPlayerInactive(uint256 _playerID, uint256 gameID)
        public
        onlyRole(VERIFIED_CONTROLLER_ROLE)
    {
        PLAYER_REGISTRY.setPlayerInactive(_playerID, gameID);
    }

    function setPlayerActive(uint256 _playerID, uint256 gameID)
        public
        onlyRole(VERIFIED_CONTROLLER_ROLE)
    {
        PLAYER_REGISTRY.setPlayerActive(_playerID, gameID);
    }

    function needsUpdate() public view returns (bool doesNeedUpdate) {
        doesNeedUpdate = false;
        for (uint256 i = 0; i < _gamesNeedUpdates.length; i++) {
            if (_gamesNeedUpdates[i] != 0) {
                doesNeedUpdate = true;
                break;
            }
        }
    }

    function runUpdate() public onlyRole(VERIFIED_CONTROLLER_ROLE) {
        uint256 gameToUpdate;
        uint256 gameIndex;
        for (uint256 i = 0; i < _gamesNeedUpdates.length; i++) {
            if (_gamesNeedUpdates[i] != 0) {
                gameToUpdate = _gamesNeedUpdates[i];
                gameIndex = i;
                break;
            }
        }
        // get state of game
        if (gameState[gameToUpdate] == 0) {
            _startGameInit(gameToUpdate);
        } else if (gameState[gameToUpdate] == 1) {
            _continueGameInit(gameToUpdate);
        }
        // state might be updated now
        if (gameState[gameToUpdate] > 1) {
            _gamesNeedUpdates[gameIndex] = 0;
        }
        // otherwise everything is set and should be okay...
        // TODO:
        // check transit groups once those are enabled
    }

    function cleanQueue() public {
        // remove 0s from queue
    }

    // game state // 0 start game, 1 continue init, 2 initialized
    function _startGameInit(uint256 gameID) internal {
        PLAYER_REGISTRY.lockRegistration(gameID);
        gameState[gameID] = 1;
    }

    function _continueGameInit(uint256 gameID) internal {
        string memory za = bytes(initialPlayZone[gameID]).length != 0
            ? initialPlayZone[gameID]
            : playZones[gameID][0];
        address zoneAddress = zoneAlias[gameID][za];
        PlayZone pz = PlayZone(zoneAddress);

        for (
            uint256 i = 0;
            i < PLAYER_REGISTRY.totalRegistrations(gameID);
            i++
        ) {
            uint256 playerID = i + 1;
            address playerAddress = PLAYER_REGISTRY.playerAddress(
                gameID,
                playerID
            );
            if (pz.playerCanEnter(playerAddress, gameID, za)) {
                pz.enterPlayer(playerAddress, gameID, za);
            } else {
                entryQueue[gameID].push(playerID);
            }
        }

        gameState[gameID] = 2;
    }

    function getOverflowQueue(uint256 gameID)
        public
        view
        virtual
        returns (uint256[] memory)
    {
        return entryQueue[gameID];
    }

    function getPlayZones(uint256 gameID)
        public
        view
        virtual
        returns (string[] memory)
    {
        return playZones[gameID];
    }

    function getInputs(uint256 gameID, string memory _zoneAlias)
        public
        view
        virtual
        returns (string[] memory zoneInputs)
    {
        zoneInputs = playZoneInputs[gameID][_zoneAlias];
    }

    function getOutputs(uint256 gameID, string memory _zoneAlias)
        public
        view
        virtual
        returns (string[] memory zoneOutputs)
    {
        zoneOutputs = playZoneOutputs[gameID][_zoneAlias];
    }

    function addZoneConnections(uint256 gameID, string[2][] memory connections)
        public
        onlyRole(GAME_MASTER_ROLE)
    {
        // connections = [from zone alias, to zone alias]
        require(
            connectionZonesValid(gameID, connections),
            "not all zone indeces valid"
        );
        for (uint256 i = 0; i < connections.length; i++) {
            playZoneOutputs[gameID][connections[i][0]].push(connections[i][1]);
            playZoneInputs[gameID][connections[i][1]].push(connections[i][0]);
        }
    }

    function removeZoneConnections(
        uint256 gameID,
        string[] memory inputAliases,
        uint256[] memory inputs,
        string[] memory outputAliases,
        uint256[] memory outputs
    ) public onlyRole(GAME_MASTER_ROLE) {
        /* This is done differently from adding zones and can break connections

        Use with caution!

        inputs = [zone index, input index]
        outputs = [zone index, output index]
        */
        require(
            inputs.length == outputs.length,
            "inputs / outputs length mismatch"
        );
        require(
            connectionInputsValid(gameID, inputAliases, inputs),
            "inputs invalid"
        );
        require(
            connectionOutputsValid(gameID, outputAliases, outputs),
            "outputs invalid"
        );
        for (uint256 i = 0; i < inputs.length; i++) {
            //TODO:
            // remove input from zone inputs[i][0] at index inputs[i][1]
            // remove output from zone outputs[i][0] at index outputs[i][1]
        }
    }

    function exitToPath(
        uint256 gameID,
        address playerAddress,
        uint256 pathIndex
    ) external virtual returns (bool exitSuccess) {
        exitSuccess = _exitToPath(gameID, playerAddress, pathIndex);
    }

    function _exitToPath(
        uint256 gameID,
        address playerAddress,
        uint256 pathIndex
    ) internal returns (bool exitSuccess) {
        uint256 playerID = PLAYER_REGISTRY.playerID(gameID, playerAddress);
        string memory originZoneAlias = currentPlayZone[gameID][playerID];
        string[] memory outputs = getOutputs(gameID, originZoneAlias);
        uint256 availablePaths = outputs.length;
        require(availablePaths > 0, "No exit paths available");

        exitSuccess = false;

        PlayZone originPlayZone = PlayZone(zoneAlias[gameID][originZoneAlias]);

        uint256 path = pathIndex >= availablePaths ? 0 : pathIndex;
        string memory destinationZoneAlias = outputs[path];
        PlayZone destinationPlayZone = PlayZone(
            zoneAlias[gameID][destinationZoneAlias]
        );

        if (
            originPlayZone.playerCanExit(
                playerAddress,
                gameID,
                originZoneAlias
            ) &&
            destinationPlayZone.playerCanEnter(
                playerAddress,
                gameID,
                destinationZoneAlias
            )
        ) {
            originPlayZone.exitPlayer(playerAddress, gameID, originZoneAlias);
            destinationPlayZone.enterPlayer(
                playerAddress,
                gameID,
                destinationZoneAlias
            );
            currentPlayZone[gameID][playerID] = destinationZoneAlias;
            exitSuccess = true;
        }
    }

    function playerEnteredZone(
        uint256 gameID,
        address playerAddress,
        string memory _zoneAlias
    ) external onlyRole(PLAY_ZONE_ROLE) {
        uint256 playerID = PLAYER_REGISTRY.playerID(gameID, playerAddress);
        currentPlayZone[gameID][playerID] = _zoneAlias;
    }

    function queueExitToPaths(
        uint256 gameID,
        address[] memory playerAddresses,
        uint256[] memory pathIndices,
        uint256 transitID
    ) public onlyRole(PLAY_ZONE_ROLE) {
        require(
            playerAddresses.length == pathIndices.length,
            "players/paths length mismatch"
        );
        require(playerAddresses.length > 0, "empty transit batch");

        uint256 trackedGameID = transitGameID[transitID];
        if (trackedGameID == 0) {
            transitGameID[transitID] = gameID;
        } else {
            require(trackedGameID == gameID, "transitID belongs to another game");
        }
        require(!transitStarted[gameID][transitID], "transit already started");

        for (uint256 i = 0; i < playerAddresses.length; i++) {
            transitQueue[gameID][transitID].push(
                TransitAction({
                    playerAddress: playerAddresses[i],
                    pathIndex: pathIndices[i],
                    processed: false,
                    success: false
                })
            );
        }

        emit TransitQueued(gameID, transitID, transitQueue[gameID][transitID].length);
    }

    function startTransit(uint256 transitID) public onlyRole(PLAY_ZONE_ROLE) {
        uint256 gameID = transitGameID[transitID];
        require(gameID != 0, "unknown transitID");
        require(!transitStarted[gameID][transitID], "transit already started");
        require(
            transitQueue[gameID][transitID].length > 0,
            "transit queue empty"
        );

        transitStarted[gameID][transitID] = true;
        emit TransitStarted(
            gameID,
            transitID,
            transitQueue[gameID][transitID].length
        );
    }

    function _progressTransit(uint256 transitID)
        public
        onlyRole(VERIFIED_CONTROLLER_ROLE)
    {
        uint256 gameID = transitGameID[transitID];
        require(gameID != 0, "unknown transitID");
        require(transitStarted[gameID][transitID], "transit not started");
        require(!transitComplete[gameID][transitID], "transit complete");

        _progressTransitBatch(gameID, transitID, MAX_BATCH_SIZE);
    }

    function _progressTransitBatch(
        uint256 gameID,
        uint256 transitID,
        uint256 batchSize
    ) internal {
        TransitAction[] storage actions = transitQueue[gameID][transitID];
        uint256 cursor = transitProgress[gameID][transitID];
        require(cursor < actions.length, "no transit actions pending");

        uint256 end = cursor + batchSize;
        if (end > actions.length) {
            end = actions.length;
        }

        for (uint256 i = cursor; i < end; i++) {
            TransitAction storage action = actions[i];
            (bool callOk, bytes memory callData) = address(this).call(
                abi.encodeWithSelector(
                    this.exitToPath.selector,
                    gameID,
                    action.playerAddress,
                    action.pathIndex
                )
            );
            bool moved = callOk &&
                callData.length >= 32 &&
                abi.decode(callData, (bool));
            action.processed = true;
            action.success = moved;
            if (moved) {
                transitSuccessfulMoves[gameID][transitID]++;
            } else {
                transitFailedMoves[gameID][transitID]++;
            }
            emit TransitStepProcessed(
                gameID,
                transitID,
                i,
                action.playerAddress,
                moved
            );
        }

        transitProgress[gameID][transitID] = end;

        if (end == actions.length) {
            transitComplete[gameID][transitID] = true;
            emit TransitCompleted(
                gameID,
                transitID,
                transitSuccessfulMoves[gameID][transitID],
                transitFailedMoves[gameID][transitID]
            );
        }
    }

    function getTransitLength(uint256 gameID, uint256 transitID)
        public
        view
        returns (uint256)
    {
        return transitQueue[gameID][transitID].length;
    }

    function getTransitEntry(
        uint256 gameID,
        uint256 transitID,
        uint256 index
    )
        public
        view
        returns (
            address playerAddress,
            uint256 pathIndex,
            bool processed,
            bool success
        )
    {
        TransitAction storage action = transitQueue[gameID][transitID][index];
        return (
            action.playerAddress,
            action.pathIndex,
            action.processed,
            action.success
        );
    }

    function connectionZonesValid(
        uint256 gameID,
        string[2][] memory connections
    ) internal view returns (bool isValid) {
        // checks that all aliases passed exist
        for (uint256 i = 0; i < connections.length; i++) {
            isValid = true;
            if (
                zoneAlias[gameID][connections[i][0]] == address(0) ||
                zoneAlias[gameID][connections[i][1]] == address(0)
            ) {
                isValid = false;
                break;
            }
        }
    }

    function connectionInputsValid(
        uint256 gameID,
        string[] memory aliases,
        uint256[] memory inputs
    ) internal view returns (bool isValid) {
        // checks that inputs exist
        // inputs = [zone alias, input index]

        isValid = true;
        for (uint256 i = 0; i < inputs.length; i++) {
            if (
                //playZoneInputs[gameID][zone alias] = array of input aliases for given zone
                playZoneInputs[gameID][aliases[i]].length >= inputs[i] + 1
            ) {
                isValid = false;
                break;
            }
        }
    }

    function connectionOutputsValid(
        uint256 gameID,
        string[] memory aliases,
        uint256[] memory outputs
    ) internal view returns (bool isValid) {
        // outputs = [zone alias, output index]
        isValid = true;
        for (uint256 i = 0; i < outputs.length; i++) {
            if (playZoneOutputs[gameID][aliases[i]].length >= outputs[i] + 1) {
                isValid = false;
                break;
            }
        }
    }
}
