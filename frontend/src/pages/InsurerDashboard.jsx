import { useState, useEffect, useCallback, useRef } from "react";

import DashboardLayout from "../layouts/DashboardLayout";
import WalletConnect from "../components/WalletConnect";
import StatCard from "../components/StatCard";
import { getContracts } from "../services/blockchain";
import { formatWei } from "../utils/helpers";

function InsurerDashboard() {
  const [walletAddress, setWalletAddress] = useState("");
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [processing, setProcessing] = useState(null);

  const hasFetched = useRef(false);

  const loadPolicies = useCallback(async (force = false) => {
    if (loading && !force) return;
    setLoading(true);
    try {
      const { signer, registry } = await getContracts();
      const address = await signer.getAddress();
      setWalletAddress(address);
      setIsConnected(true);

      const count = await registry.getPolicyCount();
      let allPolicies = [];
      for (let i = 1; i <= Number(count); i++) {
        try {
          const policy = await registry.getPolicy(i);
          allPolicies.push(policy);
        } catch {
          continue;
        }
      }
      setPolicies(allPolicies);
      hasFetched.current = true;
    } catch (err) {
      console.log(err);
      setWalletAddress("");
      setPolicies([]);
      setIsConnected(false);
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

  const activePolicies = policies.filter(p => p.active && !p.paidOut).length;
  const paidOutPolicies = policies.filter(p => p.paidOut).length;

  const paidOutOnly = policies.filter(p => p.paidOut);
  const totalCoverageIssued = paidOutOnly.reduce((sum, p) => sum + BigInt(p.coverageAmount), 0n);

  async function triggerPayout(policyId) {
    setProcessing(policyId);
    try {
      const { registry, pool } = await getContracts();
      const policy = await registry.getPolicy(policyId);
      if (!policy.active) {
        alert("Policy is not active.");
        return;
      }
      if (policy.paidOut) {
        alert("Policy already paid out.");
        return;
      }

      const txPayout = await pool.executePayout(
        policy.investor,
        policy.coverageAmount,
        policyId,
        policy.triggerType
      );
      await txPayout.wait();

      const txMark = await registry.markPaidOut(policyId);
      await txMark.wait();

      alert(`Payout of ${formatWei(policy.coverageAmount)} RWFC executed successfully!`);
      hasFetched.current = false;
      await loadPolicies(true);
    } catch (err) {
      console.error(err);
      alert("Payout failed: " + (err.message || "Unknown error"));
    } finally {
      setProcessing(null);
    }
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-8">Insurer Dashboard</h1>

      {!isConnected ? (
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg mb-6">
          <p className="mb-4">Please connect your insurer wallet.</p>
          <WalletConnect />
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Total Policies" value={policies.length} />
            <StatCard title="Active Policies" value={activePolicies} />
            <StatCard title="Coverage Issued" value={`${formatWei(totalCoverageIssued)} RWFC`} />
          </div>

          <WalletConnect />

          <div className="bg-white mt-8 p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-6">Issued Policies</h2>

            {loading ? (
              <p>Loading...</p>
            ) : policies.length === 0 ? (
              <p>No policies found.</p>
            ) : (
              policies.map((policy) => (
                <div key={policy.id.toString()} className="border rounded-lg p-5 mb-5">
                  <div className="space-y-2">
                    <p><strong>ID:</strong> {policy.id.toString()}</p>
                    <p><strong>Investor:</strong> {policy.investor}</p>
                    <p><strong>Coverage:</strong> {formatWei(policy.coverageAmount)} RWFC</p>
                    <p><strong>Premium:</strong> {formatWei(policy.premiumAmount)} RWFC</p>
                    <p><strong>Trigger:</strong> {policy.triggerType}</p>
                    <p><strong>Threshold:</strong> {policy.triggerThresholdBps.toString()}</p>
                    <p><strong>Active:</strong> {policy.active ? "Yes" : "No"}</p>
                    <p><strong>Paid Out:</strong> {policy.paidOut ? "Yes" : "No"}</p>
                  </div>

                  {policy.active && !policy.paidOut && (
                    <button
                      onClick={() => triggerPayout(policy.id)}
                      disabled={processing === Number(policy.id)}
                      className="mt-4 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg disabled:opacity-50"
                    >
                      {processing === Number(policy.id) ? "Processing..." : "Pay Out Coverage"}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="mt-8 bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Portfolio Summary</h2>
            <div className="space-y-2">
              <p><strong>Total Policies:</strong> {policies.length}</p>
              <p><strong>Active:</strong> {activePolicies}</p>
              <p><strong>Paid Out:</strong> {paidOutPolicies}</p>
              <p><strong>Total Coverage Issued:</strong> {formatWei(totalCoverageIssued)} RWFC</p>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default InsurerDashboard;