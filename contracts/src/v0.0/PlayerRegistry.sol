// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "./GameBoard.sol";

// Registry is tied to one game board
// each registry can have custom rules for registration

contract PlayerRegistry is AccessControlEnumerable {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant GAME_BOARD_ROLE = keccak256("GAMEBOARD_ROLE");

    GameBoard internal GAME_BOARD;

    // Mappings from gameID
    //  or [game ID][player address]
    mapping(uint256 => mapping(address => bool)) public isRegistered;
    mapping(uint256 => mapping(address => uint256)) public playerID;
    mapping(uint256 => mapping(uint256 => address)) public playerAddress;
    mapping(uint256 => uint256) public totalRegistrations;
    mapping(uint256 => uint256) public registrationLimit;
    mapping(uint256 => bool) public registrationLocked;

    constructor(address gameBoardAddress, address adminAddress) {
        GAME_BOARD = GameBoard(gameBoardAddress);
        _setupRole(DEFAULT_ADMIN_ROLE, adminAddress);
        _setupRole(REGISTRAR_ROLE, adminAddress);
        _setupRole(GAME_BOARD_ROLE, gameBoardAddress);
    }

    function canRegister(address _playerAddress, uint256 gameID)
        public
        view
        returns (bool)
    {
        return _canRegister(_playerAddress, gameID);
    }

    function register(uint256 gameID) public {
        require(
            _canRegister(msg.sender, gameID),
            "Player not qualified to register"
        );
        _register(gameID, msg.sender);
    }

    function registerPlayer(address _playerAddress, uint256 gameID)
        public
        onlyRole(REGISTRAR_ROLE)
    {
        require(
            _canRegister(_playerAddress, gameID),
            "Player not qualified to register"
        );
        _register(gameID, _playerAddress);
    }

    function playerAddressesInRange(
        uint256 startingID,
        uint256 maxID,
        uint256 gameID
    ) public view returns (address[] memory) {
        require(
            startingID <= totalRegistrations[gameID],
            "starting ID out of bounds"
        );
        require(maxID >= startingID, "maxID < startingID");
        // require starting ID exists
        uint256 actualMaxID = maxID;
        uint256 size = actualMaxID - startingID + 1;
        address[] memory players = new address[](size);
        for (uint256 i = startingID; i < startingID + size; i++) {
            uint256 index = startingID - i;
            players[index] = playerAddress[gameID][i];
        }
        return players;
    }

    // function registerPlayers(address[] memory playerAddresses, uint256 gameID)
    //     public
    //     onlyRole(REGISTRAR_ROLE)
    // {
    //     require(
    //         _canRegister(playerAddress, gameID),
    //         "Player not qualified to register"
    //     );
    //     isRegistered[gameID][playerAddress] = true;
    // }

    function lockRegistration(uint256 gameID)
        external
        onlyRole(GAME_BOARD_ROLE)
    {
        registrationLocked[gameID] = true;
    }

    function _register(uint256 gameID, address player) internal {
        if (!isRegistered[gameID][player]) {
            isRegistered[gameID][player] = true;
            uint256 newID = totalRegistrations[gameID] + 1; // IDs start @ 1
            totalRegistrations[gameID] = newID;
            playerID[gameID][player] = newID;
            playerAddress[gameID][newID] = player;
        }
    }

    // override for custom registration behavior
    function _canRegister(address _playerAddress, uint256 gameID)
        internal
        view
        virtual
        returns (bool playerCanRegister)
    {
        playerCanRegister = (_playerAddress == address(0) ||
            registrationLocked[gameID])
            ? false
            : (registrationLimit[gameID] == 0 ||
                registrationLimit[gameID] > totalRegistrations[gameID])
            ? true
            : false;
    }
}
