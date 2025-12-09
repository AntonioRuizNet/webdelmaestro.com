// pages/sitemap.xml.js
import { getAllPostsForSitemap } from "@/lib/db";

const BASE_URL = "https://webdelmaestro.com";

function generateSiteMap(posts) {
  const urls = posts
    .map((post) => {
      const slug = String(post.slug || "").replace(/^\/+/, ""); // quitamos / inicial si lo hubiera

      const lastDate = post.modified_at || post.published_at || new Date().toISOString();

      const lastmod = new Date(lastDate).toISOString();

      return `
  <url>
    <loc>${BASE_URL}/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join("");

  // Home incluida también en el sitemap
  const nowIso = new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${nowIso}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${urls}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  const posts = await getAllPostsForSitemap();

  const sitemap = generateSiteMap(posts);

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

// No renderiza nada en React, solo sirve el XML
export default function SiteMap() {
  return null;
}
