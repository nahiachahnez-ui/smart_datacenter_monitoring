import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Login() {
  const [form, setForm] = useState({
    username: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!form.username || !form.password) {
      return toast.warning("Please fill all fields");
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/login", form);

      //  Save session
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);

      toast.success("Login successful ");

      //  Redirect
      navigate("/dashboard");

    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="
      min-h-screen flex items-center justify-center
      bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100
      relative overflow-hidden
    ">

      {/*  BACKGROUND BLOBS */}
      <div className="absolute w-[400px] h-[400px] bg-blue-400/30 rounded-full blur-3xl top-[-100px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-purple-400/30 rounded-full blur-3xl bottom-[-120px] right-[-100px]" />
      <div className="absolute w-[300px] h-[300px] bg-pink-400/20 rounded-full blur-3xl top-[40%] left-[30%]" />

      {/* 🧊 LOGIN CARD */}
      <div className="
        relative
        bg-white/80
        backdrop-blur-xl
        border border-white/40
        rounded-2xl
        p-8
        w-full max-w-md
        shadow-2xl
      ">

        {/* TITLE */}
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">
          Smart Datacenter
        </h2>

        <p className="text-gray-500 text-sm text-center mb-6">
          Monitoring Platform
        </p>

        {/* USERNAME */}
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
          className="
            w-full mb-4 p-3 rounded-lg
            bg-white/90
            border border-gray-300
            focus:outline-none
            focus:ring-2 focus:ring-blue-400
          "
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          className="
            w-full mb-6 p-3 rounded-lg
            bg-white/90
            border border-gray-300
            focus:outline-none
            focus:ring-2 focus:ring-purple-400
          "
        />

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="
            w-full
            bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
            hover:opacity-90
            p-3
            rounded-lg
            text-white
            font-semibold
            flex items-center justify-center gap-2
            transition
          "
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </button>

      </div>

    </div>
  );
}

export default Login;