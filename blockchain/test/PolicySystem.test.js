const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Insurance Policy System Gurantee testing", function () {
  let usdc, registry, pool, oracle;
  let admin, insurer, investor, oracleNode, unauthorized;

  //Using ethers 6 so have to syntax accordingly 
  const INITIAL_BALANCE = ethers.parseUnits("10000", 18);
  const PREMIUM_AMOUNT = ethers.parseUnits("500", 18);
  const COVERAGE_AMOUNT = ethers.parseUnits("5000", 18);
  const THRESHOLD_BPS = 150; // 1.5%
  const TRIGGER_TYPE = "WEATHER_INDEX";

  //Role hashing and assigning
  const ADMIN_ROLE = ethers.id("ADMIN_ROLE");
  const INSURER_ROLE = ethers.id("INSURER_ROLE");
  const ORACLE_ROLE = ethers.id("ORACLE_ROLE");

  beforeEach(async function () {
    [admin, insurer, investor, oracleNode, unauthorized] = await ethers.getSigners();

    //Contract deployments internla
    const MockUSDC = await ethers.getContractFactory("MockRWFC");
    usdc = await MockUSDC.deploy();

    const PolicyRegistry = await ethers.getContractFactory("PolicyRegistry");
    registry = await PolicyRegistry.deploy(await usdc.getAddress());

    const PremiumPool = await ethers.getContractFactory("PremiumPool");
    pool = await PremiumPool.deploy(await usdc.getAddress());

    const TriggerOracle = await ethers.getContractFactory("TriggerOracle");
    oracle = await TriggerOracle.deploy(await registry.getAddress(), await pool.getAddress());

    //Linking in internal system
    await registry.grantRole(INSURER_ROLE, insurer.address);
    await registry.setPremiumPool(await pool.getAddress());

    await pool.linkPolicyRegistry(await registry.getAddress());
    await pool.grantRole(ORACLE_ROLE, oracleNode.address);

    //The initial token balance/capitalisation
    await usdc.mint(investor.address, INITIAL_BALANCE);
    await usdc.mint(await pool.getAddress(), INITIAL_BALANCE);
  });

  describe("Deployment Verification in progress", function () {
    it("Should link configs and distribute roles appropriately", async function () {
      expect(await registry.stablecoin()).to.equal(await usdc.getAddress());
      expect(await pool.stablecoin()).to.equal(await usdc.getAddress());
      expect(await registry.premiumPool()).to.equal(await pool.getAddress());
      expect(await pool.policyRegistry()).to.equal(await registry.getAddress());
      
      expect(await registry.hasRole(INSURER_ROLE, insurer.address)).to.be.true;
      expect(await pool.hasRole(ORACLE_ROLE, oracleNode.address)).to.be.true;
    });
  });

  describe("Policy Management & Purchase Lifecycle", function () {
    it("Should allow authorized insurers to create a policy", async function () {
      await expect(
        registry.connect(insurer).createPolicy(
          investor.address,
          COVERAGE_AMOUNT,
          PREMIUM_AMOUNT,
          THRESHOLD_BPS,
          TRIGGER_TYPE
        )
      )
        .to.emit(registry, "PolicyCreated")
        .withArgs(1, investor.address, COVERAGE_AMOUNT, PREMIUM_AMOUNT, TRIGGER_TYPE);

      const policy = await registry.getPolicy(1);
      expect(policy.id).to.equal(1);
      expect(policy.investor).to.equal(investor.address);
      expect(policy.active).to.be.false;
      expect(policy.paidOut).to.be.false;
    });

    it("Should allow investors to purchase policies and move premiums into the pool", async function () {
      await registry.connect(insurer).createPolicy(investor.address, COVERAGE_AMOUNT, PREMIUM_AMOUNT, THRESHOLD_BPS, TRIGGER_TYPE);
      await usdc.connect(investor).approve(await registry.getAddress(), PREMIUM_AMOUNT);

      await expect(registry.connect(investor).purchasePolicy(1))
        .to.emit(registry, "PolicyPurchased")
        .withArgs(1, investor.address);

      const policy = await registry.getPolicy(1);
      assertTrue = expect(policy.active).to.be.true;

      // In Ethers v6, math uses native JavaScript arithmetic operations (+) (-) for BigInt types
      expect(await usdc.balanceOf(investor.address)).to.equal(INITIAL_BALANCE - PREMIUM_AMOUNT);
      expect(await usdc.balanceOf(await pool.getAddress())).to.equal(INITIAL_BALANCE + PREMIUM_AMOUNT);
    });
  });

  describe("Oracle Data Submission & Financial Payouts", function () {
    beforeEach(async function () {
      await registry.connect(insurer).createPolicy(investor.address, COVERAGE_AMOUNT, PREMIUM_AMOUNT, THRESHOLD_BPS, TRIGGER_TYPE);
      await usdc.connect(investor).approve(await registry.getAddress(), PREMIUM_AMOUNT);
      await registry.connect(investor).purchasePolicy(1);
    });

    it("Should successfully process data submission triggers through the Oracle", async function () {
      await expect(oracle.connect(admin).submitTrigger(1, TRIGGER_TYPE, 180))
        .to.emit(oracle, "TriggerSubmitted")
        .withArgs(1, TRIGGER_TYPE, 180);
    });

    it("Should execute settlement paths and return coverage payouts to investors", async function () {
      await registry.connect(admin).markPaidOut(1);
      
      const policy = await registry.getPolicy(1);
      expect(policy.paidOut).to.be.true;

      const investorBalanceBefore = await usdc.balanceOf(investor.address);

      await expect(pool.connect(oracleNode).executePayout(investor.address, COVERAGE_AMOUNT, 1, TRIGGER_TYPE))
        .to.emit(pool, "PayoutExecuted")
        .withArgs(investor.address, COVERAGE_AMOUNT, 1, TRIGGER_TYPE);

      expect(await usdc.balanceOf(investor.address)).to.equal(investorBalanceBefore + COVERAGE_AMOUNT);
      expect(await pool.totalPayouts()).to.equal(COVERAGE_AMOUNT);
    });
  });

  describe("Access Guards & Input Validation", function () {
    it("Should actively block unauthorized interactions", async function () {
      await expect(
        registry.connect(unauthorized).createPolicy(investor.address, COVERAGE_AMOUNT, PREMIUM_AMOUNT, THRESHOLD_BPS, TRIGGER_TYPE)
      ).to.be.reverted;

      await registry.connect(insurer).createPolicy(investor.address, COVERAGE_AMOUNT, PREMIUM_AMOUNT, THRESHOLD_BPS, TRIGGER_TYPE);

      await expect(
        registry.connect(unauthorized).purchasePolicy(1)
      ).to.be.revertedWith("not investor");

      await expect(
        pool.connect(unauthorized).executePayout(investor.address, COVERAGE_AMOUNT, 1, TRIGGER_TYPE)
      ).to.be.reverted;
    });

    it("Should validate parameters accurately on policy definitions", async function () {
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
  });
});