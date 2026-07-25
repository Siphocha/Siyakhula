import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

function DashboardLayout({ children }) {
  const { user } = useAuth();

  return (
    <div className="flex bg-[#f0f0ea] min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;