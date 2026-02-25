// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title PlundrixGame
 * @notice A single-zone heist game where 2-4 rival operatives compete to crack a vault with 5 locks.
 *         Each round, players choose PICK, SEARCH, or SABOTAGE. First to crack all 5 locks wins.
 *         Self-contained contract -- no autoloop, no VRF, no off-chain keeper needed.
 */
contract PlundrixGame is AccessControlEnumerable {
    using Counters for Counters.Counter;

    // --- Roles ---
    bytes32 public constant GAME_MASTER_ROLE = keccak256("GAME_MASTER_ROLE");

    // --- Constants ---
    uint256 public constant TOTAL_LOCKS = 5;
    uint256 public constant MAX_TOOLS = 5;
    uint256 public constant MAX_GAME_PLAYERS = 4;
    uint256 public constant MIN_GAME_PLAYERS = 2;
    uint256 public constant ROUND_TIMEOUT = 5 minutes;

    // --- Enums ---
    enum Action {
        NONE,
        PICK,
        SEARCH,
        SABOTAGE
    }

    enum GameState {
        OPEN,
        ACTIVE,
        COMPLETE
    }

    // --- Structs ---
    struct PlayerState {
        address addr;
        uint256 locksCracked;
        uint256 tools;
        bool stunned;
        bool registered;
    }

    struct PendingAction {
        Action action;
        address sabotageTarget;
        bool submitted;
    }

    struct GameInfo {
        GameState state;
        uint256 currentRound;
        uint256 playerCount;
        uint256 roundStartTime;
        address winner;
    }

    // --- Storage ---
    Counters.Counter private _gameIdCounter;

    mapping(uint256 => GameInfo) private _games;
    mapping(uint256 => mapping(uint256 => PlayerState)) private _players;
    mapping(uint256 => mapping(address => uint256)) private _playerIndex;
    mapping(uint256 => mapping(address => PendingAction)) private _pendingActions;

    // --- Events ---
    event GameCreated(
        uint256 indexed gameID,
        address creator,
        uint256 timeStamp
    );
    event PlayerJoined(
        uint256 indexed gameID,
        address player,
        uint256 playerIndex,
        uint256 timeStamp
    );
    event GameStarted(uint256 indexed gameID, uint256 timeStamp);
    event ActionSubmitted(
        uint256 indexed gameID,
        address player,
        uint256 round,
        uint256 timeStamp
    );
    event RoundResolved(
        uint256 indexed gameID,
        uint256 round,
        uint256 timeStamp
    );
    event LockCracked(
        uint256 indexed gameID,
        address player,
        uint256 totalCracked,
        uint256 timeStamp
    );
    event ToolFound(
        uint256 indexed gameID,
        address player,
        uint256 totalTools,
        uint256 timeStamp
    );
    event PlayerSabotaged(
        uint256 indexed gameID,
        address attacker,
        address victim,
        uint256 timeStamp
    );
    event PlayerStunned(
        uint256 indexed gameID,
        address player,
        uint256 timeStamp
    );
    event GameWon(
        uint256 indexed gameID,
        address winner,
        uint256 rounds,
        uint256 timeStamp
    );

    // --- Constructor ---

    constructor(address adminAddress) {
        _setupRole(DEFAULT_ADMIN_ROLE, adminAddress);
        _setupRole(GAME_MASTER_ROLE, adminAddress);
    }

    // --- Game Lifecycle ---

    /**
     * @notice Create a new game. Anyone can create a game.
     * @return gameID The ID of the newly created game.
     */
    function createGame() external returns (uint256 gameID) {
        _gameIdCounter.increment();
        gameID = _gameIdCounter.current();

        _games[gameID].state = GameState.OPEN;

        emit GameCreated(gameID, msg.sender, block.timestamp);
    }

    /**
     * @notice Register the caller as a player in an open game.
     * @param gameID The game to join.
     */
    function registerPlayer(uint256 gameID) external {
        GameInfo storage game = _games[gameID];
        require(game.state == GameState.OPEN, "Game not open for registration");
        require(game.playerCount < MAX_GAME_PLAYERS, "Game is full");
        require(_playerIndex[gameID][msg.sender] == 0, "Already registered");

        game.playerCount++;
        uint256 idx = game.playerCount;
        _playerIndex[gameID][msg.sender] = idx;
        _players[gameID][idx] = PlayerState({
            addr: msg.sender,
            locksCracked: 0,
            tools: 0,
            stunned: false,
            registered: true
        });

        emit PlayerJoined(gameID, msg.sender, idx, block.timestamp);
    }

    /**
     * @notice Start a game. Requires GAME_MASTER_ROLE and at least MIN_GAME_PLAYERS registered.
     * @param gameID The game to start.
     */
    function startGame(uint256 gameID) external onlyRole(GAME_MASTER_ROLE) {
        GameInfo storage game = _games[gameID];
        require(game.state == GameState.OPEN, "Game not open");
        require(
            game.playerCount >= MIN_GAME_PLAYERS,
            "Not enough players"
        );

        game.state = GameState.ACTIVE;
        game.currentRound = 1;
        game.roundStartTime = block.timestamp;

        emit GameStarted(gameID, block.timestamp);
    }

    // --- Player Actions ---

    /**
     * @notice Submit an action for the current round.
     * @param gameID The game ID.
     * @param action The action to perform (PICK, SEARCH, or SABOTAGE).
     * @param sabotageTarget The target player address (only used for SABOTAGE, ignored otherwise).
     */
    function submitAction(
        uint256 gameID,
        Action action,
        address sabotageTarget
    ) external {
        GameInfo storage game = _games[gameID];
        require(game.state == GameState.ACTIVE, "Game not active");

        uint256 playerIdx = _playerIndex[gameID][msg.sender];
        require(playerIdx > 0, "Not a registered player");
        require(
            !_pendingActions[gameID][msg.sender].submitted,
            "Action already submitted"
        );
        require(
            action == Action.PICK ||
                action == Action.SEARCH ||
                action == Action.SABOTAGE,
            "Invalid action"
        );

        if (action == Action.SABOTAGE) {
            require(
                sabotageTarget != msg.sender,
                "Cannot sabotage yourself"
            );
            require(
                _playerIndex[gameID][sabotageTarget] > 0,
                "Target not in game"
            );
        }

        _pendingActions[gameID][msg.sender] = PendingAction({
            action: action,
            sabotageTarget: sabotageTarget,
            submitted: true
        });

        emit ActionSubmitted(
            gameID,
            msg.sender,
            game.currentRound,
            block.timestamp
        );
    }

    // --- Round Resolution ---

    /**
     * @notice Resolve the current round. Can be called by anyone once all actions are in or timeout is reached.
     * @param gameID The game to resolve.
     */
    function resolveRound(uint256 gameID) external {
        GameInfo storage game = _games[gameID];
        require(game.state == GameState.ACTIVE, "Game not active");
        require(
            allActionsSubmitted(gameID) ||
                block.timestamp >= game.roundStartTime + ROUND_TIMEOUT,
            "Not all actions submitted and timeout not reached"
        );

        uint256 round = game.currentRound;

        // Phase 1: Resolve PICK and SEARCH (affected by current stun state)
        for (uint256 i = 1; i <= game.playerCount; i++) {
            PlayerState storage player = _players[gameID][i];
            PendingAction storage pending = _pendingActions[gameID][
                player.addr
            ];

            if (!pending.submitted) {
                continue;
            }

            uint256 rand = _pseudoRandom(gameID, round, i);

            if (pending.action == Action.PICK) {
                _resolvePick(gameID, player, rand);
            } else if (pending.action == Action.SEARCH) {
                _resolveSearch(gameID, player, rand);
            }
        }

        // Phase 2: Clear existing stuns (stun lasts exactly one round)
        for (uint256 i = 1; i <= game.playerCount; i++) {
            _players[gameID][i].stunned = false;
        }

        // Phase 3: Process SABOTAGE (applies new stuns for next round)
        for (uint256 i = 1; i <= game.playerCount; i++) {
            PlayerState storage player = _players[gameID][i];
            PendingAction storage pending = _pendingActions[gameID][
                player.addr
            ];

            if (pending.submitted && pending.action == Action.SABOTAGE) {
                _resolveSabotage(gameID, player, pending.sabotageTarget);
            }
        }

        // Phase 4: Clear all pending actions
        for (uint256 i = 1; i <= game.playerCount; i++) {
            delete _pendingActions[gameID][_players[gameID][i].addr];
        }

        emit RoundResolved(gameID, round, block.timestamp);

        // Check for winner
        for (uint256 i = 1; i <= game.playerCount; i++) {
            if (_players[gameID][i].locksCracked >= TOTAL_LOCKS) {
                game.state = GameState.COMPLETE;
                game.winner = _players[gameID][i].addr;
                emit GameWon(
                    gameID,
                    game.winner,
                    round,
                    block.timestamp
                );
                return;
            }
        }

        // Advance to next round
        game.currentRound++;
        game.roundStartTime = block.timestamp;
    }

    // --- Internal Resolution ---

    function _resolvePick(
        uint256 gameID,
        PlayerState storage player,
        uint256 rand
    ) internal {
        // Stunned players auto-fail picks
        if (player.stunned) {
            return;
        }

        // Base 40% + 15% per tool, capped at 95%
        uint256 chance = 40 + (player.tools * 15);
        if (chance > 95) {
            chance = 95;
        }

        if (rand < chance) {
            player.locksCracked++;
            emit LockCracked(
                gameID,
                player.addr,
                player.locksCracked,
                block.timestamp
            );
        }
    }

    function _resolveSearch(
        uint256 gameID,
        PlayerState storage player,
        uint256 rand
    ) internal {
        // 60% success, 30% if stunned
        uint256 chance = player.stunned ? 30 : 60;

        if (rand < chance && player.tools < MAX_TOOLS) {
            player.tools++;
            emit ToolFound(
                gameID,
                player.addr,
                player.tools,
                block.timestamp
            );
        }
    }

    function _resolveSabotage(
        uint256 gameID,
        PlayerState storage attacker,
        address targetAddr
    ) internal {
        uint256 targetIdx = _playerIndex[gameID][targetAddr];
        PlayerState storage target = _players[gameID][targetIdx];

        // Stun the target for next round
        target.stunned = true;
        emit PlayerSabotaged(
            gameID,
            attacker.addr,
            targetAddr,
            block.timestamp
        );
        emit PlayerStunned(gameID, targetAddr, block.timestamp);

        // Steal a tool if target has any
        if (target.tools > 0 && attacker.tools < MAX_TOOLS) {
            target.tools--;
            attacker.tools++;
        }
    }

    function _pseudoRandom(
        uint256 gameID,
        uint256 round,
        uint256 seed
    ) internal view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        blockhash(block.number - 1),
                        gameID,
                        round,
                        block.timestamp,
                        seed
                    )
                )
            ) % 100;
    }

    // --- View Functions ---

    /**
     * @notice Get the full state of a player in a game.
     * @param gameID The game ID.
     * @param playerAddr The player's address.
     */
    function getPlayerState(
        uint256 gameID,
        address playerAddr
    )
        external
        view
        returns (
            uint256 locksCracked,
            uint256 tools,
            bool stunned,
            bool registered,
            bool actionSubmitted
        )
    {
        uint256 idx = _playerIndex[gameID][playerAddr];
        if (idx == 0) {
            return (0, 0, false, false, false);
        }
        PlayerState storage player = _players[gameID][idx];
        return (
            player.locksCracked,
            player.tools,
            player.stunned,
            player.registered,
            _pendingActions[gameID][playerAddr].submitted
        );
    }

    /**
     * @notice Get high-level game information.
     * @param gameID The game ID.
     */
    function getGameInfo(
        uint256 gameID
    )
        external
        view
        returns (
            GameState state,
            uint256 currentRound,
            uint256 playerCount,
            uint256 roundStartTime,
            address winner
        )
    {
        GameInfo storage game = _games[gameID];
        return (
            game.state,
            game.currentRound,
            game.playerCount,
            game.roundStartTime,
            game.winner
        );
    }

    /**
     * @notice Get a player's address by their index in a game.
     * @param gameID The game ID.
     * @param playerIndex The 1-based player index.
     */
    function getPlayerAddress(
        uint256 gameID,
        uint256 playerIndex
    ) external view returns (address) {
        return _players[gameID][playerIndex].addr;
    }

    /**
     * @notice Check whether all active players have submitted their actions for the current round.
     * @param gameID The game ID.
     */
    function allActionsSubmitted(
        uint256 gameID
    ) public view returns (bool) {
        GameInfo storage game = _games[gameID];
        for (uint256 i = 1; i <= game.playerCount; i++) {
            if (
                !_pendingActions[gameID][_players[gameID][i].addr].submitted
            ) {
                return false;
            }
        }
        return true;
    }

    /**
     * @notice Get the total number of games created.
     */
    function totalGames() external view returns (uint256) {
        return _gameIdCounter.current();
    }
}
