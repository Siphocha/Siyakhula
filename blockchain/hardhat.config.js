require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const PRIVATE_KEYS = [
  process.env.PRIVATE_KEY,
  process.env.PRIVATE_KEY_INVESTOR1,
  process.env.PRIVATE_KEY_INSURER,
  process.env.PRIVATE_KEY_INVESTOR2,
  process.env.PRIVATE_KEY_INVESTOR3,
].filter(key => key !== undefined && key !== "");

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: PRIVATE_KEYS,
      chainId: 11155111,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};