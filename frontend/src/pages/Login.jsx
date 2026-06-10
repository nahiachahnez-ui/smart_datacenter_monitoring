import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import nexoLogo from "../assets/nexo.jpg";

function Login() {

  const [form, setForm] = useState({
    username: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {

    if (!form.username || !form.password) {
      return toast.warning("Fill all fields");
    }

    setLoading(true);

    try {

      const res = await API.post("/auth/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);

      toast.success("Login successful");

      // ✅ FORCE RELOAD → FIX PROTECTED ROUTE
      window.location.href = "/dashboard";

    } catch (err) {

      toast.error(err.response?.data?.message || "Login failed");

    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="
      min-h-screen flex items-center justify-center
      bg-gray-900 text-white
    ">

      <div className="
        bg-gray-800
        p-8 rounded-2xl
        w-[360px]
        shadow-xl
        border border-gray-700
      ">

        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <img src={nexoLogo} className="w-12 h-12" />
        </div>

        <h2 className="text-2xl font-bold text-center mb-2">
          NEXO
        </h2>

        <p className="text-gray-400 text-sm text-center mb-6">
          AI Monitoring Platform
        </p>

        {/* INPUTS */}
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
          className="
            w-full mb-4 p-3 rounded-lg
            bg-gray-700 border border-gray-600
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          className="
            w-full mb-6 p-3 rounded-lg
            bg-gray-700 border border-gray-600
            focus:outline-none focus:ring-2 focus:ring-purple-500
          "
        />

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="
            w-full
            bg-gradient-to-r from-blue-500 to-purple-500
            p-3 rounded-lg
            font-semibold
            hover:opacity-90 transition
          "
        >
          {loading ? "Logging in..." : "Login"}
        </button>

      </div>

    </div>
  );
}

export default Login;