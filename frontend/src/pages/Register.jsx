import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";

function Register() {

    const navigate = useNavigate();

    const [form, setForm] = useState({

        email: "",
        password: "",
        walletAddress: "",
        role: "investor"
    });

    const change = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const submit = async (e) => {

        e.preventDefault();

        try {

            await api.post(
                "/api/auth/signup",
                form
            );

            alert("Registration successful");

            navigate("/");

        } catch (err) {

            alert(
                err.response?.data?.message ||
                "Registration failed"
            );
        }
    };

    return (

        <div className="min-h-screen flex justify-center items-center">

            <div className="bg-white p-8 rounded-xl shadow-xl w-[450px]">

                <h1 className="text-3xl font-bold mb-6">
                    Create Account
                </h1>

                <form
                    onSubmit={submit}
                    className="space-y-4"
                >

                    <input
                        name="email"
                        placeholder="Email"
                        className="w-full border p-3 rounded"
                        onChange={change}
                    />

                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        className="w-full border p-3 rounded"
                        onChange={change}
                    />

                    <input
                        name="walletAddress"
                        placeholder="Wallet Address"
                        className="w-full border p-3 rounded"
                        onChange={change}
                    />

                    <select
                        name="role"
                        className="w-full border p-3 rounded"
                        onChange={change}
                    >

                        <option value="investor">
                            Investor
                        </option>

                        <option value="insurer">
                            Insurance Firm
                        </option>

                        <option value="admin">
                            Administrator
                        </option>

                    </select>

                    <button
                        className="w-full bg-slate-900 text-white p-3 rounded"
                    >
                        Register
                    </button>

                </form>

                <div className="mt-4 text-center">

                    <Link
                        to="/"
                        className="text-yellow-600"
                    >
                        Back to Login
                    </Link>

                </div>

            </div>

        </div>

    );
}

export default Register;