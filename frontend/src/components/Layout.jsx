import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header.jsx";

export default function Layout({ children, onLogout }) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Sidebar */}
      <Sidebar onLogout={onLogout} />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="p-8 overflow-y-auto custom-scrollbar bg-gradient-to-br from-slate-50/50 to-transparent">
          {children}
        </main>
      </div>
    </div>
  );
}