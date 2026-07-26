import { useState, useEffect } from "react";
import { getContracts } from "../services/blockchain";
import { formatWei } from "../utils/helpers";

function PolicyHistory() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchAllPolicies() {
    setLoading(true);
    try {
      const { registry } = await getContracts();
      const count = await registry.getPolicyCount();
      const allPolicies = [];
      for (let i = 1; i <= count; i++) {
        const policy = await registry.getPolicy(i);
        allPolicies.push(policy);
      }
      setPolicies(allPolicies);
    } catch (err) {
      console.error("Failed to fetch policies:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAllPolicies();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#060644]">Policy History</h1>
        <button
          onClick={fetchAllPolicies}
          className="bg-[#D3AF37] text-black px-4 py-2 rounded-lg hover:bg-[#c09b2e] transition font-semibold"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        {loading ? (
          <p className="text-gray-500">Loading policies...</p>
        ) : policies.length === 0 ? (
          <p className="text-gray-500">No policies have been created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#f0f0ea]">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Investor</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Coverage</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Premium</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Trigger</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Threshold</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {policies.map((policy) => (
                  <tr key={policy.id.toString()}>
                    <td className="px-4 py-2 text-sm text-gray-900">{policy.id.toString()}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 font-mono">
                      {policy.investor.slice(0,6)}...{policy.investor.slice(-4)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">{formatWei(policy.coverageAmount)} RWFC</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{formatWei(policy.premiumAmount)} RWFC</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{policy.triggerType}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{policy.triggerThresholdBps.toString()}</td>
                    <td className="px-4 py-2 text-sm">
                      {policy.paidOut ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Paid</span>
                      ) : policy.active ? (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Active</span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default PolicyHistory;