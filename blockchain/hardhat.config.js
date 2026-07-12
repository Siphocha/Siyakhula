require("dotenv").config();
//Remove the two old @nomiclabs lines and use this single one:
require("@nomicfoundation/hardhat-toolbox"); 

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
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: [
        process.env.PRIVATE_KEY,          
        process.env.PRIVATE_KEY_INSURER,    
        process.env.PRIVATE_KEY_INVESTOR1,  
        process.env.PRIVATE_KEY_INVESTOR2,  
        process.env.PRIVATE_KEY_INVESTOR3   
      ].filter(Boolean),
      chainId: 11155111,
    },
  },
};