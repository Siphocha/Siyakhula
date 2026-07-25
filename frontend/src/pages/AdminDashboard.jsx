import { useState, useEffect } from "react";
import { ethers } from "ethers";

import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/StatCard";
import { getContracts, getPoolStats } from "../services/blockchain";
import { formatWei, parseWei } from "../utils/helpers";

const API_BASE = import.meta.env.VITE_API_URL || "";

const POLICY_TYPES = [
  { label: "Currency Devaluation Policy (RWF to USD)", value: "CURRENCY_DEV" },
  { label: "Sector Regulatory Ban Policy", value: "REGULATORY_BAN" },
  { label: "Civil Unrest Policy", value: "CIVIL_UNREST" },
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
  const [adminBalance, setAdminBalance] = useState("0");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const addNotification = (message, type = "info") => {
    const newNotif = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleString(),
    };
    setNotifications((prev) => [newNotif, ...prev].slice(0, 50)); // keep last 50
  };

  //RWFC balance
  const fetchAdminBalance = async () => {
    try {
      const { token, signer } = await getContracts();
      const address = await signer.getAddress();
      const balance = await token.balanceOf(address);
      setAdminBalance(formatWei(balance));
    } catch (err) {
      console.error("Failed to fetch admin balance:", err);
    }
  };

  //Using alot of local storage here. Dont wanna rely on Neon for this.
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setAdminEmail(user.email || "Admin");
  }, []);

  //To make the notifications sync flawlessly.
  useEffect(() => {
  const stored = JSON.parse(localStorage.getItem("notifications") || "[]");
  setNotifications(stored);
}, []);

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

        await fetchAdminBalance();
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

  //Make sure they dont have the same policy of the same type.
  const checkDuplicatePolicy = async (investorAddress, triggerType) => {
    try {
      const { registry } = await getContracts();
      const count = await registry.getPolicyCount();
      for (let i = 1; i <= count; i++) {
        const policy = await registry.getPolicy(i);
        if (
          policy.investor.toLowerCase() === investorAddress.toLowerCase() &&
          policy.triggerType === triggerType &&
          policy.active && // only active ones matter
          !policy.paidOut
        ) {
          return true; // duplicate found
        }
      }
      return false;
    } catch (err) {
      console.error("Error checking duplicate policy:", err);
      return false;
    }
  };

  async function createPolicy() {
    setLoading(true);
    try {
      const { registry } = await getContracts();

      //Validating investor address
      if (!ethers.isAddress(form.investor)) {
        alert("Invalid investor wallet address.");
        setLoading(false);
        return;
      }

      //No duplicate policies
      const isDuplicate = await checkDuplicatePolicy(form.investor, form.triggerType);
      if (isDuplicate) {
        alert(`Investor already has an active ${form.triggerType} policy.`);
        setLoading(false);
        return;
      }

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

      //NOTIFICATIONS!!!
      addNotification(
        `Policy #${await registry.getPolicyCount()} created for ${form.investor.slice(0,6)}...${form.investor.slice(-4)} (${form.triggerType})`,
        "policy"
      );

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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const url = `${API_BASE}/api/admin/oracle/toggle`;
      const res = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ enabled: !oracleEnabled }),
        signal: controller.signal,
        credentials: "include",
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        setOracleEnabled(data.enabled);
        addNotification(`Oracle ${data.enabled ? "started" : "stopped"}`, "oracle");
        alert(`Oracle ${data.enabled ? "started" : "stopped"} successfully`);
      } else {
        const text = await res.text();
        console.error("Toggle oracle failed:", res.status, text);
        alert(`Failed to toggle oracle: ${res.status} ${text.substring(0, 200)}`);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.error(err);
      if (err.name === 'AbortError') {
        alert('Request timed out. Probably still be running. Check again.');
      } else {
        alert('Failed to toggle oracle: ' + err.message);
      }
    } finally {
      setOracleLoading(false);
    }
  }

  //Bettered the logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#060644]">Administrator Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">{adminEmail}</span>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative bg-[#060644] text-white px-4 py-2 rounded-lg hover:bg-[#1a1a5e] transition"
          >
            Notifications
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Notificationsssss!!!! */}
      {showNotifications && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-[#060644]">Notifications</h2>
          {notifications.length === 0 ? (
            <p className="text-gray-500">No notifications yet.</p>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {notifications.map((notif) => (
                <li key={notif.id} className="border-b border-gray-100 pb-2 text-sm">
                  <span className="text-gray-800">{notif.message}</span>
                  <span className="text-gray-400 text-xs ml-4">{notif.timestamp}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-5 gap-6 mb-8">
        <StatCard title="Total Policies" value={poolStats.totalPolicies} />
        <StatCard title="Pool Liquidity" value={`${poolStats.liquidity} RWFC`} />
        <StatCard title="Total Premiums" value={`${poolStats.totalPremiums} RWFC`} />
        <StatCard title="Total Payouts" value={`${poolStats.totalPayouts} RWFC`} />
        <StatCard
          title="Your RWFC Balance"
          value={`${adminBalance} RWFC`}
          className="border-2 border-yellow-400"
        />
      </div>

      {/* Admin Balance Bar (animated liquidity indicator) */}
      <div className="bg-white p-4 rounded-xl shadow mb-8">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-[#060644]">Your RWFC Balance</span>
          <span className="text-gray-600">{adminBalance} RWFC</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(parseFloat(adminBalance) / 1000000 * 100, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-400 mt-1">Relative to 1,000,000 RWFC (demo scale)</p>
      </div>

      {/* Oracle Control */}
      <div className="bg-white p-8 rounded-xl shadow mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#060644]">Oracle Control</h2>
          <button
            onClick={toggleOracle}
            disabled={oracleLoading}
            className={`px-6 py-3 rounded-lg font-semibold text-white ${
              oracleEnabled
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            } disabled:opacity-50 transition`}
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

      {/* Create Policy Form */}
      <div className="bg-white p-8 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-6 text-[#060644]">Create New Policy</h2>

        <div className="space-y-4">
          <input
            name="investor"
            placeholder="Investor Wallet Address"
            className="w-full border p-3 rounded focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
            onChange={handleChange}
            value={form.investor}
          />
          <input
            name="coverageAmount"
            placeholder="Coverage Amount (RWFC)"
            className="w-full border p-3 rounded focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
            onChange={handleChange}
            value={form.coverageAmount}
          />
          <input
            name="premiumAmount"
            placeholder="Premium Amount (RWFC)"
            className="w-full border p-3 rounded focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
            onChange={handleChange}
            value={form.premiumAmount}
          />
          <input
            name="triggerThresholdBps"
            placeholder={
              form.triggerType === "CURRENCY_DEV"
                ? "Trigger Threshold (basis points)"
                : form.triggerType === "REGULATORY_BAN"
                ? "1 = Enabled, 0 = Disabled"
                : "Unrest Index Threshold (e.g., 55)"
            }
            className="w-full border p-3 rounded focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
            onChange={handleChange}
            value={form.triggerThresholdBps}
          />

          <select
            name="triggerType"
            className="w-full border p-3 rounded bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
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
            className="bg-[#060644] text-white px-6 py-3 rounded-lg w-full hover:bg-[#1a1a5e] transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Policy"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;