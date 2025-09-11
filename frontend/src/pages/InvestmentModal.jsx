// frontend/components/InvestmentModal.jsx
import React, { useState } from "react";
import api from "../lib/api";

const InvestmentModal = ({ isOpen, onClose, onSaved }) => {
  const [form, setForm] = useState({
    name: "",
    type: "",
    amount: "",
    units: "",
    currentPrice: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/investments", form);
    onSaved();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Add Investment</h3>
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Name" onChange={handleChange} required />
          <select name="type" placeholder="Type (Stock/Mutual Fund/etc)" onChange={handleChange} required >
            <option value="">Select Type</option>
            <option value="stocks">Stocks</option>
            <option value="mutual funds">Mutual Funds</option>
            <option value="crypto">Crypto</option>
          </select>
          <input name="amount" type="number" placeholder="Amount Invested" onChange={handleChange} required />
          <input name="units" type="number" placeholder="Units" onChange={handleChange} />
          <input name="currentPrice" type="number" placeholder="Current Price (optional)" onChange={handleChange} />
          <button type="submit">Save</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default InvestmentModal;
