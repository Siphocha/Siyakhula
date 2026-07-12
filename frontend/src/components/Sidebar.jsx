import {
    LayoutDashboard,
    Shield,
    Building2,
    TrendingUp,
    Coins
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
    const { user } = useAuth();

    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
            isActive ? "bg-slate-700 text-white" : "text-gray-300 hover:bg-slate-800 hover:text-white"
        }`;

    return (
        <aside className="w-64 bg-slate-900 text-white min-h-screen p-6">
            <h2 className="text-xl font-bold mb-10">Dashboard</h2>

            <nav className="space-y-2">
                {/* Overview – always visible (or role-based) */}
                <NavLink to="/" className={linkClass}>
                    <LayoutDashboard size={20} />
                    <span>Overview</span>
                </NavLink>

                {user?.role === "investor" && (
                    <>
                        <NavLink to="/investor/policies" className={linkClass}>
                            <Shield size={20} />
                            <span>Policies</span>
                        </NavLink>
                        <NavLink to="/investor/investments" className={linkClass}>
                            <TrendingUp size={20} />
                            <span>Investments</span>
                        </NavLink>
                    </>
                )}

                {user?.role === "insurer" && (
                    <NavLink to="/insurer/policies" className={linkClass}>
                        <Shield size={20} />
                        <span>Manage Policies</span>
                    </NavLink>
                )}

                {user?.role === "admin" && (
                    <>
                        <NavLink to="/admin" className={linkClass} end>
                            <Building2 size={20} />
                            <span>Platform Controls</span>
                        </NavLink>
                        <NavLink to="/admin/faucet" className={linkClass}>
                            <Coins size={20} />
                            <span>Faucet</span>
                        </NavLink>
                    </>
                )}
            </nav>
        </aside>
    );
}

export default Sidebar;