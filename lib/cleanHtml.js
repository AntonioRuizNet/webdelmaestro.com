import { JSDOM } from "jsdom";

function normalizeText(str) {
  return (str || "")
    .replace(/\u00a0/g, " ") // NBSP → espacio normal
    .replace(/\s+/g, " ") // colapsar espacios
    .trim();
}

export function cleanHtml(html, excerpt) {
  if (!html) return "";

  const dom = new JSDOM(html);
  const document = dom.window.document;

  // 1️⃣ Eliminar todos los <header>
  document.querySelectorAll("header").forEach((el) => el.remove());

  // 2️⃣ Eliminar #jp-relatedposts
  const related = document.querySelector("#jp-relatedposts");
  if (related) related.remove();

  // 3️⃣ Eliminar div.saboxplugin-wrap
  document.querySelectorAll("div.saboxplugin-wrap").forEach((el) => el.remove());

  // 4️⃣ Eliminar div.sharedaddy
  document.querySelectorAll("div.sharedaddy").forEach((el) => el.remove());

  // 5️⃣ Eliminar div.wp-block-group
  document.querySelectorAll("div.wp-block-group").forEach((el) => el.remove());

  // 6️⃣ Eliminar cualquier <footer>
  document.querySelectorAll("footer").forEach((el) => el.remove());

  // 7️⃣ Eliminar el <p> que coincide con el excerpt
  if (excerpt) {
    const normExcerpt = normalizeText(excerpt);
    const paragraphs = document.querySelectorAll("p");

    paragraphs.forEach((p) => {
      const normP = normalizeText(p.textContent);
      if (normP === normExcerpt) {
        p.remove();
      }
    });
  }

  // 8️⃣ Convertir <br> en separadores controlados
  document.querySelectorAll("br").forEach((br) => {
    const spacer = document.createElement("div");
    spacer.className = "spacer";
    br.replaceWith(spacer);
  });

  return document.body.innerHTML;
}
