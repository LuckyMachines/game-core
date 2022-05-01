// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "../PlayZone.sol";

contract BackDoor is PlayZone {
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

    function _customAction(
        string[] memory stringParams,
        address[] memory addressParams,
        uint256[] memory uintParams
    ) internal override {
        address playerAddress = addressParams[0];
        address gameBoardAddress = addressParams[1];
        string memory zoneAlias = stringParams[0];
        uint256 gameID = uintParams[0];
        uint256 pathIndex = 0;

        kickPlayer(
            playerAddress,
            pathIndex,
            gameID,
            zoneAlias,
            gameBoardAddress
        );
    }

    function kickPlayer(
        address playerAddress,
        uint256 pathIndex,
        uint256 gameID,
        string memory zoneAlias,
        address gameBoardAddress
    ) public {
        attemptExitFor(
            playerAddress,
            pathIndex,
            gameID,
            zoneAlias,
            gameBoardAddress
        );
    }
}
