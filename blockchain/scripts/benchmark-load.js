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

  const coverage = ethers.parseUnits("50000", 18);
  const premium = ethers.parseUnits("500", 18);
  const threshold = 500;

  // Get a reasonable gas price from the network
  const feeData = await ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice;

  console.log("Approving registry to spend 10,000 RWFC...");
  await token.connect(investor).approve(registry.target, ethers.parseUnits("10000", 18));
  console.log("Approval done.\n");

  console.log("📈 Pool Liquidity Growth (10 sequential purchases)\n");
  console.log("Purchase # | Policy ID | Pool Balance (RWFC) | Cumulative Premiums");

  let cumulative = 0n;
  for (let i = 1; i <= 10; i++) {
    // Create policy (deployer)
    const tx1 = await registry.connect(deployer).createPolicy(
      investor.address,
      coverage,
      premium,
      threshold,
      "CURRENCY_DEV",
      { gasPrice: gasPrice }
    );
    const receipt1 = await tx1.wait();

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
    const policyId = event ? Number(event.args.policyId) : null;
    if (!policyId) {
      console.error("Failed to get policy ID, aborting.");
      break;
    }

    // Purchase (investor) – use same gas price
    const tx2 = await registry.connect(investor).purchasePolicy(policyId, { gasPrice: gasPrice });
    await tx2.wait();

    cumulative += premium;
    const bal = await token.balanceOf(pool.target);
    console.log(
      `  ${i}       | ${policyId}        | ${ethers.formatUnits(bal, 18)}  | ${ethers.formatUnits(cumulative, 18)}`
    );

    // ✅ Add small delay to avoid nonce collisions
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  console.log("\n✅ Load test complete.");
}

main().catch(console.error);