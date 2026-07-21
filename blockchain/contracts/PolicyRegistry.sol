// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol"; // added
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./IPolicyRegistry.sol";
import "./PremiumPool.sol";

//This is the meat of the application. Please work.
contract PolicyRegistry is
    AccessControl,
    ReentrancyGuard,
    IPolicyRegistry
{
    using SafeERC20 for IERC20; // added

    //Very helpful for assiging fixed roles
    bytes32 public constant ADMIN_ROLE =
        keccak256("ADMIN_ROLE");

    bytes32 public constant INSURER_ROLE =
        keccak256("INSURER_ROLE");

    IERC20 public immutable stablecoin;

    address public premiumPool;

    uint256 private _policyIdCounter;

    //Setting limitations of policies.
    mapping(uint256 => Policy) private _policies;
    mapping(address => uint256[]) private _policiesByInvestor;

    event PolicyCreated(
        uint256 indexed policyId,
        address indexed investor,
        uint256 coverageAmount,
        uint256 premiumAmount,
        string triggerType
    );

    event PremiumPoolSet(address indexed pool);

    //most important key events
    event PolicyPurchased(
        uint256 indexed policyId,
        address indexed investor
    );

    constructor(address stablecoinAddress) {
        //know the addresses
        stablecoin = IERC20(stablecoinAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(INSURER_ROLE, msg.sender);
    }

    function setPremiumPool(
        address pool
    ) external onlyRole(INSURER_ROLE) {
        require(pool != address(0), "invalid pool");

        premiumPool = pool;

        emit PremiumPoolSet(pool);
    }

    function createPolicy(
        //What really makes up a policy
        address investor,
        uint256 coverageAmount,
        uint256 premiumAmount,
        uint256 triggerThresholdBps,
        string calldata triggerType
    )
        external
        onlyRole(INSURER_ROLE)
        returns (uint256)
    {
        require(
            investor != address(0),
            "bad investor"
        );

        require(
            coverageAmount > 0,
            "bad coverage"
        );

        require(
            premiumAmount > 0,
            "bad premium"
        );

        require(
            triggerThresholdBps > 0,
            "bad threshold"
        );

        _policyIdCounter++;

        uint256 policyId = _policyIdCounter;

        _policies[policyId] = Policy({
            id: policyId,
            investor: investor,
            coverageAmount: coverageAmount,
            premiumAmount: premiumAmount,
            triggerThresholdBps: triggerThresholdBps,
            active: false,
            paidOut: false,
            triggerType: triggerType
        });

        emit PolicyCreated(
            policyId,
            investor,
            coverageAmount,
            premiumAmount,
            triggerType
        );

        return policyId;
    }

    function purchasePolicy(
        uint256 policyId
    ) external nonReentrant {

        Policy storage p = _policies[policyId];

        require(
            p.id != 0,
            "policy not found"
        );

        require(
            msg.sender == p.investor,
            "not investor"
        );

        require(
            !p.active,
            "already active"
        );

        require(
            premiumPool != address(0),
            "pool not set"
        );

        // Use safeTransferFrom which will revert if transfer fails
        stablecoin.safeTransferFrom(
            msg.sender,
            premiumPool,
            p.premiumAmount
        );

        PremiumPool(premiumPool).recordPremium(
            p.premiumAmount
        );

        p.active = true;

        _policiesByInvestor[msg.sender].push(
            policyId
        );

        emit PolicyPurchased(
            policyId,
            msg.sender
        );
    }

    function markPaidOut(
        uint256 policyId
    ) external onlyRole(ADMIN_ROLE) {

        Policy storage p = _policies[policyId];

        require(
            p.id != 0,
            "policy not found"
        );

        require(
            p.active,
            "policy inactive"
        );

        require(
            !p.paidOut,
            "already paid"
        );

        p.paidOut = true;
    }

    function getPolicy(
        uint256 policyId
    )
        external
        view
        override
        returns (Policy memory)
    {
        require(
            _policies[policyId].id != 0,
            "policy not found"
        );

        return _policies[policyId];
    }

    function getPoliciesByInvestor(
        address investor
    )
        external
        view
        returns (uint256[] memory)
    {
        return _policiesByInvestor[investor];
    }

    function getPolicyCount()
        external
        view
        returns (uint256)
    {
        return _policyIdCounter;
    }
}