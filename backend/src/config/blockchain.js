require("dotenv").config();
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

//Importing ABIs-eyeyeyeye
const PolicyRegistry = require("../../abi/PolicyRegistry.json");
const PremiumPool = require("../../abi/PremiumPool.json");
const TriggerOracle = require("../../abi/TriggerOracle.json");

const policyRegistry = new ethers.Contract(
  process.env.POLICY_REGISTRY_ADDRESS,
  PolicyRegistry.abi,
  wallet
);

const premiumPool = new ethers.Contract(
  process.env.PREMIUM_POOL_ADDRESS,
  PremiumPool.abi,
  wallet
);

const triggerOracle = new ethers.Contract(
  process.env.TRIGGER_ORACLE_ADDRESS,
  TriggerOracle.abi,
  wallet
);

module.exports = {
  provider,
  wallet,
  policyRegistry,
  premiumPool,
  triggerOracle,
};