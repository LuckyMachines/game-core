// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.34;

import "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";

contract Ruleset is AccessControlEnumerable {
    bytes32 public constant GAME_MASTER_ROLE = keccak256("GAME_MASTER_ROLE");
    bytes32 public constant FACTORY_ROLE = keccak256("FACTORY_ROLE");

    uint256 internal _nextRulesetId = 1;

    uint256 public version = 1;

    // Mapping from Ruleset ID
    mapping(uint256 => bool[]) public rules;
    mapping(uint256 => bool) public locked;
    mapping(uint256 => address) public payoutToken; // if not set will default to native token
    mapping(uint256 => uint256) public maxCapacity;
    mapping(uint256 => uint256) public maxEntrySize;
    mapping(uint256 => uint256) public maxExitSize;
    mapping(uint256 => uint256) public entryPayoutAmount;
    mapping(uint256 => uint256) public exitPayoutAmount;

    uint256 constant RULE_VALUES = 5;

    modifier onlyFactoryGM() {
        require(
            hasRole(FACTORY_ROLE, _msgSender()) ||
                hasRole(GAME_MASTER_ROLE, _msgSender()),
            "Game Master or Factory role required"
        );
        _;
    }

    constructor(address adminAddress, address factoryAddress) {
        // Admin set as game master
        // Can revoke role if desired
        _grantRole(DEFAULT_ADMIN_ROLE, adminAddress);
        _grantRole(GAME_MASTER_ROLE, adminAddress);
        if (factoryAddress != address(0)) {
            _grantRole(FACTORY_ROLE, factoryAddress);
        }
        // TODO: create ruleset @ 0 default rules, used when none is set
    }

    // Rules
    /*
    0 = use max capacity
    1 = use max entry size
    2 = use max exit size
    3 = payout on entry
    4 = payout on exit
    */

    function createRulesetFromFactory(
        bool[] memory ruleFlags,
        address tokenAddress,
        uint256[] memory ruleValues,
        bool lockAfterSet
    ) external onlyRole(FACTORY_ROLE) returns (uint256 rulesetID) {
        rulesetID = _nextRulesetId;
        setAllRules(ruleValues, rulesetID);
        payoutToken[rulesetID] = tokenAddress;
        locked[rulesetID] = lockAfterSet;
        createRuleset(ruleFlags);
    }

    function createRuleset(bool[] memory ruleFlags) public onlyFactoryGM {
        rules[_nextRulesetId] = ruleFlags;
        _nextRulesetId++;
    }

    function getAllRules(uint256 rulesetID)
        public
        view
        returns (bool[] memory)
    {
        return rules[rulesetID];
    }

    function setAllRules(uint256[] memory ruleValues, uint256 rulesetID)
        public
        onlyFactoryGM
    {
        require(ruleValues.length == RULE_VALUES, "invalid number of rules");
        //[maxCapacity, maxEntrySize, maxExitSize, entryPayoutAmount, exitPayoutAmount]
        maxCapacity[rulesetID] = ruleValues[0];
        maxEntrySize[rulesetID] = ruleValues[1];
        maxExitSize[rulesetID] = ruleValues[2];
        entryPayoutAmount[rulesetID] = ruleValues[3];
        exitPayoutAmount[rulesetID] = ruleValues[4];
    }

    function setPayoutToken(address tokenAddress, uint256 rulesetID)
        public
        onlyFactoryGM
    {
        require(!locked[rulesetID], "rules locked");
        payoutToken[rulesetID] = tokenAddress;
    }

    // This will permanently lock this ruleset
    function lockRules(uint256 rulesetID) public onlyFactoryGM {
        locked[rulesetID] = true;
    }
}
