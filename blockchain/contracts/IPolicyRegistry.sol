// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPolicyRegistry {
    struct Policy {
        uint256 id;
        address investor;
        uint256 coverageAmount;
        uint256 premiumAmount;
        uint256 triggerThresholdBps;
        bool active;
        bool paidOut;
        string triggerType;
    }
//Will not need this after official testing but if you dont remember to delete, its fine either way.
    function getPolicy(
        //Add the policy to perpetual memory
        uint256 policyId
    ) external view returns (Policy memory);
}