import { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";

import DashboardLayout from "../layouts/DashboardLayout";
import WalletConnect from "../components/WalletConnect";
import StatCard from "../components/StatCard";
import { getContracts } from "../services/blockchain";
import { formatWei } from "../utils/helpers";

function InvestorDashboard() {
  const [walletAddress, setWalletAddress] = useState("");
  const [policies, setPolicies] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rwfcBalance, setRwfcBalance] = useState("0");

  const hasFetched = useRef(false);

  const loadPolicies = useCallback(async (force = false) => {
    if (loading && !force) return;

    setLoading(true);

    try {
      const { signer, registry, token } = await getContracts();
      const address = await signer.getAddress();

      setWalletAddress(address);
      setIsConnected(true);

      // Fetch RWFC balance
      const balance = await token.balanceOf(address);
      setRwfcBalance(formatWei(balance));

      // Fetch policies
      const count = await registry.getPolicyCount();
      let myPolicies = [];

      for (let i = 1; i <= Number(count); i++) {
        try {
          const policy = await registry.getPolicy(i);
          if (policy.investor.toLowerCase() === address.toLowerCase()) {
            myPolicies.push(policy);
          }
        } catch {
          continue;
        }
      }

      setPolicies(myPolicies);
      hasFetched.current = true;
    } catch (err) {
      console.warn(err);
      setWalletAddress("");
      setPolicies([]);
      setIsConnected(false);
      setRwfcBalance("0");
      hasFetched.current = false;
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    if (!hasFetched.current) {
      loadPolicies();
    }
  }, [loadPolicies]);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = () => {
      hasFetched.current = false;
      loadPolicies(true);
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [loadPolicies]);

  async function purchasePolicy(id) {
    try {
      const { registry, token } = await getContracts();

      const policy = await registry.getPolicy(id);
      const premiumAmount = policy.premiumAmount;

      const approveTx = await token.approve(registry.target, premiumAmount);
      await approveTx.wait();

      const tx = await registry.purchasePolicy(id);
      await tx.wait();

      alert("Policy purchased successfully!");
      await loadPolicies(true);
    } catch (err) {
      console.error(err);
      alert("Purchase failed: " + (err.message || "Unknown error"));
    }
  }

  const activePolicies = policies.filter((p) => p.active && !p.paidOut).length;

  const activeOnly = policies.filter((p) => p.active);
  const totalCoverage = activeOnly.reduce((sum, p) => sum + BigInt(p.coverageAmount), 0n);
  const totalPremiums = activeOnly.reduce((sum, p) => sum + BigInt(p.premiumAmount), 0n);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-8">Investor Dashboard</h1>

      {!isConnected ? (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6 mb-8">
          <p className="mb-4">Connect your MetaMask wallet to continue.</p>
          <WalletConnect />
        </div>
      ) : (
        <>
          <div className="mb-6">
            <p className="text-sm text-gray-500">Connected Wallet</p>
            <p className="font-mono break-all">{walletAddress}</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <StatCard title="Active Policies" value={activePolicies} />
            <StatCard title="Coverage" value={`${formatWei(totalCoverage)} RWFC`} />
            <StatCard title="Premiums" value={`${formatWei(totalPremiums)} RWFC`} />
            <StatCard title="RWFC Balance" value={`${rwfcBalance} RWFC`} />
          </div>

          <WalletConnect />

          <div className="flex justify-between items-center mt-8 mb-4">
            <h2 className="text-2xl font-bold">My Policies</h2>
            <button
              onClick={() => loadPolicies(true)}
              className="bg-slate-900 text-white px-4 py-2 rounded"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow p-6">Loading policies...</div>
          ) : policies.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-6">
              No policies assigned to this wallet.
            </div>
          ) : (
            policies.map((policy) => {
              let status = "Pending";
              let colour = "bg-yellow-500";

              if (policy.active) {
                status = "Active";
                colour = "bg-green-600";
              }

              if (policy.paidOut) {
                status = "Paid Out";
                colour = "bg-blue-600";
              }

              return (
                <div
                  key={policy.id.toString()}
                  className="bg-white rounded-xl shadow p-6 mb-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">
                      Policy #{policy.id.toString()}
                    </h3>
                    <span
                      className={`${colour} text-white px-3 py-1 rounded-full text-sm`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <p>
                      <strong>Coverage:</strong> {formatWei(policy.coverageAmount)} RWFC
                    </p>
                    <p>
                      <strong>Premium:</strong> {formatWei(policy.premiumAmount)} RWFC
                    </p>
                    <p>
                      <strong>Trigger:</strong> {policy.triggerType}
                    </p>
                    <p>
                      <strong>Threshold:</strong> {policy.triggerThresholdBps.toString()} bps
                    </p>
                  </div>

                  {!policy.active && (
                    <button
                      onClick={() => purchasePolicy(policy.id)}
                      className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
                    >
                      Purchase Policy
                    </button>
                  )}
                </div>
              );
            })
          )}
        </>
      )}
    </DashboardLayout>
  );
}

export default InvestorDashboard;