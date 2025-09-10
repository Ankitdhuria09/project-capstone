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
} from "@heroicons/react/24/outline";

export default function Sidebar({ onLogout }) {
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: HomeIcon },
    { name: "Transactions", path: "/transactions", icon: CreditCardIcon },
    { name: "Budgets", path: "/budgets", icon: CurrencyDollarIcon },
    { name: "Goals", path: "/goals", icon: TrophyIcon },
    { name: "Analytics", path: "/analytics", icon: ChartBarIcon },
    { name: "Investments", path: "/investments", icon: BuildingLibraryIcon },
    { name: "Groups", path: "/groups", icon: UserGroupIcon },
  ];

  const handleLogout = () => {
    toast.success("Logged out successfully! 👋");
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div className="w-72 glass border-r border-slate-200/50 flex flex-col">
      {/* Logo / App Name */}
      <div className="p-8">
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
      <nav className="flex-1 px-6 space-y-2">
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
                className={({ isActive }) =>
                  `group flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "text-slate-700 hover:bg-slate-100 hover:text-blue-600"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-500 group-hover:text-blue-600"}`} />
                    <span>{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="ml-auto w-1 h-1 bg-white rounded-full"
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
      <div className="p-6 border-t border-slate-200/50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="card-modern p-4 bg-gradient-to-br from-slate-50 to-blue-50"
        >
          <div className="flex items-center space-x-3 mb-4">
            <img
              src="https://i.ibb.co/VcTyVVFr/blank-profile-picture-973460-1280.webp"
              alt="User"
              className="w-12 h-12 rounded-xl border-2 border-white shadow-sm"
            />
            <div>
              <p className="font-semibold text-slate-900">{localStorage.getItem("userName") || "User"}</p>
              <p className="text-sm text-slate-600">Premium Plan</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg transition-all duration-200"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Logout</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}