const hre = require("hardhat");

async function main() {
  const poolAddress = "0x39940a81f08843D1752A692826B4F51cb2885b28"; //your PremiumPool address
  const insurerWallet = "0x39BF8c66e6fF9Ce7BfCFBc1682D3814e02006749"; //MetaMask wallet you're using as insurer

  const pool = await hre.ethers.getContractAt("PremiumPool", poolAddress);
  const ORACLE_ROLE = await pool.ORACLE_ROLE();
  
  await pool.grantRole(ORACLE_ROLE, insurerWallet);
  console.log(`Granted ORACLE_ROLE to ${insurerWallet}`);
}

main().catch(console.error);