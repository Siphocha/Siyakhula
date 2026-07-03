import { ethers } from "ethers";

import PolicyRegistry from "../contracts/PolicyRegistry.json";
import PremiumPool from "../contracts/PremiumPool.json";
import TriggerOracle from "../contracts/TriggerOracle.json";
import MockRWFC from "../contracts/MockRWFC.json";

export async function getContracts() {
    if (!window.ethereum) {
        throw new Error("Install MetaMask");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Instantiate registry, pool, oracle using env addresses
    const registry = new ethers.Contract(
        import.meta.env.VITE_POLICY_REGISTRY,
        PolicyRegistry.abi,
        signer
    );

    const pool = new ethers.Contract(
        import.meta.env.VITE_PREMIUM_POOL,
        PremiumPool.abi,
        signer
    );

    const oracle = new ethers.Contract(
        import.meta.env.VITE_TRIGGER_ORACLE,
        TriggerOracle.abi,
        signer
    );

    // IMPORTANT: Get the stablecoin address directly from the registry
    // This ensures we use the exact token the contracts use, avoiding mismatches.
    const stablecoinAddress = await registry.stablecoin();
    const token = new ethers.Contract(
        stablecoinAddress,
        MockRWFC.abi,
        signer
    );

    return {
        provider,
        signer,
        registry,
        pool,
        oracle,
        token,
    };
}

export async function getPoolStats() {
    const { pool, token } = await getContracts();
    const liquidity = await token.balanceOf(pool.target);
    const totalPremiums = await pool.totalPremiums();
    const totalPayouts = await pool.totalPayouts();
    return { liquidity, totalPremiums, totalPayouts };
}