// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "../GameBoard.sol";
import "../libraries/XYCoords.sol";

contract HexGrid is GameBoard {
    uint256 public gridWidth;
    uint256 public gridHeight;
    address public zoneAddress;

    constructor(
        address adminAddress,
        uint256 _gridWidth,
        uint256 _gridHeight,
        address _zoneAddress
    ) GameBoard(adminAddress) {}

    function createGrid(uint256 gameID) public virtual onlyFactoryGM {
        address[] memory addresses = new address[](gridWidth * gridHeight);
        string[] memory aliases = XYCoordinates.coordinates(
            gridHeight,
            gridWidth
        );
        for (uint256 i = 0; i < addresses.length; i++) {
            addresses[i] = zoneAddress;
        }
        _addZones(addresses, aliases, gameID);
    }
}
