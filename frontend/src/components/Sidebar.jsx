import {
    LayoutDashboard,
    Shield,
    Building2,
    TrendingUp
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Sidebar() {

    const { user } = useAuth();

    return (

        <aside className="w-64 bg-slate-900 text-white min-h-screen p-6">

            <h2 className="text-xl font-bold mb-10">
                Dashboard
            </h2>

            <div className="space-y-4">

                <div className="flex items-center gap-3">
                    <LayoutDashboard />
                    Overview
                </div>

                {user?.role === "investor" && (

                    <>
                        <div className="flex gap-3">
                            <Shield />
                            Policies
                        </div>

                        <div className="flex gap-3">
                            <TrendingUp />
                            Investments
                        </div>
                    </>
                )}

                {user?.role === "insurer" && (

                    <div className="flex gap-3">
                        <Shield />
                        Manage Policies
                    </div>

                )}

                {user?.role === "admin" && (

                    <div className="flex gap-3">
                        <Building2 />
                        Platform Controls
                    </div>

                )}

            </div>

        </aside>

    );
}

export default Sidebar;