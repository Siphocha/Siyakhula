import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  let displayName = "User";
  if (user) {
    if (user.role === "admin") displayName = "Admin";
    else if (user.role === "insurer") displayName = "Insurer";
    else if (user.role === "investor") displayName = user.email || "Investor";
  }

  return (
    <div className="flex bg-[#f0f0ea] min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center border-b border-gray-200">
          <div className="text-sm text-gray-600">
            Logged in as: <span className="font-semibold text-[#060644]">{displayName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </header>
        <main className="p-6 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;