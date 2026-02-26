// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.34;

import "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";

// universal registry, for all games across boards

contract GameRegistry is AccessControlEnumerable {
    uint256 internal _nextGameId = 1;
    bytes32 public constant GAME_BOARD_ROLE = keccak256("GAME_BOARD_ROLE");
    // mapping from game board address to all game IDs
    mapping(address => uint256[]) public gameIDs;
    // mappings from Game ID
    mapping(uint256 => address) public gameBoard;

    constructor(address adminAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, adminAddress);
    }

    function addGameBoard(address gameBoardAddress)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _grantRole(GAME_BOARD_ROLE, gameBoardAddress);
    }

    function registerGame()
        external
        onlyRole(GAME_BOARD_ROLE)
        returns (uint256 gameID)
    {
        gameID = _nextGameId;
        gameBoard[gameID] = _msgSender();
        gameIDs[_msgSender()].push(gameID);

        _nextGameId++;
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
        view
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
