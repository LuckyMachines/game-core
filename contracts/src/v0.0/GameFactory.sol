// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.34;

import "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";
import "./GameBoard.sol";

contract GameFactory is AccessControlEnumerable {
    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");

    uint256 internal _nextGameBoardId = 1;

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
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(CREATOR_ROLE, _msgSender());
        gameRegistryAddress = _gameRegistryAddress;
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
        uint256 currentID = _nextGameBoardId;
        gameBoards[_msgSender()].push(currentID);
        gameBoardAddress[currentID] = address(newGameBoard);
        playerRegistryAddress[currentID] = address(newPlayerRegistry);
        _nextGameBoardId++;
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
        uint256 currentID = _nextGameBoardId;
        customGameBoards[_msgSender()].push(currentID);
        gameBoardAddress[currentID] = _gameBoardAddress;
        playerRegistryAddress[currentID] = address(newPlayerRegistry);
        _nextGameBoardId++;
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
