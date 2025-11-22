import Link from "next/link";
import { useRouter } from "next/router";

const items = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/reports", label: "Reports" },
  // Agrega aquí más entradas de menú cuando quieras
];

export default function Sidebar() {
  const router = useRouter();
  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Menú</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((it) => {
          const active = router.pathname === it.href;
          return (
            <li key={it.href} style={{ marginBottom: ".5rem" }}>
              <Link
                href={it.href}
                style={{
                  display: "block",
                  padding: ".5rem .75rem",
                  borderRadius: ".5rem",
                  textDecoration: "none",
                  border: "1px solid #eee",
                  background: active ? "#f5f5f5" : "white",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
