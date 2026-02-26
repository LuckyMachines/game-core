// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.34;

import "contracts/src/v0.0/GameBoard.sol";
import "contracts/src/v0.0/GameRegistry.sol";
import "contracts/src/v0.0/PlayerRegistry.sol";
import "contracts/src/v0.0/PlayZone.sol";
import "contracts/src/v0.0/Ruleset.sol";

contract TransitPlayerActor {
    function register(PlayerRegistry registry, uint256 gameID) external {
        registry.register(gameID);
    }
}

contract TransitControllerActor {
    function runBoardUpdate(GameBoard board) external {
        board.runUpdate();
    }

    function progressTransit(GameBoard board, uint256 transitID) external {
        board._progressTransit(transitID);
    }
}

contract TransitPlayZone is PlayZone {
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

contract GameBoardTransitTest {
    GameBoard internal gameBoard;
    GameRegistry internal gameRegistry;
    PlayerRegistry internal playerRegistry;
    Ruleset internal ruleset;
    TransitPlayZone internal zoneA;
    TransitPlayZone internal zoneB;
    TransitControllerActor internal controller;
    TransitPlayerActor internal player1;
    TransitPlayerActor internal player2;
    uint256 internal gameID;

    function setUp() public {
        gameBoard = new GameBoard(address(this));
        gameRegistry = new GameRegistry(address(this));
        playerRegistry = new PlayerRegistry(address(gameBoard), address(this));
        ruleset = new Ruleset(address(this), address(0));

        zoneA = new TransitPlayZone(
            address(ruleset),
            address(gameRegistry),
            address(this),
            address(0)
        );
        zoneB = new TransitPlayZone(
            address(ruleset),
            address(gameRegistry),
            address(this),
            address(0)
        );

        controller = new TransitControllerActor();
        player1 = new TransitPlayerActor();
        player2 = new TransitPlayerActor();

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

        player1.register(playerRegistry, gameID);
        player2.register(playerRegistry, gameID);

        gameBoard.startGame(gameID);
        controller.runBoardUpdate(gameBoard);
        controller.runBoardUpdate(gameBoard);

        _assertEqString(
            gameBoard.currentPlayZone(
                gameID,
                playerRegistry.playerID(gameID, address(player1))
            ),
            "zone.a"
        );
        _assertEqString(
            gameBoard.currentPlayZone(
                gameID,
                playerRegistry.playerID(gameID, address(player2))
            ),
            "zone.a"
        );
    }

    function test_TransitQueueStartAndProgressAllPlayers() public {
        uint256 transitID = 101;
        address[] memory players = _playerAddresses();
        uint256[] memory paths = _zeroPaths(players.length);

        zoneA.queueTransit(gameBoard, gameID, players, paths, transitID);
        zoneA.startTransitOnBoard(gameBoard, transitID);
        controller.progressTransit(gameBoard, transitID);

        require(gameBoard.transitStarted(gameID, transitID), "transit not started");
        require(gameBoard.transitComplete(gameID, transitID), "transit not complete");
        require(gameBoard.transitProgress(gameID, transitID) == 2, "wrong progress");
        require(gameBoard.transitSuccessfulMoves(gameID, transitID) == 2, "wrong success count");
        require(gameBoard.transitFailedMoves(gameID, transitID) == 0, "wrong fail count");

        (address p0, uint256 path0, bool processed0, bool success0) =
            gameBoard.getTransitEntry(gameID, transitID, 0);
        (address p1, uint256 path1, bool processed1, bool success1) =
            gameBoard.getTransitEntry(gameID, transitID, 1);

        require(p0 == address(player1), "unexpected player0");
        require(path0 == 0, "unexpected path0");
        require(processed0 && success0, "entry0 should be successful");
        require(p1 == address(player2), "unexpected player1");
        require(path1 == 0, "unexpected path1");
        require(processed1 && success1, "entry1 should be successful");

        _assertEqString(
            gameBoard.currentPlayZone(
                gameID,
                playerRegistry.playerID(gameID, address(player1))
            ),
            "zone.b"
        );
        _assertEqString(
            gameBoard.currentPlayZone(
                gameID,
                playerRegistry.playerID(gameID, address(player2))
            ),
            "zone.b"
        );
    }

    function test_TransitContinuesWhenOneMoveFails() public {
        bool[] memory ruleFlags = new bool[](5);
        ruleFlags[0] = true; // enforce maxCapacity
        ruleset.createRuleset(ruleFlags);

        uint256[] memory ruleValues = new uint256[](5);
        ruleValues[0] = 1; // maxCapacity = 1
        ruleset.setAllRules(ruleValues, 1);
        zoneB.setRules(1, gameID, "zone.b");

        uint256 transitID = 202;
        address[] memory players = _playerAddresses();
        uint256[] memory paths = _zeroPaths(players.length);

        zoneA.queueTransit(gameBoard, gameID, players, paths, transitID);
        zoneA.startTransitOnBoard(gameBoard, transitID);
        controller.progressTransit(gameBoard, transitID);

        require(gameBoard.transitComplete(gameID, transitID), "transit should complete");
        require(gameBoard.transitSuccessfulMoves(gameID, transitID) == 1, "expected one success");
        require(gameBoard.transitFailedMoves(gameID, transitID) == 1, "expected one failure");

        (, , bool processed0, bool success0) =
            gameBoard.getTransitEntry(gameID, transitID, 0);
        (, , bool processed1, bool success1) =
            gameBoard.getTransitEntry(gameID, transitID, 1);
        require(processed0 && processed1, "both entries must be processed");
        require(success0 != success1, "one success and one failure expected");

        _assertEqString(
            gameBoard.currentPlayZone(
                gameID,
                playerRegistry.playerID(gameID, address(player1))
            ),
            "zone.b"
        );
        _assertEqString(
            gameBoard.currentPlayZone(
                gameID,
                playerRegistry.playerID(gameID, address(player2))
            ),
            "zone.a"
        );
    }

    function test_TransitGuardsForStartAndProgress() public {
        // Start without queue should revert.
        (bool startOk, ) = address(zoneA).call(
            abi.encodeWithSelector(
                TransitPlayZone.startTransitOnBoard.selector,
                gameBoard,
                999
            )
        );
        require(!startOk, "start should fail without queued transit");

        uint256 transitID = 303;
        address[] memory players = _playerAddresses();
        uint256[] memory paths = _zeroPaths(players.length);
        zoneA.queueTransit(gameBoard, gameID, players, paths, transitID);

        // Progress before start should revert.
        (bool progressOk, ) = address(controller).call(
            abi.encodeWithSelector(
                TransitControllerActor.progressTransit.selector,
                gameBoard,
                transitID
            )
        );
        require(!progressOk, "progress should fail before start");
    }

    function _playerAddresses() internal view returns (address[] memory players) {
        players = new address[](2);
        players[0] = address(player1);
        players[1] = address(player2);
    }

    function _zeroPaths(uint256 count) internal pure returns (uint256[] memory paths) {
        paths = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            paths[i] = 0;
        }
    }

    function _assertEqString(string memory a, string memory b) internal pure {
        require(
            keccak256(bytes(a)) == keccak256(bytes(b)),
            "string mismatch"
        );
    }
}
