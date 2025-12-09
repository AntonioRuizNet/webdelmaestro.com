// components/Nav.jsx
import Link from "next/link";

export default function Nav() {
  return (
    <nav>
      <Link href="/">Web del Maestro</Link>

      <form action="/buscar" method="GET" style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          name="q" // ← nombre que leeremos en la página /buscar
          className="searcher"
          placeholder="Busca manualidades o noticias"
        />
        <button type="submit">BUSCAR</button>
      </form>
    </nav>
  );
}
