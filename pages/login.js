import Nav from "@/components/Nav";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const callbackUrl = router.query.callbackUrl || "/dashboard";
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      redirect: false,
      identifier,
      password,
      callbackUrl
    });
    if (res?.error) return setError(res.error || "Invalid credentials");
    router.push(callbackUrl);
  }

  return (
    <div>
      <Nav />
      <div className="container">
        <h1>Login</h1>
        <form onSubmit={onSubmit}>
          <input placeholder="Email or Username" value={identifier} onChange={e => setIdentifier(e.target.value)} required />
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <div className="card" style={{ color: "crimson" }}>{error}</div>}
          <button type="submit">Login</button>
        </form>
        <p><a href="/forgot-password">Forgot your password?</a></p>
      </div>
    </div>
  );
}

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx);
  if (session) return { redirect: { destination: "/dashboard", permanent: false } };
  return { props: {} };
}
