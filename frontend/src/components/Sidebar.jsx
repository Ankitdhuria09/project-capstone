import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  HomeIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  TrophyIcon,
  BuildingLibraryIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar({ onLogout, onClose }) {
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: HomeIcon, color: "from-blue-500 to-indigo-600" },
    { name: "Transactions", path: "/transactions", icon: CreditCardIcon, color: "from-green-500 to-emerald-600" },
    { name: "Budgets", path: "/budgets", icon: CurrencyDollarIcon, color: "from-purple-500 to-violet-600" },
    { name: "Goals", path: "/goals", icon: TrophyIcon, color: "from-amber-500 to-orange-600" },
    { name: "Analytics", path: "/analytics", icon: ChartBarIcon, color: "from-cyan-500 to-blue-600" },
    { name: "Investments", path: "/investments", icon: BuildingLibraryIcon, color: "from-emerald-500 to-teal-600" },
    { name: "Groups", path: "/groups", icon: UserGroupIcon, color: "from-pink-500 to-rose-600" },
  ];

  const handleLogout = () => {
    toast.success("Logged out successfully! 👋");
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
    onClose?.();
  };

  return (
    <div className="w-80 lg:w-72 h-full glass border-r border-slate-200/50 flex flex-col">
      {/* Mobile Close Button */}
      {onClose && (
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-slate-600" />
          </button>
        </div>
      )}

      {/* Logo / App Name */}
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center space-x-3"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">💰</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">WiseMoney</h1>
            <p className="text-sm text-slate-600">Financial Tracker</p>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 lg:px-6 space-y-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <NavLink
                to={item.path}
                end
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-blue-500/25`
                      : "text-slate-700 hover:bg-slate-100 hover:text-blue-600"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-500 group-hover:text-blue-600"}`} />
                    <span className="font-semibold">{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="ml-auto w-2 h-2 bg-white rounded-full"
                        initial={false}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 lg:p-6 border-t border-slate-200/50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="card-modern p-4 bg-gradient-to-br from-slate-50 to-blue-50"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              {(localStorage.getItem("userName") || "U").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 truncate">
                {localStorage.getItem("userName") || "User"}
              </p>
              <p className="text-sm text-slate-600">Premium Plan</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 w-full py-3 px-4 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-800 text-white rounded-xl shadow-lg transition-all duration-200"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Logout</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}