const hre = require("hardhat");

async function main() {
  const registryAddress = "0x37B3b98Ce8b2760d9FA6f3493C8635B7c00fD571"; //PolicyRegistry address
  const insurerWallet = "0x39BF8c66e6fF9Ce7BfCFBc1682D3814e02006749"; //the insurers wallet

  const registry = await hre.ethers.getContractAt("PolicyRegistry", registryAddress);
  const ADMIN_ROLE = await registry.ADMIN_ROLE();

  await registry.grantRole(ADMIN_ROLE, insurerWallet);
  console.log(`Granted ADMIN_ROLE to ${insurerWallet}`);
}

main().catch(console.error);