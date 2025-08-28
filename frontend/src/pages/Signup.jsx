import { useState } from "react";
import api from "../lib/api";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup() {
    try {
      await api.post("/auth/signup", { username, email, password });
      alert("Signup successful! You can now login.");
    } catch (err) {
      alert(err.response?.data?.message || "Error signing up");
    }
  }

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Signup</h2>
      <input
        type="text"
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      /><br />
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      /><br />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      /><br />
      <button onClick={handleSignup}>Signup</button>
    </div>
  );
}
