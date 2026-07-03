// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

//This is needed to allow investment by the insurers. This will be used as a bank account in this MVP version, that does allow payouts.
contract PremiumPool is AccessControl, ReentrancyGuard {
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant REGISTRY_ROLE = keccak256("REGISTRY_ROLE"); // new

    IERC20 public immutable stablecoin;
    address public policyRegistry;

    uint256 public totalPremiums;
    uint256 public totalPayouts;

    event PoolLinked(address indexed policyRegistry);
    event PremiumRecorded(uint256 amount);
    event PayoutExecuted(address indexed investor, uint256 amount, uint256 indexed policyId, string triggerType);

    constructor(address stablecoinAddress) {
        stablecoin = IERC20(stablecoinAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function linkPolicyRegistry(address registry) external onlyRole(ADMIN_ROLE) {
        require(registry != address(0), "invalid registry");
        policyRegistry = registry;
        //Granting REGISTRY_ROLE in order for premiums to be granted
        _grantRole(REGISTRY_ROLE, registry);
        emit PoolLinked(registry);
    }

    //the registry contract will have this role. ONLY THEM
    function recordPremium(uint256 amount) external onlyRole(REGISTRY_ROLE) {
        require(amount > 0, "amount must be >0");
        totalPremiums += amount;
        emit PremiumRecorded(amount);
    }

    function executePayout(
        address investor,
        uint256 amount,
        uint256 policyId,
        string calldata triggerType
    ) external onlyRole(ORACLE_ROLE) nonReentrant {
        require(stablecoin.balanceOf(address(this)) >= amount, "insufficient pool");
        totalPayouts += amount;
        require(stablecoin.transfer(investor, amount), "payout transfer failed");
        emit PayoutExecuted(investor, amount, policyId, triggerType);
    }

    //Some viewer functions for when we are displaying hyper specifics to the frontend
    function getPoolBalance() public view returns (uint256) {
        return stablecoin.balanceOf(address(this));
    }

    function getAvailableLiquidity() external view returns (uint256) {
        return stablecoin.balanceOf(address(this));
    }

    function getTotalPremiums() external view returns (uint256) {
        return totalPremiums;
    }

    function getTotalPayouts() external view returns (uint256) {
        return totalPayouts;
    }

    function getReserveRatio() external view returns (uint256) {
        if (totalPremiums == 0) return 0;
        return (stablecoin.balanceOf(address(this)) * 100) / totalPremiums;
    }
}