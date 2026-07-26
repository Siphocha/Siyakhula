import { useState, useEffect } from "react";
import { getContracts } from "../services/blockchain";
import { formatWei } from "../utils/helpers";

function InvestorPolicyStatus() {
  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);
  const [paidOut, setPaidOut] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { registry, signer } = await getContracts();
        const address = await signer.getAddress();
        const count = await registry.getPolicyCount();

        const pend = [];
        const act = [];
        const paid = [];

        for (let i = 1; i <= count; i++) {
          const policy = await registry.getPolicy(i);
          if (policy.investor.toLowerCase() !== address.toLowerCase()) continue;

          if (policy.paidOut) {
            paid.push(policy);
          } else if (policy.active) {
            act.push(policy);
          } else {
            pend.push(policy);
          }
        }

        setPending(pend);
        setActive(act);
        setPaidOut(paid);
      } catch (err) {
        console.error("Failed to fetch policies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  const renderColumn = (title, policies, emptyMsg) => (
    <div className="bg-white p-4 rounded-xl shadow flex-1 min-h-[200px]">
      <h3 className="text-lg font-bold text-[#060644] mb-4">{title}</h3>
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : policies.length === 0 ? (
        <p className="text-gray-400">{emptyMsg}</p>
      ) : (
        policies.map((policy) => (
          <div key={policy.id.toString()} className="border-b border-gray-100 py-2">
            <p className="text-sm font-medium text-[#060644]">Policy #{policy.id.toString()}</p>
            <p className="text-xs text-gray-500">Coverage: {formatWei(policy.coverageAmount)} RWFC</p>
            <p className="text-xs text-gray-500">Trigger: {policy.triggerType}</p>
          </div>
        ))
      )}
    </div>
  );

  return (
    <>
      <h1 className="text-3xl font-bold mb-6 text-[#060644]">Your Policy Status</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {renderColumn("Pending", pending, "No pending policies.")}
        {renderColumn("Active", active, "No active policies.")}
        {renderColumn("Paid Out", paidOut, "No paid‑out policies.")}
      </div>
    </>
  );
}

export default InvestorPolicyStatus;