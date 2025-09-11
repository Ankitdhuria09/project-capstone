import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../lib/api";

function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    const loadingToast = toast.loading("Signing you in...");
    setLoading(true);
    
    try {
      const res = await api.post("/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      sessionStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user._id);
      sessionStorage.setItem("userId", res.data.user._id);
      localStorage.setItem("userName", res.data.user.username);
      
      toast.success("Welcome back! 🎉", { id: loadingToast });
      navigate("/dashboard");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Login failed. Please check your credentials.",
        { id: loadingToast }
      );
    } finally {
      setLoading(false);
    }
  };
  
  const demoUsers = [
    { id: 1, label: "Arjun Patel", email: "arjun.patel@example.com", password: "demo123" },
    { id: 2, label: "Priya Sharma", email: "priya.sharma@example.com", password: "demo123" },
    { id: 3, label: "Rahul Gupta", email: "rahul.gupta@example.com", password: "demo123" },
    { id: 4, label: "Sneha Iyer", email: "sneha.iyer@example.com", password: "demo123" },
    { id: 5, label: "Vikash Singh", email: "vikash.singh@example.com", password: "demo123" },
    { id: 6, label: "Demo User", email: "demo1@example.com", password: "demo123" },
  ];


  const handleAutoFill = (user) => {
    setFormData({ email: user.email, password: user.password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full mx-4 space-y-8 relative z-10"
      >
        <div className="card-modern p-8 glass">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Welcome Back!</h2>
              <p className="mt-2 text-slate-600">Sign in to your financial dashboard</p>
            </motion.div>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input-modern"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input-modern"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="btn-gradient-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 spinner"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </motion.button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <Link 
                  to="/signup" 
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </form>

          {/* NEW: Quick Login Section */}
          <div className="mt-6 border-t pt-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Quick Login</h3>
            <div className="flex gap-2 flex-wrap">
              {demoUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleAutoFill(user)}
                  className="px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-sm font-medium"
                >
                  {user.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;
