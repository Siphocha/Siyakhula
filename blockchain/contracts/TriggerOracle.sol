// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./PremiumPool.sol";
import "./PolicyRegistry.sol";

contract TriggerOracle is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    PolicyRegistry public registry;
    PremiumPool public pool;

    //This is a contract which is solely for the purpose of acting as a trigger mechanism
    event TriggerSubmitted(uint256 indexed policyId, string triggerType, int256 triggerValue);

    constructor(address registryAddress, address poolAddress) {
        registry = PolicyRegistry(registryAddress);
        pool = PremiumPool(poolAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
    }

    function submitTrigger(uint256 policyId, string calldata triggerType, int256 triggerValue) external onlyRole(ADMIN_ROLE) {
        IPolicyRegistry.Policy memory p = registry.getPolicy(policyId);
        require(p.active, "policy inactive");
        require(!p.paidOut, "already paid");

        emit TriggerSubmitted(policyId, triggerType, triggerValue);
    }
}