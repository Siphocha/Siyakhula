import { useState } from "react";
import { ethers } from "ethers";
import DashboardLayout from "../layouts/DashboardLayout";
import { getContracts } from "../services/blockchain";

function Faucet() {
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [mintStatus, setMintStatus] = useState(null);

  async function handleMint() {
    if (!address || !amount) return alert("Fill all fields");
    setLoading(true);
    setMintStatus(null);
    try {
      const { token } = await getContracts();
      const amountWei = ethers.parseUnits(amount, 18);
      const tx = await token.mint(address, amountWei);
      await tx.wait();

      const notification = {
        id: Date.now(),
        message: `Minted ${amount} RWFC to ${address.slice(0,6)}...${address.slice(-4)}`,
        type: "faucet",
        timestamp: new Date().toLocaleString(),
      };
      const existing = JSON.parse(localStorage.getItem("notifications") || "[]");
      localStorage.setItem("notifications", JSON.stringify([notification, ...existing]));

      setMintStatus({ success: true, msg: `Minted ${amount} RWFC to ${address}` });
      setAddress("");
      setAmount("");
    } catch (err) {
      console.error(err);
      setMintStatus({ success: false, msg: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="bg-[#f0f0ea] min-h-screen p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#060644]">Faucet Minting RWFC</h1>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg max-w-xl border border-gray-100">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Wallet Address
              </label>
              <input
                type="text"
                placeholder="e.g., 0x..."
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#D3AF37] focus:border-transparent outline-none"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (RWFC)
              </label>
              <input
                type="number"
                placeholder="e.g., 1000"
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#D3AF37] focus:border-transparent outline-none"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="any"
              />
            </div>

            <button
              onClick={handleMint}
              disabled={loading}
              className="w-full bg-[#D3AF37] text-black py-3 rounded-lg font-semibold hover:bg-[#c09b2e] transition disabled:opacity-50"
            >
              {loading ? "Minting..." : "Mint Tokens"}
            </button>

            {mintStatus && (
              <div
                className={`mt-4 p-3 rounded-lg text-sm ${
                  mintStatus.success
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {mintStatus.msg}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Faucet;