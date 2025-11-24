// lib/getArticleContent.js
export default async function getArticleContent(url) {
  const res = await fetch(`http://localhost:4000/api/article?url=${encodeURIComponent(url)}`);

  if (!res.ok) {
    throw new Error(`Error en proxy: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  // data: { url, slug, title, bodyHtml, excerpt, featuredImage, ... }
  return data;
}
