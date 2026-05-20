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

  document.querySelectorAll("header").forEach((el) => el.remove());
  document.querySelector("#jp-relatedposts")?.remove();
  document.querySelectorAll("div.entry-thumb").forEach((el) => el.remove());
  document.querySelectorAll("div.saboxplugin-wrap").forEach((el) => el.remove());
  document.querySelectorAll("div.sharedaddy").forEach((el) => el.remove());
  document.querySelectorAll("div.wp-block-group").forEach((el) => el.remove());
  document.querySelectorAll("footer").forEach((el) => el.remove());

  if (excerpt) {
    const normExcerpt = normalizeText(excerpt);
    const paragraphs = document.querySelectorAll("p");

    paragraphs.forEach((p) => {
      const normP = normalizeText(p.textContent);
      const hasRichContent = p.querySelector("a, img, iframe, video, audio");

      if (normP === normExcerpt && !hasRichContent) {
        p.remove();
      }
    });
  }

  document.querySelectorAll("br").forEach((br) => {
    const spacer = document.createElement("div");
    spacer.className = "spacer";
    br.replaceWith(spacer);
  });

  return document.body.innerHTML;
}
