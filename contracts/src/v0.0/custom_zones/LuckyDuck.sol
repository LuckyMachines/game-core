// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "../PlayZone.sol";

contract LuckyDuck is PlayZone {
    constructor(
        address _rulesetAddress,
        address _gameRegistryAddress,
        address adminAddress,
        address factoryAddress
    )
        PlayZone(
            _rulesetAddress,
            _gameRegistryAddress,
            adminAddress,
            factoryAddress
        )
    {}

    function sendPlayerSomewhere(
        address playerAddress,
        uint256 gameID,
        string memory zoneAlias
    ) public {
        // choose path 0 or 1...
        uint256 pathIndex = block.timestamp % 2; // 0 or 1
        address gameBoardAddress = GameRegistry(gameRegistryAddress).gameBoard(
            gameID
        );
        attemptExitFor(
            playerAddress,
            pathIndex,
            gameID,
            zoneAlias,
            gameBoardAddress
        );
    }

    function _playerDidEnter(
        address playerAddress,
        uint256 gameID,
        string memory zoneAlias
    ) internal override {
        sendPlayerSomewhere(playerAddress, gameID, zoneAlias);
    }
}
