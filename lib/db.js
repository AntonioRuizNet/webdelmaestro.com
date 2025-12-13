// lib/db.js
import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // En local estás usando sslmode=disable → no SSL
  ssl: false,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

// Template tag para mantener el mismo estilo que Neon: sql`... ${var} ...`
export function sql(strings, ...values) {
  let text = "";
  const params = [];

  for (let i = 0; i < strings.length; i++) {
    text += strings[i];
    if (i < values.length) {
      const v = values[i];

      // Permite anidar sql`...` (lo usas en orderClause)
      if (v && typeof v === "object" && v.__isSqlFragment) {
        text += v.text;
        params.push(...v.values);
      } else {
        params.push(v);
        text += `$${params.length}`;
      }
    }
  }

  return {
    __isSqlFragment: true,
    text,
    values: params,
    async then(resolve, reject) {
      try {
        const res = await pool.query(text, params);
        resolve(res.rows);
      } catch (err) {
        reject(err);
      }
    },
  };
}

// 🔎 Utilidad para serializar fechas
function toISO(date) {
  return date instanceof Date ? date.toISOString() : date || null;
}

// Buscar por slug (incluye body para detalle)
export async function getPostBySlug(slug) {
  const rows = await sql`
    SELECT
      id,
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
      author,
      created_at
    FROM posts
    WHERE slug = ${slug}
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) return null;

  return {
    ...row,
    created_at: toISO(row.created_at),
    published_at: toISO(row.published_at),
    modified_at: toISO(row.modified_at),
  };
}

// Sitemap
export async function getAllPostsForSitemap() {
  const rows = await sql`
    SELECT slug, published_at, modified_at
    FROM posts
    WHERE slug IS NOT NULL AND slug <> ''
  `;

  return rows.map((row) => ({
    slug: row.slug,
    published_at: toISO(row.published_at),
    modified_at: toISO(row.modified_at),
  }));
}

// Buscar por URL
export async function getPostByUrl(url) {
  const rows = await sql`
    SELECT
      id,
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
      author,
      created_at
    FROM posts
    WHERE url = ${url}
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) return null;

  return {
    ...row,
    created_at: toISO(row.created_at),
    published_at: toISO(row.published_at),
    modified_at: toISO(row.modified_at),
  };
}

// Upsert por URL
export async function upsertPostByUrl(data) {
  const { url, slug, title, bodyHtml, excerpt, metaTitle, metaDescription, featuredImage, publishedAt, modifiedAt, author } = data;

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
    RETURNING
      id,
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
      author,
      created_at;
  `;

  const row = rows[0];
  return {
    ...row,
    created_at: toISO(row.created_at),
    published_at: toISO(row.published_at),
    modified_at: toISO(row.modified_at),
  };
}

// Búsqueda / listados
export async function searchPosts({ term = "", column = "title", limit = 12, random = false, exclude = [] }) {
  const allowedColumns = ["title", "slug", "excerpt", "url", "search"];
  const col = allowedColumns.includes(column) ? column : "title";

  const like = `%${term}%`;
  let rows = [];

  const overLimit = Math.ceil(limit * (exclude && exclude.length ? 2 : 1.5));

  // ⬇️ Importante: lo construimos como fragmento SQL para poder inyectarlo sin parámetros
  const orderClause = random ? sql`ORDER BY RANDOM()` : sql`ORDER BY published_at DESC NULLS LAST`;

  if (term) {
    if (col === "search") {
      rows = await sql`
        SELECT id, url, slug, title, excerpt, featured_image
        FROM posts
        WHERE (title ILIKE ${like} OR meta_description ILIKE ${like})
          AND excerpt IS NOT NULL
          AND featured_image IS NOT NULL
        ${orderClause}
        LIMIT ${overLimit}
      `;
    } else if (col === "title") {
      rows = await sql`
        SELECT id, url, slug, title, excerpt, featured_image
        FROM posts
        WHERE title ILIKE ${like}
          AND excerpt IS NOT NULL
          AND featured_image IS NOT NULL
        ${orderClause}
        LIMIT ${overLimit}
      `;
    } else if (col === "slug") {
      rows = await sql`
        SELECT id, url, slug, title, excerpt, featured_image
        FROM posts
        WHERE slug ILIKE ${like}
          AND excerpt IS NOT NULL
          AND featured_image IS NOT NULL
        ${orderClause}
        LIMIT ${overLimit}
      `;
    } else if (col === "excerpt") {
      rows = await sql`
        SELECT id, url, slug, title, excerpt, featured_image
        FROM posts
        WHERE excerpt ILIKE ${like}
          AND excerpt IS NOT NULL
          AND featured_image IS NOT NULL
        ${orderClause}
        LIMIT ${overLimit}
      `;
    } else if (col === "url") {
      rows = await sql`
        SELECT id, url, slug, title, excerpt, featured_image
        FROM posts
        WHERE url ILIKE ${like}
          AND excerpt IS NOT NULL
          AND featured_image IS NOT NULL
        ${orderClause}
        LIMIT ${overLimit}
      `;
    }
  } else {
    rows = await sql`
      SELECT id, url, slug, title, excerpt, featured_image
      FROM posts
      WHERE excerpt IS NOT NULL
        AND featured_image IS NOT NULL
      ${orderClause}
      LIMIT ${overLimit}
    `;
  }

  if (exclude && exclude.length) {
    rows = rows.filter((row) => {
      if (!row.slug) return true;
      return !exclude.some((prefix) => row.slug.startsWith(prefix));
    });
  }

  rows = rows.filter((row) => row.title && row.excerpt && row.featured_image);

  if (rows.length > limit) rows = rows.slice(0, limit);

  return rows;
}
