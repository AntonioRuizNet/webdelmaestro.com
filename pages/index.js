import Nav from "@/components/Nav";

export default function Home() {
  return (
    <div>
      <Nav />
      <div className="container">
        <h1>Home</h1>
        <p>Starter: Next.js + NextAuth (credentials) + Prisma + PostgreSQL + Redux + REST API</p>
        <div className="card">
          <p>
            Edita <code>pages/</code> y <code>pages/api/</code>. Configura tu <code>.env</code> con
            <code>DATABASE_URL</code>, <code>NEXTAUTH_SECRET</code>, <code>SMTP_*</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
