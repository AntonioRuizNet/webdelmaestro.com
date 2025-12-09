// pages/buscar.js
import Nav from "@/components/Nav";
import CardList from "@/components/CardList";

export default function BuscarPage({ q }) {
  const term = (q || "").trim();

  return (
    <div>
      <Nav />
      <main className="container">
        {term ? (
          <>
            <h1>Resultados para “{term}”</h1>
            <CardList
              term={term}
              column="search" // ← usará el caso title OR meta_description
              limit={24}
              random={false} // ← aquí mejor sin aleatorio
              exclude={["educacion/"]}
              gridColumns={4}
            />
          </>
        ) : (
          <>
            <h1>Escribe algo para buscar</h1>
            <p>Utiliza el buscador de la parte superior.</p>
          </>
        )}
      </main>
    </div>
  );
}

export async function getServerSideProps({ query }) {
  const q = typeof query.q === "string" ? query.q : "";
  return {
    props: { q },
  };
}
