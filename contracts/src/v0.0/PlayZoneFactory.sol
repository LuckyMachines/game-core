// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./PlayZone.sol";
import "./Ruleset.sol";
import "./GameBoard.sol";

contract PlayZoneFactory is Ownable, AccessControlEnumerable {
    using Counters for Counters.Counter;

    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");

    address public gameRegistryAddress;

    // Mappings
    // from creator address
    mapping(address => address[]) public playZones;
    mapping(address => address[]) public customPlayZones;
    // from playzone address
    mapping(address => address) public rulesetAddress;

    // // from game board ID
    // mapping(uint256 => string[]) public zoneAliases;
    // from game board ID => zone alias - returns play zone address

    constructor(address _gameRegistryAddress) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(CREATOR_ROLE, _msgSender());

        gameRegistryAddress = _gameRegistryAddress;
    }

    function createPlayZone() public onlyRole(CREATOR_ROLE) {
        // create new ruleset
        Ruleset newRuleset = new Ruleset(_msgSender(), address(this));
        PlayZone newPlayZone = new PlayZone(
            address(newRuleset),
            gameRegistryAddress,
            _msgSender(),
            address(this)
        );
        playZones[_msgSender()].push(address(newPlayZone));
        rulesetAddress[address(newPlayZone)] = address(newRuleset);
    }

    function createPlayZoneWithRuleset(address _rulesetAddress)
        public
        onlyRole(CREATOR_ROLE)
    {
        PlayZone newPlayZone = new PlayZone(
            _rulesetAddress,
            gameRegistryAddress,
            _msgSender(),
            address(this)
        );
        playZones[_msgSender()].push(address(newPlayZone));
        rulesetAddress[address(newPlayZone)] = _rulesetAddress;
    }

    function addCustomPlayZone(address playZoneAddress, address _rulesetAddress)
        public
        onlyRole(CREATOR_ROLE)
    {
        // make sure to set factory when creating custom zone
        customPlayZones[_msgSender()].push(playZoneAddress);
        rulesetAddress[playZoneAddress] = _rulesetAddress;
    }

    function authorizeBoardOnZones(
        address gameBoardAddress,
        address[] memory zoneAddresses
    ) public onlyRole(CREATOR_ROLE) {
        for (uint256 i = 0; i < zoneAddresses.length; i++) {
            PlayZone(zoneAddresses[i]).addGameBoard(gameBoardAddress);
        }
    }

    function addZonesToBoard() public onlyRole(CREATOR_ROLE) {}

    function setRules(
        bool[] memory ruleFlags,
        uint256[] memory ruleValues,
        address gameBoardAddress,
        uint256 gameID,
        string memory zoneAlias
    ) public onlyRole(CREATOR_ROLE) {
        address zoneAddress = GameBoard(gameBoardAddress).zoneAlias(
            gameID,
            zoneAlias
        );
        Ruleset ruleset = Ruleset(rulesetAddress[zoneAddress]);
        uint256 rulesetID = ruleset.createRulesetFromFactory(
            ruleFlags,
            address(0),
            ruleValues,
            true
        );
        PlayZone(zoneAddress).setRules(rulesetID, gameID, zoneAlias);
    }

    function getPlayZones() public view returns (address[] memory) {
        return playZones[_msgSender()];
    }

    function getCustomZones() public view returns (address[] memory) {
        return customPlayZones[_msgSender()];
    }
}
