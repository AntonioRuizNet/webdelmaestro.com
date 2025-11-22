import Nav from "@/components/Nav";
import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("loading"); setMsg("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    setStatus("done");
    setMsg(data.message || (res.ok ? "If the email exists, we sent a reset link." : "Error"));
  }

  return (
    <div>
      <Nav />
      <div className="container">
        <h1>Forgot Password</h1>
        <form onSubmit={onSubmit}>
          <input placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} required />
          <button disabled={status === "loading"} type="submit">Send reset link</button>
        </form>
        {msg && <div className="card">{msg}</div>}
      </div>
    </div>
  );
}
