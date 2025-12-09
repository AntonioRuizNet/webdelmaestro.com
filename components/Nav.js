// components/Nav.jsx
import Link from "next/link";

export default function Nav() {
  return (
    <header>
      <nav className="main-nav" aria-label="Navegación principal">
        <div className="nav-left">
          <Link href="/" className="nav-logo">
            Web del Maestro
          </Link>
        </div>

        {/* 
          Cuando tengas secciones/categorías importantes con URL propia,
          aquí podrás añadir una lista <ul> de enlaces internos.
        */}
        {/* 
        <ul className="nav-links">
          <li>
            <Link href="/manualidades-para-ninos">Manualidades</Link>
          </li>
          <li>
            <Link href="/navidad">Navidad</Link>
          </li>
          <li>
            <Link href="/recursos-para-el-aula">Recursos para el aula</Link>
          </li>
        </ul>
        */}

        <form
          action="/buscar"
          method="GET"
          role="search"
          aria-label="Buscar en Web del Maestro"
          style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}
        >
          <input
            type="text"
            name="q"
            className="searcher"
            placeholder="Busca manualidades o noticias"
            aria-label="Escribe aquí para buscar manualidades o noticias"
          />
          <button type="submit">BUSCAR</button>
        </form>
      </nav>
    </header>
  );
}
