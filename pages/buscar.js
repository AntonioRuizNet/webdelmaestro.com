// pages/buscar.js
import Head from "next/head";
import Nav from "@/components/Nav";
import CardList from "@/components/CardList";
import { getSeasonalTerm } from "@/lib/functions";
import { searchPosts } from "@/lib/db";

export default function BuscarPage({ q, results, trending }) {
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
              <CardList posts={results} gridColumns={4} />

              <h1>Otras publicaciones en tendencia</h1>
              <CardList posts={trending} gridColumns={4} />
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
  const term = q.trim();

  let results = [];
  let trending = [];

  if (term) {
    // resultados de búsqueda
    results = await searchPosts({
      term,
      column: "search", // title + meta_description
      limit: 24,
      random: false,
      exclude: ["educacion/"],
    });

    // bloque “en tendencia”
    trending = await searchPosts({
      term: getSeasonalTerm(),
      column: "title",
      limit: 8,
      random: true,
      exclude: ["educacion/"],
    });
  }

  return {
    props: {
      q,
      results,
      trending,
    },
  };
}
