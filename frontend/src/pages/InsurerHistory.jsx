import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getContracts } from "../services/blockchain";
import { formatWei } from "../utils/helpers";

function InsurerHistory() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const { registry } = await getContracts();
        const count = await registry.getPolicyCount();
        const all = [];
        for (let i = 1; i <= count; i++) {
          all.push(await registry.getPolicy(i));
        }
        setPolicies(all);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = policies.filter(p =>
    p.investor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toString().includes(searchTerm)
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-[#060644]">Payout History</h1>
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search by investor or policy ID..."
            className="border p-2 rounded-lg focus:ring-2 focus:ring-[#D3AF37] focus:border-transparent outline-none w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : filtered.length === 0 ? (
          <p>No policies found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#f0f0ea]">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Investor</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Coverage</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Premium</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((policy) => (
                  <tr key={policy.id.toString()}>
                    <td className="px-4 py-2 text-sm text-gray-900">{policy.id.toString()}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 font-mono">
                      {policy.investor.slice(0,6)}...{policy.investor.slice(-4)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">{formatWei(policy.coverageAmount)} RWFC</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{formatWei(policy.premiumAmount)} RWFC</td>
                    <td className="px-4 py-2 text-sm">
                      {policy.paidOut ? "Paid" : policy.active ? "Active" : "Pending"}
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

export default InsurerHistory;