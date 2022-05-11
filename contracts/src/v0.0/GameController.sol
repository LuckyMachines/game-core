// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "./PlayZone.sol";
import "./GameBoard.sol";

contract GameController is AccessControlEnumerable {
    constructor(address adminAddress) {
        _setupRole(DEFAULT_ADMIN_ROLE, adminAddress);
    }

    function exitToPath(
        uint256 pathIndex,
        uint256 gameID,
        address gameBoardAddress
    ) public {
        // called directly by player
        GameBoard(gameBoardAddress).exitToPath(gameID, msg.sender, pathIndex);
    }
}
