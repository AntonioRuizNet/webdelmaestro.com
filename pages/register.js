import Nav from "@/components/Nav";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError(""); setOk("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password })
    });
    const data = await res.json();
    if (!res.ok) return setError(data?.message || "Error");
    setOk("Account created. You can login now.");
    setTimeout(() => router.push("/login"), 800);
  }

  return (
    <div>
      <Nav />
      <div className="container">
        <h1>Register</h1>
        <form onSubmit={onSubmit}>
          <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <div className="card" style={{ color: "crimson" }}>{error}</div>}
          {ok && <div className="card" style={{ color: "green" }}>{ok}</div>}
          <button type="submit">Create account</button>
        </form>
      </div>
    </div>
  );
}
