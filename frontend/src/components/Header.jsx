import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon 
} from "@heroicons/react/24/outline";

export default function Header({ title }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target) &&
        notifRef.current &&
        !notifRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    toast.success("Logged out successfully! 👋");
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  const userName = localStorage.getItem("userName") || "User";

  return (
    <header className="glass border-b border-slate-200/50 px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-slate-900">{title || "Dashboard"}</h1>
          <p className="text-sm text-slate-600 mt-1">
            {new Date().toLocaleDateString("en-US", { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </motion.div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setNotifOpen(!notifOpen);
                setProfileOpen(false);
              }}
              className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
            >
              <BellIcon className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                3
              </span>
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 card-modern p-0 z-50 overflow-hidden"
                >
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-900">Notifications</h3>
                    <p className="text-sm text-slate-600">You have 3 new notifications</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    <div className="p-4 hover:bg-slate-50 border-b border-slate-100 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">Budget Alert</p>
                          <p className="text-xs text-slate-600">You've spent 80% of your monthly budget</p>
                          <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 hover:bg-slate-50 border-b border-slate-100 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">Goal Achieved</p>
                          <p className="text-xs text-slate-600">Congratulations! You've reached your savings goal</p>
                          <p className="text-xs text-slate-400 mt-1">1 day ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">Investment Update</p>
                          <p className="text-xs text-slate-600">Your portfolio gained 2.5% this week</p>
                          <p className="text-xs text-slate-400 mt-1">3 days ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
              className="flex items-center space-x-3 p-2 hover:bg-slate-100 rounded-xl transition-all duration-200"
            >
              <img
                src="https://i.ibb.co/VcTyVVFr/blank-profile-picture-973460-1280.webp"
                alt="User Avatar"
                className="w-10 h-10 rounded-xl border-2 border-slate-200 shadow-sm"
              />
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">{userName}</p>
                <p className="text-xs text-slate-500">Premium User</p>
              </div>
            </motion.button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 card-modern p-2 z-50"
                >
                  <div className="py-2">
                    <button className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                      <UserCircleIcon className="h-5 w-5" />
                      <span>My Profile</span>
                    </button>
                    <button className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                      <Cog6ToothIcon className="h-5 w-5" />
                      <span>Settings</span>
                    </button>
                  </div>
                  <div className="border-t border-slate-200 py-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}