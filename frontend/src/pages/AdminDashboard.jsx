import { useState, useEffect } from "react";
import { ethers } from "ethers";

import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/StatCard";
import { getContracts, getPoolStats } from "../services/blockchain";

//Have to be selective with these jsx comments. Anyways policy options are stated below.
const POLICY_TYPES = [
  { label: "Currency Devaluation Cover (RWF/USD)", value: "CURRENCY_DEV" },
  { label: "Sectoral Regulatory Ban Insurance", value: "REGULATORY_BAN" },
  { label: "Civil Unrest & Political Violence Cover", value: "CIVIL_UNREST" },
];

function AdminDashboard() {
  const [form, setForm] = useState({ 
    investor: "",
    coverageAmount: "",
    premiumAmount: "",
    triggerThresholdBps: "",
    triggerType: POLICY_TYPES[0].value,
  });

  //core stats...for now
  const [poolStats, setPoolStats] = useState({
    liquidity: "0",
    totalPremiums: "0",
    totalPayouts: "0",
    totalPolicies: "0",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const stats = await getPoolStats();
        setPoolStats({
          liquidity: ethers.formatUnits(stats.liquidity, 18),
          totalPremiums: ethers.formatUnits(stats.totalPremiums, 18),
          totalPayouts: ethers.formatUnits(stats.totalPayouts, 18),
          totalPolicies: "0",
        });

        const { registry } = await getContracts();
        const count = await registry.getPolicyCount();
        setPoolStats((prev) => ({
          ...prev,
          totalPolicies: count.toString(),
        }));
      } catch (err) {
        console.error("Failed to load admin stats", err);
      }
    }
    fetchStats();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  //do not make this synchronous! Otherwise it'll be a one time done deal
  async function createPolicy() {
    setLoading(true);
    try {
      const { registry } = await getContracts();
      const tx = await registry.createPolicy(
        form.investor,
        form.coverageAmount,
        form.premiumAmount,
        form.triggerThresholdBps,
        form.triggerType
      );
      await tx.wait();
      alert("Policy created successfully");
      const { registry: reg } = await getContracts();
      const count = await reg.getPolicyCount();
      setPoolStats((prev) => ({
        ...prev,
        totalPolicies: count.toString(),
      }));
    } catch (err) {
      console.error(err);
      alert("Policy creation failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-8">Administrator Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Policies" value={poolStats.totalPolicies} />
        <StatCard
          title="Pool Liquidity"
          value={`${poolStats.liquidity} RWFC`}
        />
        <StatCard
          title="Total Premiums"
          value={`${poolStats.totalPremiums} RWFC`}
        />
      </div>

      <div className="bg-white p-8 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-6">Create New Policy</h2>

        <div className="space-y-4">
          <input
            name="investor"
            placeholder="Investor Wallet Address"
            className="w-full border p-3 rounded"
            onChange={handleChange}
            value={form.investor}
          />
          <input
            name="coverageAmount"
            placeholder="Coverage Amount (RWFC)"
            className="w-full border p-3 rounded"
            onChange={handleChange}
            value={form.coverageAmount}
          />
          <input
            name="premiumAmount"
            placeholder="Premium Amount (RWFC)"
            className="w-full border p-3 rounded"
            onChange={handleChange}
            value={form.premiumAmount}
          />
          <input
            name="triggerThresholdBps"
            placeholder="Trigger Threshold (basis points)"
            className="w-full border p-3 rounded"
            onChange={handleChange}
            value={form.triggerThresholdBps}
          />

          <select
            name="triggerType"
            className="w-full border p-3 rounded bg-white"
            onChange={handleChange}
            value={form.triggerType}
          >
            {POLICY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <button
            onClick={createPolicy}
            disabled={loading}
            className="bg-slate-900 text-white px-6 py-3 rounded-lg w-full disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Policy"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;