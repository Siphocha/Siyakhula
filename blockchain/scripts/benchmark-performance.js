const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const [deployer, investor] = await hre.ethers.getSigners();

  const registry = await ethers.getContractAt(
    "PolicyRegistry",
    process.env.POLICY_REGISTRY_ADDRESS
  );
  const token = await ethers.getContractAt(
    "MockRWFC",
    process.env.MOCK_RWFC_ADDRESS
  );
  const pool = await ethers.getContractAt(
    "PremiumPool",
    process.env.PREMIUM_POOL_ADDRESS
  );
  const oracle = await ethers.getContractAt(
    "TriggerOracle",
    process.env.TRIGGER_ORACLE_ADDRESS
  );

  const coverage = ethers.parseUnits("10000", 18);
  const premium = ethers.parseUnits("300", 18);
  const threshold = 150;

  console.log("⏱️ Performance Benchmark (Sepolia)\n");

  // 1. Create Policy
  console.time("Create Policy");
  const tx1 = await registry.connect(deployer).createPolicy(
    investor.address,
    coverage,
    premium,
    threshold,
    "CURRENCY_DEV"
  );
  const receipt1 = await tx1.wait();
  console.timeEnd("Create Policy");

  // Parse event to get policy ID
  const event = receipt1.logs
    .map(log => {
      try {
        return registry.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find(e => e && e.name === "PolicyCreated");
  const policyId = event ? Number(event.args.policyId) : Number(await registry.getPolicyCount());
  console.log("✅ Policy ID:", policyId);
  console.log("Gas used (create):", receipt1.gasUsed.toString());

  // Check investor balance & allowance
  const balance = await token.balanceOf(investor.address);
  const allowance = await token.allowance(investor.address, registry.target);
  console.log(`Investor balance: ${ethers.formatUnits(balance, 18)} RWFC`);
  console.log(`Allowance: ${ethers.formatUnits(allowance, 18)} RWFC`);

  // 2. Approve + Purchase (investor)
  try {
    if (allowance < premium) {
      console.log("Approving...");
      const approveTx = await token.connect(investor).approve(registry.target, premium);
      await approveTx.wait();
      console.log("Approval confirmed.");
    }
  } catch (err) {
    console.error("❌ Approval failed:", err.message);
    return;
  }

  try {
    console.time("Approve + Purchase");
    const tx2 = await registry.connect(investor).purchasePolicy(policyId);
    await tx2.wait();
    console.timeEnd("Approve + Purchase");
    const receipt2 = await ethers.provider.getTransactionReceipt(tx2.hash);
    console.log("Gas used (purchase):", receipt2.gasUsed.toString());
  } catch (err) {
    console.error("❌ Purchase failed:", err.message);
    // Try to get revert reason from the error
    if (err.data) {
      console.log("Revert data:", err.data);
      // Attempt to decode with the registry interface
      try {
        const decoded = registry.interface.parseError(err.data);
        if (decoded) console.log("Revert reason:", decoded.name, decoded.args);
      } catch {
        console.log("Could not decode revert data.");
      }
    }
    return;
  }

  // 3. Trigger + Payout (deployer has ORACLE_ROLE)
  try {
    console.time("Trigger + Payout");
    await oracle.connect(deployer).submitTrigger(policyId, "CURRENCY_DEV", 180);
    const tx3 = await pool.connect(deployer).executePayout(
      investor.address,
      coverage,
      policyId,
      "CURRENCY_DEV"
    );
    await tx3.wait();
    console.timeEnd("Trigger + Payout");
    const receipt3 = await ethers.provider.getTransactionReceipt(tx3.hash);
    console.log("Gas used (payout):", receipt3.gasUsed.toString());
  } catch (err) {
    console.error("❌ Payout failed:", err.message);
    if (err.data) {
      console.log("Revert data:", err.data);
      try {
        const decoded = pool.interface.parseError(err.data);
        if (decoded) console.log("Revert reason:", decoded.name, decoded.args);
      } catch {}
    }
    return;
  }

  console.log("\n✅ Benchmark complete.");
}

main().catch(console.error);