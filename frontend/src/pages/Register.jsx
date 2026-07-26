import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import registerBg from "../assets/Register.png";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    walletAddress: "",
    role: "investor",
  });

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/auth/signup", form);
      alert("Registration successful");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div
      className="min-h-screen flex justify-center items-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${registerBg})` }}
    >
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative z-10 bg-white p-8 rounded-xl shadow-xl w-[450px]">
        <h1 className="text-3xl font-bold mb-6 text-[#060644]">Create Account</h1>

        <form onSubmit={submit} className="space-y-4">
          <input
            name="email"
            placeholder="Email"
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#D3AF37] focus:border-transparent outline-none"
            onChange={change}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#D3AF37] focus:border-transparent outline-none"
            onChange={change}
          />
          <input
            name="walletAddress"
            placeholder="Wallet Address"
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#D3AF37] focus:border-transparent outline-none"
            onChange={change}
          />
          <select
            name="role"
            className="w-full border p-3 rounded-lg bg-white focus:ring-2 focus:ring-[#D3AF37] focus:border-transparent outline-none"
            onChange={change}
          >
            <option value="investor">Investor</option>
          </select>

          <button className="w-full bg-[#060644] text-white p-3 rounded-lg hover:bg-[#1a1a5e] transition font-semibold">
            Register
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/" className="text-[#D3AF37] hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;