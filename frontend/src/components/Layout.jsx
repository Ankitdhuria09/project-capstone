// Layout.jsx
import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header.jsx";

export default function Layout({ children, onLogout }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar onLogout={onLogout} />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
