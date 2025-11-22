import Nav from "@/components/Nav";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  const [password, setPassword] = useState("");
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr(""); setOk("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password })
    });
    const data = await res.json();
    if (!res.ok) return setErr(data?.message || "Error");
    setOk("Password updated. You can login now.");
  }

  return (
    <div>
      <Nav />
      <div className="container">
        <h1>Reset Password</h1>
        <form onSubmit={onSubmit}>
          <input placeholder="New password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit">Update password</button>
        </form>
        {ok && <div className="card" style={{ color: "green" }}>{ok}</div>}
        {err && <div className="card" style={{ color: "crimson" }}>{err}</div>}
      </div>
    </div>
  );
}
