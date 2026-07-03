require("dotenv").config();

const { ethers } = require("ethers");

//need this for connections..absolutely.
const provider =
    new ethers.JsonRpcProvider(
        process.env.RPC_URL
    );

const wallet = new ethers.Wallet(
    process.env.PRIVATE_KEY,
    provider
);

//Policy Reigstry is the key for all connections. It is the key contract needed.
const PolicyRegistry =
    require("../../abi/PolicyRegistry.json");

const policyRegistry =
    new ethers.Contract(
        process.env.POLICY_REGISTRY_ADDRESS,
        PolicyRegistry.abi,
        wallet
    );

module.exports = {
    provider,
    wallet,
    policyRegistry
};