// lib/db.js
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// 🟢 Utilidad para serializar fechas
function toISO(date) {
  return date instanceof Date ? date.toISOString() : date || null;
}

// Buscar por slug (solo lo necesario, pero incluye body para el detalle)
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

// 🔹 NUEVA FUNCIÓN: obtener todos los posts para el sitemap
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

// Buscar por URL (detalle: sí necesita body)
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

// 🔥 nuevo: upsert por URL
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

/**
 * BÚSQUEDA / LISTADOS
 *
 * Cambios importantes:
 *  - ❌ NO devolvemos `body` → baja muchísimo el tráfico.
 *  - ✅ Usamos `random` sólo si se pide; si no, ordenamos por fecha.
 *  - ✅ Reducimos el LIMIT de "sobre-muestreo" (antes limit*3).
 *  - ✅ Permitimos búsqueda en title/meta_description, slug, excerpt, url.
 *  - ⚠️ NO buscamos en body por defecto (es lo más caro); sólo si lo necesitas de verdad.
 */
export async function searchPosts({
  term = "",
  column = "title",
  limit = 12,
  random = false,
  exclude = [], // ← prefijos a excluir, ej: ["educacion/"]
}) {
  // He quitado "body" de las columnas permitidas para no hacer ILIKE sobre textos enormes.
  const allowedColumns = ["title", "slug", "excerpt", "url", "search"];
  const col = allowedColumns.includes(column) ? column : "title";

  const like = `%${term}%`;
  let rows = [];

  // Factor de sobre-muestreo para poder excluir y seguir llegando al límite.
  const overLimit = limit * (exclude && exclude.length ? 2 : 1.5);

  // 🔹 Utilidad para construir el ORDER BY
  const orderClause = random ? sql`ORDER BY RANDOM()` : sql`ORDER BY published_at DESC NULLS LAST`;

  if (term) {
    if (col === "search") {
      // 🔍 title + meta_description
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
    // Listados genéricos (sin término)
    rows = await sql`
      SELECT id, url, slug, title, excerpt, featured_image
      FROM posts
      WHERE excerpt IS NOT NULL
        AND featured_image IS NOT NULL
      ${orderClause}
      LIMIT ${overLimit}
    `;
  }

  // 2) Excluir en JS los slugs que empiecen por alguno de los prefijos
  if (exclude && exclude.length) {
    rows = rows.filter((row) => {
      if (!row.slug) return true;
      return !exclude.some((prefix) => row.slug.startsWith(prefix));
    });
  }

  // 3) Omitir posts incompletos (ya no dependemos de `body`)
  rows = rows.filter((row) => {
    return row.title && row.excerpt && row.featured_image;
  });

  // 4) Recortar al límite final
  if (rows.length > limit) {
    rows = rows.slice(0, limit);
  }

  return rows;
}
