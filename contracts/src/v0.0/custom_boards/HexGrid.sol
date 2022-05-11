// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "../GameBoard.sol";
import "../libraries/XYCoords.sol";

contract HexGrid is GameBoard {
    uint256 public gridWidth;
    uint256 public gridHeight;
    address public zoneAddress;

    string[] public zoneAliases;

    constructor(
        address adminAddress,
        uint256 _gridWidth,
        uint256 _gridHeight,
        address _zoneAddress
    ) GameBoard(adminAddress) {
        gridWidth = _gridWidth;
        gridHeight = _gridHeight;
        zoneAddress = _zoneAddress;
    }

    function createGrid() public virtual onlyFactoryGM {
        if (zoneAliases.length == 0) {
            address[] memory addresses = new address[](gridWidth * gridHeight);

            zoneAliases = XYCoordinates.coordinates(gridHeight, gridWidth);

            for (uint256 i = 0; i < addresses.length; i++) {
                addresses[i] = zoneAddress;
            }
            // game ID 0 will be prototype for rest of games
            _addZones(addresses, zoneAliases, 0);
        }
    }

    function getZoneAliases() public view returns (string[] memory) {
        return zoneAliases;
    }

    function getInputs(uint256 gameID, string memory _zoneAlias)
        public
        view
        override
        returns (string[] memory zoneInputs)
    {
        string[] memory gameInputs = playZoneInputs[gameID][_zoneAlias];
        string[] memory defaultInputs = playZoneInputs[0][_zoneAlias];
        if (gameInputs.length > 0) {
            string[] memory aliases = new string[](
                gameInputs.length + defaultInputs.length
            );
            for (uint256 i = 0; i < aliases.length; i++) {
                if (i < defaultInputs.length) {
                    aliases[i] = defaultInputs[i];
                } else {
                    aliases[i] = gameInputs[i - defaultInputs.length];
                }
                zoneInputs = aliases;
            }
        } else {
            zoneInputs = defaultInputs;
        }
    }

    function getOutputs(uint256 gameID, string memory _zoneAlias)
        public
        view
        override
        returns (string[] memory zoneOutputs)
    {
        string[] memory gameOutputs = playZoneOutputs[gameID][_zoneAlias];
        string[] memory defaultOutputs = playZoneOutputs[0][_zoneAlias];
        if (gameOutputs.length > 0) {
            string[] memory aliases = new string[](
                gameOutputs.length + defaultOutputs.length
            );
            for (uint256 i = 0; i < aliases.length; i++) {
                if (i < defaultOutputs.length) {
                    aliases[i] = defaultOutputs[i];
                } else {
                    aliases[i] = gameOutputs[i - defaultOutputs.length];
                }
                zoneOutputs = aliases;
            }
        } else {
            zoneOutputs = defaultOutputs;
        }
    }
}
