import ProtectedLayout from "@/components/ProtectedLayout";
import { withAuthGSSP } from "@/lib/withAuthGSSP";

export default function Reports() {
  return (
    <ProtectedLayout>
      <h1>Reports</h1>
      <p>Otra página protegida que reutiliza el mismo layout y protección.</p>
      <div className="card">
        <p>Añade tus widgets o tablas aquí.</p>
      </div>
    </ProtectedLayout>
  );
}

export const getServerSideProps = withAuthGSSP();
