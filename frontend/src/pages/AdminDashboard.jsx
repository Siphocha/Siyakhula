import { useState, useEffect } from "react";
import { ethers } from "ethers";

import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/StatCard";
import { getContracts, getPoolStats } from "../services/blockchain";
import { formatWei, parseWei } from "../utils/helpers";

const API_BASE = import.meta.env.VITE_API_URL || "";

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

  const [poolStats, setPoolStats] = useState({
    liquidity: "0",
    totalPremiums: "0",
    totalPayouts: "0",
    totalPolicies: "0",
  });

  const [loading, setLoading] = useState(false);
  const [oracleEnabled, setOracleEnabled] = useState(false);
  const [oracleLoading, setOracleLoading] = useState(false);
  const [oracleStatusError, setOracleStatusError] = useState(null);

  // Helper to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  useEffect(() => {
    async function fetchStats() {
      try {
        const stats = await getPoolStats();
        setPoolStats({
          liquidity: formatWei(stats.liquidity),
          totalPremiums: formatWei(stats.totalPremiums),
          totalPayouts: formatWei(stats.totalPayouts),
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

  useEffect(() => {
    async function fetchOracleStatus() {
      try {
        const url = `${API_BASE}/api/admin/oracle/status`;
        const res = await fetch(url, {
          credentials: "include",
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          setOracleEnabled(data.enabled);
          setOracleStatusError(null);
        } else {
          const text = await res.text();
          console.error("Oracle status fetch failed:", res.status, text);
          setOracleStatusError(`Status ${res.status}: ${text.substring(0, 100)}`);
        }
      } catch (err) {
        console.error("Failed to fetch oracle status:", err);
        setOracleStatusError(err.message);
      }
    }
    fetchOracleStatus();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function createPolicy() {
    setLoading(true);
    try {
      const { registry } = await getContracts();

      const coverageWei = parseWei(form.coverageAmount);
      const premiumWei = parseWei(form.premiumAmount);

      const tx = await registry.createPolicy(
        form.investor,
        coverageWei,
        premiumWei,
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

  async function toggleOracle() {
    setOracleLoading(true);
    try {
      const url = `${API_BASE}/api/admin/oracle/toggle`;
      const res = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ enabled: !oracleEnabled }),
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setOracleEnabled(data.enabled);
        alert(`Oracle ${data.enabled ? "started" : "stopped"} successfully`);
      } else {
        const text = await res.text();
        console.error("Toggle oracle failed:", res.status, text);
        alert(`Failed to toggle oracle: ${res.status} ${text.substring(0, 200)}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to toggle oracle: " + err.message);
    } finally {
      setOracleLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-8">Administrator Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Policies" value={poolStats.totalPolicies} />
        <StatCard title="Pool Liquidity" value={`${poolStats.liquidity} RWFC`} />
        <StatCard title="Total Premiums" value={`${poolStats.totalPremiums} RWFC`} />
        <StatCard title="Total Payouts" value={`${poolStats.totalPayouts} RWFC`} />
      </div>

      <div className="bg-white p-8 rounded-xl shadow mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Oracle Control</h2>
          <button
            onClick={toggleOracle}
            disabled={oracleLoading}
            className={`px-6 py-3 rounded-lg font-semibold text-white ${
              oracleEnabled
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            } disabled:opacity-50`}
          >
            {oracleLoading
              ? "Processing..."
              : oracleEnabled
              ? "Stop Oracle"
              : "Start Oracle"}
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Status:{" "}
          <span className={oracleEnabled ? "text-green-600" : "text-red-600"}>
            {oracleEnabled ? "Running" : "Stopped"}
          </span>
          {oracleStatusError && (
            <span className="text-xs text-red-500 ml-2">
              (Error: {oracleStatusError})
            </span>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          The oracle automatically checks trigger conditions every 5 minutes and executes payouts when thresholds are exceeded.
        </p>
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