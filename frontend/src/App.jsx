import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import "./index.css";
// Import pages
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budget from "./pages/Budget";
import Goals from "./pages/Goals";
import Investments from "./pages/Investments";
import Groups from "./pages/Groups";
import Analytics from "./pages/Analytics";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/transactions" element={
            <ProtectedRoute>
              <Layout>
                <Transactions />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/budgets" element={
            <ProtectedRoute>
              <Layout>
                <Budget />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/goals" element={
            <ProtectedRoute>
              <Layout>
                <Goals />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/investments" element={
            <ProtectedRoute>
              <Layout>
                <Investments />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/groups" element={
            <ProtectedRoute>
              <Layout>
                <Groups />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Layout>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;