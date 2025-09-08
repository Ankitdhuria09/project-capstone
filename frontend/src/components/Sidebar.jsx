// Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar({ onLogout }) {
  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Transactions", path: "/transactions" },
    { name: "Budgets", path: "/budgets" },
    { name: "Goals", path: "/goals" },
    { name: "Analytics", path: "/analytics" },
    { name: "Investments", path: "/investments" },
    { name: "Groups", path: "/groups" },
  ];

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col justify-between">
      {/* Logo / App Name */}
      <div>
        <h1 className="text-2xl font-bold text-purple-600 p-6">💰 BudgetApp</h1>

        {/* Navigation */}
        <nav className="mt-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                `block px-6 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-purple-100 text-purple-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-100 hover:text-purple-600"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Profile Section */}
      <div className="p-6 border-t bg-gray-50">
        <button
          onClick={onLogout}
          className="mt-4 w-full py-2 px-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
