import React, { useEffect, useState } from "react";
import api from "../api";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import AnalyticsPage from "./Analytics";

function Dashboard() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const res = await api.get("/transactions");
    setTransactions(res.data);
  };

  // 🔽 Calculate totals
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = income - expenses;

  // 🔽 Last 5 transactions
  const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // 🔽 Chart data
  const chartData = [
    { name: "Income", value: income },
    { name: "Expenses", value: expenses },
  ];

  const COLORS = ["#4CAF50", "#F44336"]; // Green = income, Red = expenses

  // 🔽 Category-wise chart
  const categoryTotals = transactions.reduce((acc, t) => {
    if (t.type === "expense") {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    }
    return acc;
  }, {});

  const categoryData = Object.entries(categoryTotals).map(([key, value]) => ({
    name: key,
    value,
  }));

  const CATEGORY_COLORS = [
    "#FF9800", // Orange
    "#3F51B5", // Indigo
    "#009688", // Teal
    "#E91E63", // Pink
    "#9C27B0", // Purple
    "#795548", // Brown
  ];

  return (
    <div>
      <h2>Dashboard</h2>
        <AnalyticsPage />
      {/* Wise Tip of the Day */}
      <div
        style={{
          padding: "15px",
          background: "#e3f2fd",
          border: "1px solid #90caf9",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h3>💡 Wise Tip of the Day</h3>
        <p>
          Always pay yourself first—save at least 20% of your income before you
          spend on anything else. Small savings today grow into wealth tomorrow.
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div style={{ padding: "15px", border: "1px solid #ccc" }}>
          <h3>Total Income</h3>
          <p>₹{income}</p>
        </div>
        <div style={{ padding: "15px", border: "1px solid #ccc" }}>
          <h3>Total Expenses</h3>
          <p>₹{expenses}</p>
        </div>
        <div style={{ padding: "15px", border: "1px solid #ccc" }}>
          <h3>Balance</h3>
          <p>₹{balance}</p>
        </div>
      </div>

      {/* Pie Chart Income vs Expense */}
      <h3>Income vs Expenses</h3>
      <PieChart width={400} height={300}>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          label
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>

      {/* Category-wise Pie Chart */}
      <h3>Expenses by Category</h3>
      <PieChart width={400} height={300}>
        <Pie
          data={categoryData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          label
        >
          {categoryData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>

      {/* Recent Transactions */}
      <h3>Recent Transactions</h3>
      <table border="1" cellPadding="8" style={{ marginTop: "10px", width: "100%" }}>
        <thead>
          <tr>
            <th>Type</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((t) => (
            <tr key={t._id}>
              <td>{t.type}</td>
              <td>{t.category}</td>
              <td>{t.amount}</td>
              <td>{new Date(t.date).toLocaleDateString()}</td>
              <td>{t.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
