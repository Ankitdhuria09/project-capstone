import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './index.css';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Toaster 
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Define default options
        className: '',
        duration: 4000,
        style: {
          background: '#1E293B',
          color: '#F8FAFC',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          border: '1px solid #334155',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '500',
        },
        // Styling for different types
        success: {
          style: {
            background: '#065F46',
            color: '#D1FAE5',
            border: '1px solid #10B981',
          },
          iconTheme: {
            primary: '#10B981',
            secondary: '#D1FAE5',
          },
        },
        error: {
          style: {
            background: '#7F1D1D',
            color: '#FEE2E2',
            border: '1px solid #EF4444',
          },
          iconTheme: {
            primary: '#EF4444',
            secondary: '#FEE2E2',
          },
        },
        loading: {
          style: {
            background: '#1E40AF',
            color: '#DBEAFE',
            border: '1px solid #3B82F6',
          },
        },
      }}
    />
  </React.StrictMode>
);