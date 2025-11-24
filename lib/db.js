// lib/db.js
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// Buscar por slug
export async function getPostBySlug(slug) {
  const rows = await sql`
    SELECT *
    FROM posts
    WHERE slug = ${slug}
    LIMIT 1
  `;
  const row = rows[0];
  if (!row) return null;

  return {
    ...row,
    created_at: row.created_at ? row.created_at.toISOString() : null,
  };
}

// (por si lo necesitas)
export async function getPostByUrl(url) {
  const rows = await sql`
    SELECT *
    FROM posts
    WHERE url = ${url}
    LIMIT 1
  `;
  return rows[0] || null;
}

// 🔥 nuevo: upsert por URL
export async function upsertPostByUrl(data) {
  const { url, slug, title, bodyHtml, excerpt, metaTitle, metaDescription, featuredImage, publishedAt, modifiedAt, author } = data;

  // Ajusta columnas según tu tabla real (esto asume que las has creado)
  const rows = await sql`
    INSERT INTO posts (
      url,
      slug,
      title,
      body,
      excerpt,
      meta_title,
      meta_description,
      featured_image,
      published_at,
      modified_at,
      author
    )
    VALUES (
      ${url},
      ${slug},
      ${title},
      ${bodyHtml},
      ${excerpt},
      ${metaTitle},
      ${metaDescription},
      ${featuredImage},
      ${publishedAt},
      ${modifiedAt},
      ${author}
    )
    ON CONFLICT (url)
    DO UPDATE SET
      slug = EXCLUDED.slug,
      title = EXCLUDED.title,
      body = EXCLUDED.body,
      excerpt = EXCLUDED.excerpt,
      meta_title = EXCLUDED.meta_title,
      meta_description = EXCLUDED.meta_description,
      featured_image = EXCLUDED.featured_image,
      published_at = EXCLUDED.published_at,
      modified_at = EXCLUDED.modified_at,
      author = EXCLUDED.author
    RETURNING *;
  `;

  return rows[0];
}

export async function searchPosts({
  term = "",
  column = "title",
  limit = 12,
  random = false,
  exclude = [], // ← prefijos a excluir, ej: ["educacion/"]
}) {
  const allowedColumns = ["title", "slug", "body", "excerpt", "url"];
  const col = allowedColumns.includes(column) ? column : "title";

  const like = `%${term}%`;
  let rows = [];

  // 1) Hacemos la query SIN excluir aún nada
  if (term) {
    if (col === "title") {
      rows = await sql`
        SELECT id, url, slug, title, excerpt, featured_image, body
        FROM posts
        WHERE title ILIKE ${like}
        LIMIT ${limit * 3}
      `;
    } else if (col === "slug") {
      rows = await sql`
        SELECT id, url, slug, title, excerpt, featured_image, body
        FROM posts
        WHERE slug ILIKE ${like}
        LIMIT ${limit * 3}
      `;
    } else if (col === "body") {
      rows = await sql`
        SELECT id, url, slug, title, excerpt, featured_image, body
        FROM posts
        WHERE body ILIKE ${like}
        LIMIT ${limit * 3}
      `;
    } else if (col === "excerpt") {
      rows = await sql`
        SELECT id, url, slug, title, excerpt, featured_image, body
        FROM posts
        WHERE excerpt ILIKE ${like}
        LIMIT ${limit * 3}
      `;
    } else if (col === "url") {
      rows = await sql`
        SELECT id, url, slug, title, excerpt, featured_image, body
        FROM posts
        WHERE url ILIKE ${like}
        LIMIT ${limit * 3}
      `;
    }
  } else {
    rows = await sql`
      SELECT id, url, slug, title, excerpt, featured_image, body
      FROM posts
      LIMIT ${limit * 3}
    `;
  }

  // 2) Excluir en JS los slugs que empiecen por alguno de los prefijos
  if (exclude && exclude.length) {
    rows = rows.filter((row) => {
      if (!row.slug) return true;
      return !exclude.some((prefix) => row.slug.startsWith(prefix));
    });
  }

  // 3) Omitir posts incompletos (temporal)
  rows = rows.filter((row) => {
    return row.title && row.body && row.featured_image;
  });

  // 3) Aleatorio opcional
  if (random && rows.length > 1) {
    rows = [...rows].sort(() => Math.random() - 0.5);
  }

  // 4) Recortar al límite final
  if (rows.length > limit) {
    rows = rows.slice(0, limit);
  }

  return rows;
}
