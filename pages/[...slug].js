import { cleanHtml } from "@/lib/cleanHtml";
import Nav from "@/components/Nav";
import { getPostBySlug } from "@/lib/db";
import CardList from "@/components/CardList";

function serializeDate(value) {
  return value instanceof Date ? value.toISOString() : value || null;
}

export default function BlogPostPage({ post }) {
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

  return (
    <div>
      <Nav />
      <div className="container-2col">
        <article className="container-post">
          <div className="container-post-header">
            <div className="container-post-header-image">
              <img src={post.featured_image} />
            </div>
            <div className="container-post-header-info">
              <h1>{post.title}</h1>
              <div>{post.excerpt}</div>
            </div>
          </div>

          <div className="" dangerouslySetInnerHTML={{ __html: post.body || "" }} />
        </article>
        <div className="container-2col-trending">
          <h2>En tendencia</h2>
          <CardList
            term="navidad" // opcional
            column="title" // "title" | "slug" | "body" | "excerpt" | "url"
            limit={6}
            random={true}
            exclude={["educacion/"]}
            gridColumns={1}
          />
        </div>
      </div>
    </div>
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

  return {
    props: {
      post: safePost,
    },
  };
}
