// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// universal registry, for all games across boards

contract GameRegistry is AccessControlEnumerable {
    using Counters for Counters.Counter;
    Counters.Counter internal _gameIdTracker;
    bytes32 public constant GAME_BOARD_ROLE = keccak256("GAME_BOARD_ROLE");
    // mapping from game board address to all game IDs
    mapping(address => uint256[]) public gameIDs;
    // mappings from Game ID
    mapping(uint256 => address) public gameBoard;

    constructor(address adminAddress) {
        _setupRole(DEFAULT_ADMIN_ROLE, adminAddress);
        _gameIdTracker.increment();
    }

    function addGameBoard(address gameBoardAddress)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _setupRole(GAME_BOARD_ROLE, gameBoardAddress);
    }

    function registerGame()
        external
        onlyRole(GAME_BOARD_ROLE)
        returns (uint256 gameID)
    {
        gameID = _gameIdTracker.current();
        gameBoard[gameID] = _msgSender();
        gameIDs[_msgSender()].push(gameID);

        _gameIdTracker.increment();
    }

    function allGames()
        external
        view
        onlyRole(GAME_BOARD_ROLE)
        returns (uint256[] memory)
    {
        return gameIDs[_msgSender()];
    }

    function latestGame(address gameBoardAddress)
        public
        returns (uint256 gameID)
    {
        gameID = 0;
        uint256 l = gameIDs[gameBoardAddress].length;
        if (l > 0) {
            uint256[] memory ids = gameIDs[gameBoardAddress];
            gameID = ids[l - 1];
        }
    }
}
