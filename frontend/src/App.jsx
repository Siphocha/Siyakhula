import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import InvestorDashboard from "./pages/InvestorDashboard";
import InvestorPolicyStatus from "./pages/InvestorPolicyStatus";
import AdminDashboard from "./pages/AdminDashboard";
import InsurerDashboard from "./pages/InsurerDashboard";
import NotFound from "./pages/NotFound";
import Faucet from "./pages/Faucet";
import PolicyHistory from "./pages/PolicyHistory";
import InvestorHistory from "./pages/InvestorHistory";
import InsurerHistory from "./pages/InsurerHistory";

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
        path="/investor/policy-status"
        element={
          <ProtectedRoute role="investor">
            <InvestorPolicyStatus />
          </ProtectedRoute>
        }
      />
      <Route
        path="/investor/history"
        element={
          <ProtectedRoute role="investor">
            <InvestorHistory />
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
        path="/admin/faucet"
        element={
          <ProtectedRoute role="admin">
            <Faucet />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/history"
        element={
          <ProtectedRoute role="admin">
            <PolicyHistory />
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
      <Route
        path="/insurer/history"
        element={
          <ProtectedRoute role="insurer">
            <InsurerHistory />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;