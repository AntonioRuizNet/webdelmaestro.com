import ProtectedLayout from "@/components/ProtectedLayout";
import { useSession } from "next-auth/react";
import { withAuthGSSP } from "@/lib/withAuthGSSP";

export default function Dashboard() {
  const { data: session } = useSession();
  return (
    <ProtectedLayout>
      <h1>Dashboard</h1>
      <p>Solo visible si has iniciado sesión.</p>
      <pre className="card">{JSON.stringify(session, null, 2)}</pre>
    </ProtectedLayout>
  );
}

export const getServerSideProps = withAuthGSSP();
