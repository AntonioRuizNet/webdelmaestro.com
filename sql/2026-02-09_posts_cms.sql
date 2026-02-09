-- Ejecuta este script en pgAdmin contra la BD de webdelmaestro.
-- Objetivo: habilitar borradores/publicación y garantizar slug único.

-- 1) Añadir flag de publicación (si no existe)
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;

-- 2) Backfill (por si quieres que los que NO tengan published_at queden como borrador)
--    Si prefieres mantener todo publicado, puedes omitir este UPDATE.
UPDATE posts
SET is_published = CASE WHEN published_at IS NULL THEN false ELSE true END
WHERE is_published IS NULL;

-- 3) Comprobar duplicados de slug antes de crear el índice UNIQUE
--    (Si devuelve filas, tendrás que resolverlos manualmente antes de ejecutar el índice)
SELECT slug, COUNT(*) AS n
FROM posts
WHERE slug IS NOT NULL AND slug <> ''
GROUP BY slug
HAVING COUNT(*) > 1;

-- 4) Crear índice único en slug (si no hay duplicados)
CREATE UNIQUE INDEX IF NOT EXISTS posts_slug_unique ON posts (slug);

-- 5) (Opcional) Índice para listados por estado
CREATE INDEX IF NOT EXISTS posts_is_published_idx ON posts (is_published);
