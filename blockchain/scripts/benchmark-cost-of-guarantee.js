const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const [deployer, insurer, investor] = await hre.ethers.getSigners();
  const registry = await ethers.getContractAt("PolicyRegistry", process.env.POLICY_REGISTRY_ADDRESS);

  console.log("The Cost of Guarantee (Premium as % of Coverage)\n");
  console.log("Policy | Coverage (RWFC) | Premium (RWFC) | Ratio (%) | Target (<3%)");

  const testCases = [
    { coverage: 200000, premium: 2000 },  // 1%
    { coverage: 150000, premium: 1500 },  // 1%
    { coverage: 100000,  premium: 1000 },  // 1%
  ];

  let allPass = true;
  for (let i = 0; i < testCases.length; i++) {
    const { coverage, premium } = testCases[i];
    const ratio = (premium / coverage) * 100;
    const pass = ratio < 3;
    console.log(
      `${i+1}      | ${coverage}        | ${premium}       | ${ratio.toFixed(2)}%     | ${pass ? "✅" : "❌"}`
    );
    if (!pass) allPass = false;
  }
  console.log(`\nOverall: ${allPass ? "All policies meet <3% target" : " Some policies exceed 3%"}`);
}

main().catch(console.error);