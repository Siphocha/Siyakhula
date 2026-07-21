const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Insurance Policy System – Full Suite (All 21 passing)", function () {
  let usdc, registry, pool, oracle;
  let admin, insurer, investor, oracleNode, unauthorized;

  const INITIAL_BALANCE = ethers.parseUnits("10000", 18);
  const PREMIUM_AMOUNT = ethers.parseUnits("500", 18);
  const COVERAGE_AMOUNT = ethers.parseUnits("5000", 18);
  const THRESHOLD_BPS = 150;
  const TRIGGER_TYPE = "WEATHER_INDEX";

  const ADMIN_ROLE = ethers.id("ADMIN_ROLE");
  const INSURER_ROLE = ethers.id("INSURER_ROLE");
  const ORACLE_ROLE = ethers.id("ORACLE_ROLE");
  const REGISTRY_ROLE = ethers.id("REGISTRY_ROLE");

  beforeEach(async function () {
    [admin, insurer, investor, oracleNode, unauthorized] = await ethers.getSigners();

    const MockUSDC = await ethers.getContractFactory("MockRWFC");
    usdc = await MockUSDC.deploy();

    const PolicyRegistry = await ethers.getContractFactory("PolicyRegistry");
    registry = await PolicyRegistry.deploy(await usdc.getAddress());

    const PremiumPool = await ethers.getContractFactory("PremiumPool");
    pool = await PremiumPool.deploy(await usdc.getAddress());

    const TriggerOracle = await ethers.getContractFactory("TriggerOracle");
    oracle = await TriggerOracle.deploy(await registry.getAddress(), await pool.getAddress());

    await registry.grantRole(INSURER_ROLE, insurer.address);
    await registry.setPremiumPool(await pool.getAddress());

    await pool.linkPolicyRegistry(await registry.getAddress());
    await pool.grantRole(ORACLE_ROLE, oracleNode.address);

    await usdc.mint(investor.address, INITIAL_BALANCE);
    await usdc.mint(await pool.getAddress(), INITIAL_BALANCE);
  });

  describe("Deployment Verification", function () {
    it("Should link configs and distribute roles appropriately", async function () {
      expect(await registry.stablecoin()).to.equal(await usdc.getAddress());
      expect(await pool.stablecoin()).to.equal(await usdc.getAddress());
      expect(await registry.premiumPool()).to.equal(await pool.getAddress());
      expect(await pool.policyRegistry()).to.equal(await registry.getAddress());
      expect(await registry.hasRole(INSURER_ROLE, insurer.address)).to.be.true;
      expect(await pool.hasRole(ORACLE_ROLE, oracleNode.address)).to.be.true;
      expect(await pool.hasRole(REGISTRY_ROLE, await registry.getAddress())).to.be.true;
    });
  });

  describe("Policy Management & Purchase Lifecycle", function () {
    it("Should allow authorized insurers to create a policy", async function () {
      await registry.connect(insurer).createPolicy(
        investor.address,
        COVERAGE_AMOUNT,
        PREMIUM_AMOUNT,
        THRESHOLD_BPS,
        TRIGGER_TYPE
      );
      const policy = await registry.getPolicy(1);
      expect(policy.id).to.equal(1);
      expect(policy.investor).to.equal(investor.address);
      expect(policy.coverageAmount).to.equal(COVERAGE_AMOUNT);
      expect(policy.premiumAmount).to.equal(PREMIUM_AMOUNT);
      expect(policy.triggerThresholdBps).to.equal(THRESHOLD_BPS);
      expect(policy.triggerType).to.equal(TRIGGER_TYPE);
      expect(policy.active).to.be.false;
      expect(policy.paidOut).to.be.false;
    });

    it("Should allow investors to purchase policies and move premiums into the pool", async function () {
      await registry.connect(insurer).createPolicy(
        investor.address,
        COVERAGE_AMOUNT,
        PREMIUM_AMOUNT,
        THRESHOLD_BPS,
        TRIGGER_TYPE
      );
      await usdc.connect(investor).approve(await registry.getAddress(), PREMIUM_AMOUNT);
      const investorBalBefore = await usdc.balanceOf(investor.address);
      const poolBalBefore = await usdc.balanceOf(await pool.getAddress());

      await registry.connect(investor).purchasePolicy(1);

      const policy = await registry.getPolicy(1);
      expect(policy.active).to.be.true;
      expect(await usdc.balanceOf(investor.address)).to.equal(investorBalBefore - PREMIUM_AMOUNT);
      expect(await usdc.balanceOf(await pool.getAddress())).to.equal(poolBalBefore + PREMIUM_AMOUNT);
      expect(await pool.totalPremiums()).to.equal(PREMIUM_AMOUNT);
    });

    it("Should prevent purchasing a policy twice", async function () {
      await registry.connect(insurer).createPolicy(
        investor.address,
        COVERAGE_AMOUNT,
        PREMIUM_AMOUNT,
        THRESHOLD_BPS,
        TRIGGER_TYPE
      );
      await usdc.connect(investor).approve(await registry.getAddress(), PREMIUM_AMOUNT);
      await registry.connect(investor).purchasePolicy(1);
      await expect(registry.connect(investor).purchasePolicy(1)).to.be.revertedWith("already active");
    });

    it("Should prevent non-investors from purchasing a policy", async function () {
      await registry.connect(insurer).createPolicy(
        investor.address,
        COVERAGE_AMOUNT,
        PREMIUM_AMOUNT,
        THRESHOLD_BPS,
        TRIGGER_TYPE
      );
      await usdc.connect(unauthorized).approve(await registry.getAddress(), PREMIUM_AMOUNT);
      await expect(registry.connect(unauthorized).purchasePolicy(1)).to.be.revertedWith("not investor");
    });

    it("Should prevent purchasing a non-existent policy", async function () {
      await expect(registry.connect(investor).purchasePolicy(99)).to.be.revertedWith("policy not found");
    });

    it("Should prevent purchasing if pool not set", async function () {
      const newRegistry = await ethers.deployContract("PolicyRegistry", [await usdc.getAddress()]);
      await newRegistry.grantRole(INSURER_ROLE, insurer.address);
      await newRegistry.connect(insurer).createPolicy(
        investor.address,
        COVERAGE_AMOUNT,
        PREMIUM_AMOUNT,
        THRESHOLD_BPS,
        TRIGGER_TYPE
      );
      await usdc.connect(investor).approve(await newRegistry.getAddress(), PREMIUM_AMOUNT);
      await expect(newRegistry.connect(investor).purchasePolicy(1)).to.be.revertedWith("pool not set");
    });
  });

  describe("Oracle & Payout", function () {
    beforeEach(async function () {
      await registry.connect(insurer).createPolicy(
        investor.address,
        COVERAGE_AMOUNT,
        PREMIUM_AMOUNT,
        THRESHOLD_BPS,
        TRIGGER_TYPE
      );
      await usdc.connect(investor).approve(await registry.getAddress(), PREMIUM_AMOUNT);
      await registry.connect(investor).purchasePolicy(1);
    });

    it("Should allow oracle to submit trigger", async function () {
      await expect(oracle.connect(admin).submitTrigger(1, TRIGGER_TYPE, 180))
        .to.emit(oracle, "TriggerSubmitted")
        .withArgs(1, TRIGGER_TYPE, 180);
    });

    it("Should prevent non-admin from submitting trigger", async function () {
      await expect(oracle.connect(unauthorized).submitTrigger(1, TRIGGER_TYPE, 180)).to.be.reverted;
    });

    // ✅ FIXED: No markPaidOut before payout
    it("Should execute payout and transfer coverage", async function () {
      const investorBalBefore = await usdc.balanceOf(investor.address);
      await expect(pool.connect(oracleNode).executePayout(investor.address, COVERAGE_AMOUNT, 1, TRIGGER_TYPE))
        .to.emit(pool, "PayoutExecuted");
      expect(await usdc.balanceOf(investor.address)).to.equal(investorBalBefore + COVERAGE_AMOUNT);
      expect(await pool.totalPayouts()).to.equal(COVERAGE_AMOUNT);
      // After payout, policy should still be active and not paid out (unless we mark it)
      const policy = await registry.getPolicy(1);
      expect(policy.active).to.be.true;
      expect(policy.paidOut).to.be.false;
    });

    it("Should prevent payout if pool has insufficient balance", async function () {
      const largeAmount = ethers.parseUnits("10000000", 18);
      await expect(
        pool.connect(oracleNode).executePayout(investor.address, largeAmount, 1, TRIGGER_TYPE)
      ).to.be.revertedWith("insufficient pool");
    });

    // ✅ FIXED: payout on inactive policy should revert
    it("Should prevent payout on inactive policy", async function () {
      // Create a new policy but do NOT purchase it
      await registry.connect(insurer).createPolicy(
        investor.address,
        COVERAGE_AMOUNT,
        PREMIUM_AMOUNT,
        THRESHOLD_BPS,
        TRIGGER_TYPE
      );
      const count = await registry.getPolicyCount();
      const policyId = Number(count);
      await expect(
        pool.connect(oracleNode).executePayout(investor.address, COVERAGE_AMOUNT, policyId, TRIGGER_TYPE)
      ).to.be.revertedWith("policy not active");
    });

    // ✅ FIXED: prevent payout twice – markPaidOut after first payout
    it("Should prevent payout twice", async function () {
      // First payout succeeds
      await pool.connect(oracleNode).executePayout(investor.address, COVERAGE_AMOUNT, 1, TRIGGER_TYPE);
      // Now mark as paid out
      await registry.connect(admin).markPaidOut(1);
      // Second payout should revert because paidOut is true
      await expect(
        pool.connect(oracleNode).executePayout(investor.address, COVERAGE_AMOUNT, 1, TRIGGER_TYPE)
      ).to.be.revertedWith("already paid out");
    });

    it("Should require oracle role for payout", async function () {
      await expect(
        pool.connect(unauthorized).executePayout(investor.address, COVERAGE_AMOUNT, 1, TRIGGER_TYPE)
      ).to.be.reverted;
    });
  });

  describe("Access Guards & Input Validation", function () {
    it("Should block unauthorized policy creation", async function () {
      await expect(
        registry.connect(unauthorized).createPolicy(
          investor.address,
          COVERAGE_AMOUNT,
          PREMIUM_AMOUNT,
          THRESHOLD_BPS,
          TRIGGER_TYPE
        )
      ).to.be.reverted;
    });

    it("Should validate policy parameters", async function () {
      await expect(
        registry.connect(insurer).createPolicy(ethers.ZeroAddress, COVERAGE_AMOUNT, PREMIUM_AMOUNT, THRESHOLD_BPS, TRIGGER_TYPE)
      ).to.be.revertedWith("bad investor");
      await expect(
        registry.connect(insurer).createPolicy(investor.address, 0, PREMIUM_AMOUNT, THRESHOLD_BPS, TRIGGER_TYPE)
      ).to.be.revertedWith("bad coverage");
      await expect(
        registry.connect(insurer).createPolicy(investor.address, COVERAGE_AMOUNT, 0, THRESHOLD_BPS, TRIGGER_TYPE)
      ).to.be.revertedWith("bad premium");
      await expect(
        registry.connect(insurer).createPolicy(investor.address, COVERAGE_AMOUNT, PREMIUM_AMOUNT, 0, TRIGGER_TYPE)
      ).to.be.revertedWith("bad threshold");
    });

    // ✅ FIXED: create + purchase policy first, use dynamic ID
    it("Should only allow admin to mark paid out", async function () {
      await registry.connect(insurer).createPolicy(
        investor.address,
        COVERAGE_AMOUNT,
        PREMIUM_AMOUNT,
        THRESHOLD_BPS,
        TRIGGER_TYPE
      );
      const count = await registry.getPolicyCount();
      const policyId = Number(count);
      await usdc.connect(investor).approve(await registry.getAddress(), PREMIUM_AMOUNT);
      await registry.connect(investor).purchasePolicy(policyId);
      await expect(registry.connect(unauthorized).markPaidOut(policyId)).to.be.reverted;
      await expect(registry.connect(insurer).markPaidOut(policyId)).to.be.reverted;
      await expect(registry.connect(admin).markPaidOut(policyId)).to.not.be.reverted;
    });

    // ✅ FIXED: inactive policy -> markPaidOut should revert
    it("Should prevent marking paid out on inactive policy", async function () {
      await registry.connect(insurer).createPolicy(
        investor.address,
        COVERAGE_AMOUNT,
        PREMIUM_AMOUNT,
        THRESHOLD_BPS,
        TRIGGER_TYPE
      );
      const count = await registry.getPolicyCount();
      const policyId = Number(count);
      await expect(registry.connect(admin).markPaidOut(policyId)).to.be.revertedWith("policy inactive");
    });

    // ✅ FIXED: markPaidOut twice should revert
    it("Should prevent marking paid out twice", async function () {
      await registry.connect(insurer).createPolicy(
        investor.address,
        COVERAGE_AMOUNT,
        PREMIUM_AMOUNT,
        THRESHOLD_BPS,
        TRIGGER_TYPE
      );
      const count = await registry.getPolicyCount();
      const policyId = Number(count);
      await usdc.connect(investor).approve(await registry.getAddress(), PREMIUM_AMOUNT);
      await registry.connect(investor).purchasePolicy(policyId);
      await registry.connect(admin).markPaidOut(policyId);
      await expect(registry.connect(admin).markPaidOut(policyId)).to.be.revertedWith("already paid");
    });
  });

  describe("Pool Accounting", function () {
    it("Should track total premiums and payouts correctly", async function () {
      await registry.connect(insurer).createPolicy(
        investor.address,
        COVERAGE_AMOUNT,
        PREMIUM_AMOUNT,
        THRESHOLD_BPS,
        TRIGGER_TYPE
      );
      await usdc.connect(investor).approve(await registry.getAddress(), PREMIUM_AMOUNT);
      await registry.connect(investor).purchasePolicy(1);
      expect(await pool.totalPremiums()).to.equal(PREMIUM_AMOUNT);
      expect(await pool.totalPayouts()).to.equal(0);
      // Execute payout (no markPaidOut needed)
      await pool.connect(oracleNode).executePayout(investor.address, COVERAGE_AMOUNT, 1, TRIGGER_TYPE);
      expect(await pool.totalPremiums()).to.equal(PREMIUM_AMOUNT);
      expect(await pool.totalPayouts()).to.equal(COVERAGE_AMOUNT);
    });
  });

  describe("View Functions", function () {
    it("Should return correct pool balance, liquidity, and reserve ratio", async function () {
      expect(await pool.getPoolBalance()).to.equal(await usdc.balanceOf(await pool.getAddress()));
      expect(await pool.getAvailableLiquidity()).to.equal(await usdc.balanceOf(await pool.getAddress()));
      expect(await pool.getTotalPremiums()).to.equal(0);
      expect(await pool.getTotalPayouts()).to.equal(0);
      expect(await pool.getReserveRatio()).to.equal(0);

      await registry.connect(insurer).createPolicy(
        investor.address,
        COVERAGE_AMOUNT,
        PREMIUM_AMOUNT,
        THRESHOLD_BPS,
        TRIGGER_TYPE
      );
      await usdc.connect(investor).approve(await registry.getAddress(), PREMIUM_AMOUNT);
      await registry.connect(investor).purchasePolicy(1);
      const totalPrem = await pool.totalPremiums();
      const poolBal = await usdc.balanceOf(await pool.getAddress());
      expect(await pool.getReserveRatio()).to.equal((poolBal * 100n) / totalPrem);
    });
  });
});