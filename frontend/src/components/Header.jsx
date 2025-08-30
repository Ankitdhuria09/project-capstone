// Header.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ for redirect

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

  // ✅ Logout function
  const handleLogout = () => {

    localStorage.clear(); // remove stored user/session data
    sessionStorage.clear();
    navigate("/login"); // redirect to login page
  };

  return (
    <header className="flex items-center justify-between bg-white shadow px-6 py-4">
      {/* Page Title */}
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>

      {/* Search Bar */}
      <div className="flex-1 mx-8">
        <input
          type="text"
          placeholder="Search..."
          className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            }}
            className="relative text-gray-600 hover:text-purple-600"
          >            🔔
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
              3
            </span>
          </button>

          {/* Notifications Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-50">
              <div className="p-3 font-semibold text-gray-700 border-b">
                Notifications
              </div>
              <ul className="max-h-60 overflow-y-auto text-sm text-gray-700">
                <li className="px-4 py-2 hover:bg-gray-100">NO New Notifications</li>
              </ul>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 focus:outline-none"
          >
            <img
              src="https://i.pravatar.cc/40"
              alt="User"
              className="w-9 h-9 rounded-full border"
            />
            <span className="text-sm font-medium text-gray-700">{localStorage.getItem("userName")}</span>
          </button>

          {/* Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
              <ul className="py-1 text-sm text-gray-700">
                <li>
                  <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                    Profile
                  </button>
                </li>
                <li>
                  <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                    Settings
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
