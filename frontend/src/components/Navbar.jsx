import { ShieldCheck, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Navbar() {

    const { user, logout } = useAuth();

    return (
        <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">

            <div className="flex items-center gap-3">

                <ShieldCheck
                    className="text-yellow-500"
                    size={34}
                />

                <div>

                    <h1 className="font-bold text-2xl">
                        Siyakhula
                    </h1>

                    <p className="text-sm text-slate-500">
                        Blockchain Insurance Platform
                    </p>

                </div>

            </div>

            <div className="flex items-center gap-6">

                <div className="text-right">

                    <p className="font-semibold">
                        {user?.email}
                    </p>

                    <p className="text-sm text-slate-500 capitalize">
                        {user?.role}
                    </p>

                </div>

                <button
                    onClick={logout}
                    className="text-red-500 hover:text-red-700"
                >
                    <LogOut />
                </button>

            </div>

        </nav>
    );
}

export default Navbar;