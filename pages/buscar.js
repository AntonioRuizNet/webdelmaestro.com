// pages/buscar.js
import Head from "next/head";
import Nav from "@/components/Nav";
import CardList from "@/components/CardList";
import { getSeasonalTerm } from "@/lib/functions";

export default function BuscarPage({ q }) {
  const term = (q || "").trim();

  const baseTitle = "Buscar en Web del Maestro";
  const title = term ? `Resultados para “${term}” | Web del Maestro` : baseTitle;

  const description = term
    ? `Resultados de búsqueda para ${term} en Web del Maestro: manualidades, actividades infantiles, recursos educativos y más.`
    : "Busca manualidades, actividades infantiles, fichas imprimibles y recursos educativos en Web del Maestro.";

  const canonicalUrl = term ? `https://webdelmaestro.com/buscar?q=${encodeURIComponent(term)}` : "https://webdelmaestro.com/buscar";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Web del Maestro" />
      </Head>

      <div>
        <Nav />

        <main className="container">
          {term ? (
            <>
              <h1>Resultados para “{term}”</h1>
              <CardList
                term={term}
                column="search" // buscaremos tanto en title como en excerpt
                limit={24}
                random={false}
                exclude={["educacion/"]}
                gridColumns={4}
              />
              <h1>Otras publicaciones en tendencia</h1>
              <CardList term={getSeasonalTerm()} column="title" limit={4} random={true} exclude={["educacion/"]} />
            </>
          ) : (
            <>
              <h1>Escribe algo para buscar</h1>
              <p>Utiliza el buscador de la parte superior.</p>
            </>
          )}
        </main>
      </div>
    </>
  );
}

export async function getServerSideProps({ query }) {
  const q = typeof query.q === "string" ? query.q : "";
  return {
    props: { q },
  };
}
