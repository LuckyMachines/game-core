// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./GameBoard.sol";
import "./GameRegistry.sol";

contract GameFactory is Ownable, AccessControlEnumerable {
    using Counters for Counters.Counter;

    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");

    Counters.Counter internal _gameBoardIdTracker;

    address public gameRegistryAddress;

    // Mappings
    // from creator address
    mapping(address => uint256[]) public gameBoards;
    // from game board ID
    mapping(uint256 => address) public gameBoardAddress;
    mapping(uint256 => address) public playerRegistryAddress;
    mapping(uint256 => uint256[]) public gameIDs;

    constructor(address _gameRegistryAddress) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(CREATOR_ROLE, _msgSender());
        gameRegistryAddress = _gameRegistryAddress;
        _gameBoardIdTracker.increment();
    }

    function createGameBoard(address gameBoardAdmin)
        public
        onlyRole(CREATOR_ROLE)
    {
        GameBoard newGameBoard = new GameBoard(gameBoardAdmin);
        // set game board admin to registry admin as well
        PlayerRegistry newPlayerRegistry = new PlayerRegistry(
            address(newGameBoard),
            gameBoardAdmin
        );
        gameBoards[_msgSender()].push(_gameBoardIdTracker.current());
        gameBoardAddress[_gameBoardIdTracker.current()] = address(newGameBoard);
        playerRegistryAddress[_gameBoardIdTracker.current()] = address(
            newPlayerRegistry
        );
        _gameBoardIdTracker.increment();
    }

    function getGameBoards() public view returns (uint256[] memory) {
        return gameBoards[_msgSender()];
    }

    function requestGameID(uint256 gameBoardID) public onlyRole(CREATOR_ROLE) {
        uint256 gameID = GameBoard(gameBoardAddress[gameBoardID]).createGame(
            playerRegistryAddress[gameBoardID],
            gameRegistryAddress
        );
        gameIDs[gameBoardID].push(gameID);
    }

    function getGameIDs(uint256 gameBoardID)
        public
        view
        returns (uint256[] memory)
    {
        return gameIDs[gameBoardID];
    }
}
