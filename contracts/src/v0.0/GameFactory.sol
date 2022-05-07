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
    mapping(address => uint256[]) public customGameBoards;
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
        uint256 currentID = _gameBoardIdTracker.current();
        gameBoards[_msgSender()].push(currentID);
        gameBoardAddress[currentID] = address(newGameBoard);
        playerRegistryAddress[currentID] = address(newPlayerRegistry);
        _gameBoardIdTracker.increment();
    }

    function addCustomGameBoard(address _gameBoardAddress)
        public
        onlyRole(CREATOR_ROLE)
    {
        GameBoard customGameBoard = GameBoard(_gameBoardAddress);
        address gameBoardAdmin = customGameBoard.getRoleMember(
            DEFAULT_ADMIN_ROLE,
            0
        );
        // set game board admin to registry admin as well
        PlayerRegistry newPlayerRegistry = new PlayerRegistry(
            _gameBoardAddress,
            gameBoardAdmin
        );
        uint256 currentID = _gameBoardIdTracker.current();
        customGameBoards[_msgSender()].push(currentID);
        gameBoardAddress[currentID] = _gameBoardAddress;
        playerRegistryAddress[currentID] = address(newPlayerRegistry);
        _gameBoardIdTracker.increment();
    }

    function getGameBoards() public view returns (uint256[] memory) {
        return gameBoards[_msgSender()];
    }

    function getCustomBoards() public view returns (uint256[] memory) {
        return customGameBoards[_msgSender()];
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
