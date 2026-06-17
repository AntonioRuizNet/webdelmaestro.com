// pages/[...slug].js
import Head from "next/head";
import Nav from "@/components/Nav";
import CardList from "@/components/CardList";
import StaticArticleRenderer from "@/components/StaticArticles/StaticArticleRenderer";
import StaticTopicPage from "@/components/StaticArticles/StaticTopicPage";
import { getSeasonalTerm } from "@/lib/functions";

function serializeDate(value) {
  return value instanceof Date ? value.toISOString() : value || null;
}

export default function BlogPostPage({ post, staticTopic, canonicalUrl, trending }) {
  const pageTitle = staticTopic?.title || post?.title || "Web del Maestro";
  const pageDescription =
    staticTopic?.description || post?.meta_description || post?.excerpt || "Recursos y manualidades para niños en Web del Maestro";

  if (!post && !staticTopic) {
    return (
      <div>
        <Nav />
        <div className="container">
          <h1>Post no encontrado</h1>
        </div>
      </div>
    );
  }

  const title = pageTitle;
  const description = pageDescription;

  return (
    <>
      <Head>
        <title>{title} | Web del Maestro</title>
        <meta name="description" content={description} />
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        <meta property="og:type" content={staticTopic ? "website" : "article"} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        {post?.featured_image && <meta property="og:image" content={post.featured_image} />}
        {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
        <meta property="og:site_name" content="Web del Maestro" />
        <script async custom-element="amp-auto-ads" src="https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js"></script>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0494029669278178"
          crossorigin="anonymous"
        ></script>
      </Head>
      <amp-auto-ads type="adsense" data-ad-client="ca-pub-0494029669278178"></amp-auto-ads>

      <Nav />

      <div className="container-2col">
        <article className="container-post">
          {staticTopic ? (
            <StaticTopicPage topic={staticTopic} />
          ) : post.source === "static" ? (
            <StaticArticleRenderer post={post} />
          ) : (
            <div className="post-content" dangerouslySetInnerHTML={{ __html: post.body || "" }} />
          )}
        </article>

        <div className="container-2col-trending">
          <h2>En tendencia</h2>
          <CardList posts={trending} gridColumns={1} />
        </div>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const slugParam = params?.slug;
  if (!slugParam) return { notFound: true, revalidate: 60 };

  const fullSlug = Array.isArray(slugParam) ? slugParam.join("/") : slugParam;

  // Imports solo en servidor
  const { getPostBySlug, searchPosts } = await import("@/lib/db");
  const { cleanHtml } = await import("@/lib/cleanHtml");

  const post = await getPostBySlug(fullSlug);
  let staticTopic = null;

  if (!post) {
    const staticArticles = await import("@/data/staticArticles");
    staticTopic = staticArticles.getStaticTopicBySlug(fullSlug);
  }

  if (!post && !staticTopic) {
    return { notFound: true, revalidate: 60 };
  }

  let safePost = null;

  if (post) {
    let cleanedBody = post.body || "";

    if (post.source !== "static") {
      try {
        cleanedBody = cleanHtml(post.body, post.excerpt);
      } catch (e) {
        cleanedBody = post.body || "";
      }
    }

    safePost = {
      ...post,
      body: cleanedBody,
      created_at: serializeDate(post.created_at),
      published_at: serializeDate(post.published_at),
      modified_at: serializeDate(post.modified_at),
    };
  }

  const canonicalUrl = `https://webdelmaestro.com/${fullSlug.replace(/^\/+/, "")}`;

  const trending = await searchPosts({
    term: getSeasonalTerm(),
    column: "title",
    limit: 6,
    random: true,
    exclude: ["educacion/"],
  });

  return {
    props: {
      post: safePost,
      staticTopic,
      canonicalUrl,
      trending,
    },
    revalidate: 6 * 60 * 60,
  };
}
