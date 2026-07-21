// scripts/benchmark-gas-coverage.js
const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const [deployer, investor] = await hre.ethers.getSigners();
  const registry = await ethers.getContractAt(
    "PolicyRegistry",
    process.env.POLICY_REGISTRY_ADDRESS
  );

  const coverages = [1000, 5000, 10000, 50000, 100000];
  console.log("Coverage | Premium | Gas Used");
  for (const cov of coverages) {
    const premium = cov * 0.03; // 3%
    const tx = await registry.connect(deployer).createPolicy(
      investor.address,
      ethers.parseUnits(cov.toString(), 18),
      ethers.parseUnits(premium.toString(), 18),
      150,
      "CURRENCY_DEV"
    );
    const receipt = await tx.wait();
    console.log(`${cov} | ${premium} | ${receipt.gasUsed.toString()}`);
  }
}
main().catch(console.error);