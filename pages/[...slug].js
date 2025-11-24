// pages/[...slug].js
import Nav from "@/components/Nav";
import { getPostBySlug } from "@/lib/db";

function serializeDate(value) {
  return value instanceof Date ? value.toISOString() : value || null;
}

export default function BlogPostPage({ post }) {
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
      <div className="container">
        <h1>{post.title}</h1>
        <article className="container" dangerouslySetInnerHTML={{ __html: post.body || "" }} />
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
