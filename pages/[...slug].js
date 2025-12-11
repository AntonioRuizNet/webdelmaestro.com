// pages/[...slug].js
import Head from "next/head";
import { cleanHtml } from "@/lib/cleanHtml";
import Nav from "@/components/Nav";
import { getPostBySlug, searchPosts } from "@/lib/db";
import CardList from "@/components/CardList";
import { getSeasonalTerm } from "@/lib/functions";

function serializeDate(value) {
  return value instanceof Date ? value.toISOString() : value || null;
}

export default function BlogPostPage({ post, canonicalUrl, trending }) {
  console.log("> BlogPostPage: ", post);

  if (!post) {
    return (
      <div>
        <Nav />
        <div className="container">
          <h1>Post no encontrado</h1>
        </div>
      </div>
    );
  }

  const title = post.title || "Web del Maestro";
  const description = post.meta_description || post.excerpt || "Recursos y manualidades para niños en Web del Maestro";

  return (
    <>
      <Head>
        <title>{title} | Web del Maestro</title>
        <meta name="description" content={description} />

        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        {post.featured_image && <meta property="og:image" content={post.featured_image} />}
        {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
        <meta property="og:site_name" content="Web del Maestro" />
      </Head>

      <Nav />

      <div className="container-2col">
        <article className="container-post">
          <div className="container-post-header">
            <div
              className="container-post-header-image"
              style={{
                backgroundImage: `url(${post.featured_image})`,
              }}
              aria-label={post.title || ""}
              role="img"
            />
            <div className="container-post-header-info">
              <h1>{post.title}</h1>
              <div>{post.excerpt}</div>
            </div>
          </div>

          <div className="" dangerouslySetInnerHTML={{ __html: post.body || "" }} />
        </article>

        <div className="container-2col-trending">
          <h2>En tendencia</h2>
          <CardList posts={trending} gridColumns={1} />
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ params }) {
  const { slug } = params;
  const fullSlug = Array.isArray(slug) ? slug.join("/") : slug;

  const post = await getPostBySlug(fullSlug);

  if (!post) {
    return { notFound: true };
  }

  const safePost = {
    ...post,
    body: cleanHtml(post.body, post.excerpt),
    created_at: serializeDate(post.created_at),
    published_at: serializeDate(post.published_at),
    modified_at: serializeDate(post.modified_at),
  };

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
      canonicalUrl,
      trending,
    },
  };
}
