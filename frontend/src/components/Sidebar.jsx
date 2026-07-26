import {
    LayoutDashboard,
    Shield,
    Building2,
    Coins,
    History,
    Store
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
    const { user } = useAuth();

    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
            isActive ? "bg-[#D3AF37] text-black" : "text-gray-300 hover:bg-slate-800 hover:text-white"
        }`;

    return (
        <aside className="w-64 bg-[#060644] text-white min-h-screen p-6">
            <h2 className="text-xl font-bold mb-10 text-[#D3AF37]">Dashboard</h2>

            <nav className="space-y-2">
                {user?.role === "admin" && (
                    <>
                        <NavLink to="/admin" className={linkClass} end>
                            <LayoutDashboard size={20} />
                            <span>Platform Controls</span>
                        </NavLink>
                        <NavLink to="/admin/faucet" className={linkClass}>
                            <Coins size={20} />
                            <span>Faucet</span>
                        </NavLink>
                        <NavLink to="/admin/history" className={linkClass}>
                            <History size={20} />
                            <span>Policy History</span>
                        </NavLink>
                    </>
                )}

                {user?.role === "investor" && (
                    <>
                        <NavLink to="/investor" className={linkClass} end>
                            <Shield size={20} />
                            <span>Policies</span>
                        </NavLink>
                        <NavLink to="/investor/history" className={linkClass}>
                            <History size={20} />
                            <span>History</span>
                        </NavLink>
                    </>
                )}

                {user?.role === "insurer" && (
                    <>
                        <NavLink to="/insurer" className={linkClass} end>
                            <Shield size={20} />
                            <span>Manage Policies</span>
                        </NavLink>
                        <NavLink to="/insurer/marketplace" className={linkClass}>
                            <Store size={20} />
                            <span>Marketplace</span>
                        </NavLink>
                        <NavLink to="/insurer/history" className={linkClass}>
                            <History size={20} />
                            <span>Payout History</span>
                        </NavLink>
                    </>
                )}
            </nav>
        </aside>
    );
}

export default Sidebar;