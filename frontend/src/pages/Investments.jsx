// frontend/pages/InvestmentPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import InvestmentModal from "./InvestmentModal";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const safe = (val) => (isNaN(val) || val === undefined ? 0 : Number(val));

const InvestmentPage = () => {
  const [investments, setInvestments] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchInvestments = async () => {
    const res = await axios.get("http://localhost:5000/api/investments");
    setInvestments(res.data || []);
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  // SUMMARY
  const totalInvested = investments.reduce((sum, i) => sum + safe(i.amount), 0);
  const currentValue = investments.reduce((sum, i) => {
    const value =
      i.currentPrice && i.units
        ? safe(i.currentPrice) * safe(i.units)
        : safe(i.amount);
    return sum + value;
  }, 0);
  const totalGains = currentValue - totalInvested;

  // Holdings with gains
  const holdings = investments.map((i) => {
    const value =
      i.currentPrice && i.units
        ? safe(i.currentPrice) * safe(i.units)
        : safe(i.amount);
    return {
      ...i,
      value,
      gain: value - safe(i.amount),
    };
  });

  const topGainers = [...holdings].sort((a, b) => b.gain - a.gain).slice(0, 3);
  const topLosers = [...holdings].sort((a, b) => a.gain - b.gain).slice(0, 3);

  // Asset allocation
  const allocation = holdings.reduce((acc, i) => {
    acc[i.type] = (acc[i.type] || 0) + i.value;
    return acc;
  }, {});
  const chartData = {
    labels: Object.keys(allocation),
    datasets: [
      {
        data: Object.values(allocation),
        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  return (
    <div>
      <h2>Investments Summary</h2>
      <p>Total Invested: ₹{totalInvested}</p>
      <p>Current Value: ₹{currentValue}</p>
      <p>Total Gains: ₹{totalGains}</p>

      <button onClick={() => setShowModal(true)}>Add Investment</button>
      <InvestmentModal isOpen={showModal} onClose={() => setShowModal(false)} onSaved={fetchInvestments} />

      <h3>Holdings</h3>
      {holdings.map((h) => (
        <div key={h._id} className="card">
          <h4>{h.name} ({h.type})</h4>
          <p>Invested: ₹{h.amount}</p>
          <p>Current Value: ₹{h.value}</p>
          <p>Gain/Loss: ₹{h.gain}</p>
          <button onClick={async () => {
            const newPrice = prompt("Enter current price:");
            if (newPrice) {
              await axios.put(`http://localhost:5000/api/investments/${h._id}`, { currentPrice: newPrice });
              fetchInvestments();
            }
          }}>
            Update Price
          </button>
        </div>
      ))}

      <h3>Top Gainers</h3>
      {topGainers.map((g) => (
        <p key={g._id}>{g.name} +₹{g.gain}</p>
      ))}

      <h3>Top Losers</h3>
      {topLosers.map((l) => (
        <p key={l._id}>{l.name} ₹{l.gain}</p>
      ))}

      <h3>Asset Allocation</h3>
      <Pie data={chartData} />
    </div>
  );
};

export default InvestmentPage;
