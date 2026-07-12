import { useState } from "react";
import { ethers } from "ethers";
import DashboardLayout from "../layouts/DashboardLayout";
import { getContracts } from "../services/blockchain";

function Faucet() {
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleMint() {
    if (!address || !amount) return alert("Fill all fields");
    setLoading(true);
    try {
      const { token } = await getContracts();
      const amountWei = ethers.parseUnits(amount, 18);
      const tx = await token.mint(address, amountWei);
      await tx.wait();
      alert(`Minted ${amount} RWFC to ${address}`);
      setAddress("");
      setAmount("");
    } catch (err) {
      console.error(err);
      alert("Mint failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Faucet – Mint RWFC</h1>
      <div className="bg-white p-8 rounded-xl shadow max-w-xl">
        <p className="text-sm text-gray-600 mb-4">
          Only the contract owner (deployer) can mint new tokens.
        </p>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Recipient Wallet Address"
            className="w-full border p-3 rounded"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount (RWFC)"
            className="w-full border p-3 rounded"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            onClick={handleMint}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg w-full disabled:opacity-50"
          >
            {loading ? "Minting..." : "Mint Tokens"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Faucet;