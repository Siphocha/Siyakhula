import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getContracts } from "../services/blockchain";
import { formatWei } from "../utils/helpers";

function InvestorHistory() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { registry, signer } = await getContracts();
        const address = await signer.getAddress();
        const count = await registry.getPolicyCount();
        const myPolicies = [];
        for (let i = 1; i <= count; i++) {
          const policy = await registry.getPolicy(i);
          if (policy.investor.toLowerCase() === address.toLowerCase()) {
            myPolicies.push(policy);
          }
        }
        setPolicies(myPolicies);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-[#060644]">My Policy History</h1>
      <div className="bg-white p-6 rounded-xl shadow">
        {loading ? (
          <p>Loading...</p>
        ) : policies.length === 0 ? (
          <p>No policies found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#f0f0ea]">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Coverage</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Premium</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Trigger</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr key={policy.id.toString()}>
                    <td className="px-4 py-2 text-sm text-gray-900">{policy.id.toString()}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{formatWei(policy.coverageAmount)} RWFC</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{formatWei(policy.premiumAmount)} RWFC</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{policy.triggerType}</td>
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

export default InvestorHistory;