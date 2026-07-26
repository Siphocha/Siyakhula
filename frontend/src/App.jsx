import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import InvestorDashboard from "./pages/InvestorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import InsurerDashboard from "./pages/InsurerDashboard";
import NotFound from "./pages/NotFound";
import Faucet from "./pages/Faucet";
import PolicyHistory from "./pages/PolicyHistory";
import InvestorHistory from "./pages/InvestorHistory";
import InsurerHistory from "./pages/InsurerHistory";
import Marketplace from "./pages/Marketplace";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {

    return (
        <Routes>

            <Route path="/" element={<Login />} />

            <Route path="/register" element={<Register />} />

            <Route
                path="/investor"
                element={
                    <ProtectedRoute role="investor">
                        <InvestorDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin"
                element={
                    <ProtectedRoute role="admin">
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/insurer"
                element={
                    <ProtectedRoute role="insurer">
                        <InsurerDashboard />
                    </ProtectedRoute>
                }
            />

            <Route path="/admin/faucet" element={<Faucet />} />
            <Route path="/admin/history" element={<PolicyHistory />} />
            <Route path="/investor/history" element={<InvestorHistory />} />
            <Route path="/insurer/history" element={<InsurerHistory />} />
            <Route path="/insurer/marketplace" element={<Marketplace />} />
            <Route path="*" element={<NotFound />} />

        </Routes>
    );
}

export default App;