import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function DashboardLayout({ children }) {

    return (

        <div>

            <Navbar />

            <div className="flex">

                <Sidebar />

                <main className="flex-1 p-8 bg-slate-100 min-h-screen">

                    {children}

                </main>

            </div>

        </div>
    );
}

export default DashboardLayout;