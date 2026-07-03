import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

//Just logging in. Not special..yet.
function Login() {

    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const submit = async (e) => {

        e.preventDefault();

        try {

            const response = await api.post(
                "/api/auth/login",
                {
                    email,
                    password
                }
            );

            login(response.data);

            if (response.data.role === "investor")
                navigate("/investor");

            else if (response.data.role === "admin")
                navigate("/admin");

            else if (response.data.role === "insurer")
                navigate("/insurer");

        } catch (err) {

            alert(
                err.response?.data?.message ||
                "Login failed"
            );
        }
    };

    return (

        <div className="min-h-screen flex items-center justify-center bg-slate-50">

            <div className="bg-white p-10 rounded-2xl shadow-xl w-[420px]">

                <div className="text-center mb-8">

                    <ShieldCheck
                        size={50}
                        className="mx-auto text-yellow-500"
                    />

                    <h1 className="text-3xl font-bold mt-4">
                        Siyakhula
                    </h1>

                    <p className="text-slate-500">
                        Blockchain Insurance Platform
                    </p>

                </div>

                <form
                    onSubmit={submit}
                    className="space-y-4"
                >

                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-3 border rounded-lg"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-3 border rounded-lg"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                    />

                    <button
                        className="w-full bg-slate-900 text-white p-3 rounded-lg"
                    >
                        Login
                    </button>

                </form>

                <div className="text-center mt-5">

                    <Link
                        to="/register"
                        className="text-yellow-600"
                    >
                        Create Account
                    </Link>

                </div>

            </div>

        </div>

    );
}

export default Login;