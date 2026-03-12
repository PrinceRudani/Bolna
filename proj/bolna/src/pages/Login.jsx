import { useState } from "react";
import { useNavigate } from "react-router";
import { MessageSquare, Mail, Lock, Eye, EyeOff, Loader } from "lucide-react";
import api from "../utils/axios";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    setError("");

    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post(
        "/login",
        {
          email: form.email,
          password: form.password
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const data = res.data;

      // Persist token
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("token_type", data.token_type);

      // Redirect after successful login
      navigate(`/complaints?department=${encodeURIComponent("Water")}`);

    } catch (error) {

      if (error.response) {
        setError(error.response.data?.detail || "Invalid email or password.");
      } else {
        setError("Network error. Please try again.");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Sahana AI</h1>
              <p className="text-sm text-gray-500">Chat Assistant</p>
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-1 text-sm">Sign in to your municipal dashboard</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <div className="relative">
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="admin@ahmedabad.gov.in"
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg border border-gray-200
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <Mail className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-gray-100 rounded-lg border border-gray-200
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <Lock className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
              <button
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600
                       transition-colors duration-200 font-medium flex items-center justify-center gap-2
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? <><Loader className="w-4 h-4 animate-spin" /> Signing in…</>
              : "Sign in"
            }
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Ahmedabad Municipal Corporation · Sahana AI Dashboard
        </p>
      </div>
    </div>
  );
}