// scripts/benchmark-latency-histogram.js
const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const [deployer, investor] = await hre.ethers.getSigners();
  const registry = await ethers.getContractAt("PolicyRegistry", process.env.POLICY_REGISTRY_ADDRESS);

  const latencies = [];
  for (let i = 0; i < 10; i++) {
    const start = Date.now();
    const tx = await registry.connect(deployer).createPolicy(
      investor.address,
      ethers.parseUnits("5000", 18),
      ethers.parseUnits("150", 18),
      150,
      "CURRENCY_DEV"
    );
    await tx.wait();
    const end = Date.now();
    latencies.push(end - start);
  }
  console.log("Latencies (ms):", latencies);
  console.log("Average:", latencies.reduce((a,b) => a+b, 0) / latencies.length);
  console.log("Min:", Math.min(...latencies));
  console.log("Max:", Math.max(...latencies));
}
main().catch(console.error);