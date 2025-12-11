// pages/index.js
import Head from "next/head";
import CardList from "@/components/CardList";
import Nav from "@/components/Nav";
import { getSeasonalTerm } from "@/lib/functions";

export default function Home() {
  const title = "Web del Maestro – Manualidades, recursos y actividades para niños";
  const description =
    "Manualidades para niños, recursos educativos y actividades creativas para el aula y casa. Descubre fichas, imprimibles y proyectos paso a paso en Web del Maestro.";

  const canonicalUrl = "https://webdelmaestro.com/";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph básico para la home */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Web del Maestro" />
      </Head>

      <div>
        <Nav />
        <main className="container">
          <h1>Publicaciones en tendencia</h1>
          <CardList term={getSeasonalTerm()} column="title" limit={4} random={true} exclude={["educacion/"]} />
          <h1>Algunas publicaciones interesantes</h1>
          <CardList term="*" column="title" limit={16} random={true} exclude={["educacion/"]} />
        </main>
      </div>
    </>
  );
}
