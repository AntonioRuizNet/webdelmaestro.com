// pages/index.js
import Head from "next/head";
import CardList from "@/components/CardList";
import StaticTopicsHome from "@/components/StaticArticles/StaticTopicsHome";
import Nav from "@/components/Nav";
import { getSeasonalTerm } from "@/lib/functions";
import { searchPosts } from "@/lib/db";
import { getStaticTopicsForHome } from "@/data/staticArticles";

export async function getStaticProps() {
  const seasonalTerm = getSeasonalTerm();

  // OJO: para "todas", mejor usar term = "" en vez de "*"
  const [trending, interesting] = await Promise.all([
    searchPosts({
      term: seasonalTerm,
      column: "title",
      limit: 4,
      random: true,
      exclude: ["educacion/"],
    }),
    searchPosts({
      term: "", // antes ponías "*", aquí lo hacemos "sin término"
      column: "title",
      limit: 16,
      random: true,
      exclude: ["educacion/"],
    }),
  ]);

  const printableTopics = getStaticTopicsForHome({
    limit: 8,
    articlesPerTopic: 4,
    randomTopics: true,
    randomArticles: true,
  });

  return {
    props: {
      printableTopics,
      trending,
      interesting,
    },
    // ISR: re-generar la home cada hora
    revalidate: 3600,
  };
}

export default function Home({ printableTopics, trending, interesting }) {
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
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Web del Maestro" />
        <meta name="google-adsense-account" content="ca-pub-0494029669278178"></meta>
        <script async custom-element="amp-auto-ads" src="https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js"></script>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0494029669278178"
          crossorigin="anonymous"
        ></script>
      </Head>
      <amp-auto-ads type="adsense" data-ad-client="ca-pub-0494029669278178"></amp-auto-ads>

      <div>
        <Nav />
        <main className="container">
          <StaticTopicsHome topics={printableTopics} />

          <h1>Publicaciones en tendencia</h1>
          <CardList posts={trending} gridColumns={4} />

          <h1>Otras publicaciones interesantes</h1>
          <CardList posts={interesting} gridColumns={4} />
        </main>
      </div>
    </>
  );
}
