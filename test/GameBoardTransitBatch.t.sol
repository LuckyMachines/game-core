// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.34;

import "contracts/src/v0.0/GameBoard.sol";
import "contracts/src/v0.0/GameRegistry.sol";
import "contracts/src/v0.0/PlayerRegistry.sol";
import "contracts/src/v0.0/PlayZone.sol";
import "contracts/src/v0.0/Ruleset.sol";

contract BatchPlayerActor {
    function register(PlayerRegistry registry, uint256 gameID) external {
        registry.register(gameID);
    }
}

contract BatchControllerActor {
    function runBoardUpdate(GameBoard board) external {
        board.runUpdate();
    }

    function progressTransit(GameBoard board, uint256 transitID) external {
        board._progressTransit(transitID);
    }
}

contract BatchPlayZone is PlayZone {
    constructor(
        address rulesetAddress,
        address gameRegistryAddress,
        address adminAddress,
        address factoryAddress
    )
        PlayZone(
            rulesetAddress,
            gameRegistryAddress,
            adminAddress,
            factoryAddress
        )
    {}

    function queueTransit(
        GameBoard board,
        uint256 gameID,
        address[] memory playerAddresses,
        uint256[] memory pathIndices,
        uint256 transitID
    ) external {
        board.queueExitToPaths(gameID, playerAddresses, pathIndices, transitID);
    }

    function startTransitOnBoard(GameBoard board, uint256 transitID) external {
        board.startTransit(transitID);
    }
}

contract GameBoardTransitBatchTest {
    uint256 internal constant PLAYER_COUNT = 205;

    GameBoard internal gameBoard;
    GameRegistry internal gameRegistry;
    PlayerRegistry internal playerRegistry;
    Ruleset internal ruleset;
    BatchPlayZone internal zoneA;
    BatchPlayZone internal zoneB;
    BatchControllerActor internal controller;
    BatchPlayerActor[] internal players;
    uint256 internal gameID;

    function setUp() public {
        gameBoard = new GameBoard(address(this));
        gameRegistry = new GameRegistry(address(this));
        playerRegistry = new PlayerRegistry(address(gameBoard), address(this));
        ruleset = new Ruleset(address(this), address(0));

        zoneA = new BatchPlayZone(
            address(ruleset),
            address(gameRegistry),
            address(this),
            address(0)
        );
        zoneB = new BatchPlayZone(
            address(ruleset),
            address(gameRegistry),
            address(this),
            address(0)
        );
        controller = new BatchControllerActor();

        gameRegistry.addGameBoard(address(gameBoard));
        zoneA.addGameBoard(address(gameBoard));
        zoneB.addGameBoard(address(gameBoard));

        gameID = gameBoard.createGame(address(playerRegistry), address(gameRegistry));

        address[] memory zoneAddresses = new address[](2);
        zoneAddresses[0] = address(zoneA);
        zoneAddresses[1] = address(zoneB);
        string[] memory aliases = new string[](2);
        aliases[0] = "zone.a";
        aliases[1] = "zone.b";
        gameBoard.addZones(zoneAddresses, aliases, gameID);

        string[2][] memory connections = new string[2][](1);
        connections[0][0] = "zone.a";
        connections[0][1] = "zone.b";
        gameBoard.addZoneConnections(gameID, connections);
        gameBoard.addVerifiedController(address(controller));

        _registerPlayers();

        gameBoard.startGame(gameID);
        controller.runBoardUpdate(gameBoard);
        controller.runBoardUpdate(gameBoard);
    }

    function test_TransitProgressesInMultipleBatchesOverMaxBatchSize() public {
        uint256 transitID = 404;
        uint256 batchSize = gameBoard.MAX_BATCH_SIZE();
        require(PLAYER_COUNT > batchSize, "test requires players > batch size");

        address[] memory playerAddresses = new address[](PLAYER_COUNT);
        uint256[] memory pathIndices = new uint256[](PLAYER_COUNT);
        for (uint256 i = 0; i < PLAYER_COUNT; i++) {
            playerAddresses[i] = address(players[i]);
            pathIndices[i] = 0;
        }

        zoneA.queueTransit(gameBoard, gameID, playerAddresses, pathIndices, transitID);
        zoneA.startTransitOnBoard(gameBoard, transitID);

        controller.progressTransit(gameBoard, transitID);

        require(gameBoard.transitStarted(gameID, transitID), "transit should be started");
        require(!gameBoard.transitComplete(gameID, transitID), "transit should not be complete after first batch");
        require(
            gameBoard.transitProgress(gameID, transitID) == batchSize,
            "progress should equal first batch size"
        );
        require(
            gameBoard.transitSuccessfulMoves(gameID, transitID) == batchSize,
            "success count should equal first batch size"
        );
        require(gameBoard.transitFailedMoves(gameID, transitID) == 0, "unexpected failures in first batch");

        // Entry at boundary should be processed; next one should still be pending.
        (, , bool processedBoundary, bool successBoundary) =
            gameBoard.getTransitEntry(gameID, transitID, batchSize - 1);
        (, , bool processedNext, ) =
            gameBoard.getTransitEntry(gameID, transitID, batchSize);
        require(processedBoundary && successBoundary, "boundary entry should be processed");
        require(!processedNext, "first entry of second batch should still be pending");

        _assertPlayerZone(players[batchSize - 1], "zone.b");
        _assertPlayerZone(players[batchSize], "zone.a");

        controller.progressTransit(gameBoard, transitID);

        require(gameBoard.transitComplete(gameID, transitID), "transit should be complete");
        require(
            gameBoard.transitProgress(gameID, transitID) == PLAYER_COUNT,
            "final progress should equal player count"
        );
        require(
            gameBoard.transitSuccessfulMoves(gameID, transitID) == PLAYER_COUNT,
            "all moves should succeed"
        );
        require(gameBoard.transitFailedMoves(gameID, transitID) == 0, "unexpected failures");

        _assertPlayerZone(players[batchSize], "zone.b");
        _assertPlayerZone(players[PLAYER_COUNT - 1], "zone.b");
    }

    function _registerPlayers() internal {
        for (uint256 i = 0; i < PLAYER_COUNT; i++) {
            BatchPlayerActor actor = new BatchPlayerActor();
            players.push(actor);
            actor.register(playerRegistry, gameID);
        }
    }

    function _assertPlayerZone(BatchPlayerActor player, string memory expected) internal view {
        uint256 playerID = playerRegistry.playerID(gameID, address(player));
        string memory current = gameBoard.currentPlayZone(gameID, playerID);
        require(
            keccak256(bytes(current)) == keccak256(bytes(expected)),
            "unexpected player zone"
        );
    }
}
