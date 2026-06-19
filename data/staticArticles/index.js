import fs from "fs";
import path from "path";

const BASE_STATIC_PREFIX = "fichas";
const STATIC_DATE = "2026-06-16T00:00:00.000Z";
const TOPICS_DIR = path.join(process.cwd(), "data", "staticArticles", "topics");

function getTopicFiles() {
  if (!fs.existsSync(TOPICS_DIR)) return [];

  return fs
    .readdirSync(TOPICS_DIR)
    .filter((file) => file.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b, "es"))
    .map((file) => {
      const filePath = path.join(TOPICS_DIR, file);
      const content = fs.readFileSync(filePath, "utf8");
      return {
        ...JSON.parse(content),
        __filename: file,
      };
    })
    .filter((topicFile) => topicFile?.topic?.slug && Array.isArray(topicFile?.articles));
}

function normalizeArticle(topicFile, article) {
  const topic = topicFile.topic;
  const slug = `${BASE_STATIC_PREFIX}/${topic.slug}/${article.slug}`;
  const searchableText = [article.title, article.excerpt, article.metaDescription, topic.name, ...(article.keywords || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return {
    id: `static-${slug}`,
    url: `https://webdelmaestro.com/${slug}`,
    slug,
    title: article.title,
    body: "",
    excerpt: article.excerpt,
    meta_title: article.title,
    meta_description: article.metaDescription || article.excerpt,
    featured_image: article.featuredImage,
    published_at: article.publishedAt || STATIC_DATE,
    modified_at: article.modifiedAt || STATIC_DATE,
    author: "Web del Maestro",
    created_at: article.publishedAt || STATIC_DATE,
    source: "static",
    staticArticle: {
      topic,
      sections: article.sections || [],
      worksheets: article.worksheets || [],
      keywords: article.keywords || [],
    },
    __searchableText: searchableText,
  };
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function normalizeTopic(topicFile, { articlesPerTopic = null, random = false } = {}) {
  const topic = topicFile.topic;
  const articles = (topicFile.articles || [])
    .filter((article) => article?.slug && article?.title)
    .map((article) => normalizeArticle(topicFile, article));

  const selectedArticles = random ? shuffle(articles) : articles;
  const visibleArticles = typeof articlesPerTopic === "number" ? selectedArticles.slice(0, articlesPerTopic) : selectedArticles;

  return {
    id: `static-topic-${BASE_STATIC_PREFIX}/${topic.slug}`,
    slug: `${BASE_STATIC_PREFIX}/${topic.slug}`,
    name: topic.name,
    title: topic.name,
    description:
      topic.description || `Recopilación de fichas para imprimir sobre ${String(topic.name || "este tema").toLowerCase()}.`,
    articles: visibleArticles,
    totalArticles: articles.length,
    requestedArticlesPerTopic: articlesPerTopic,
    source: "static-topic",
  };
}

export function getAllStaticArticles() {
  return getTopicFiles().flatMap((topicFile) =>
    (topicFile.articles || [])
      .filter((article) => article?.slug && article?.title)
      .map((article) => normalizeArticle(topicFile, article)),
  );
}

export function getAllStaticTopics(options = {}) {
  return getTopicFiles().map((topicFile) => normalizeTopic(topicFile, options));
}

export function getStaticTopicBySlug(slug) {
  const cleanSlug = String(slug || "").replace(/^\/+/, "");
  const expectedPrefix = `${BASE_STATIC_PREFIX}/`;

  if (!cleanSlug.startsWith(expectedPrefix)) return null;

  const topicSlug = cleanSlug.slice(expectedPrefix.length);
  const topicFile = getTopicFiles().find((item) => item?.topic?.slug === topicSlug);

  return topicFile ? normalizeTopic(topicFile) : null;
}

export function getStaticTopicsForHome({ limit = 6, articlesPerTopic = 2, randomTopics = false, randomArticles = true } = {}) {
  let topics = getAllStaticTopics({ articlesPerTopic, random: randomArticles }).filter((topic) => topic.totalArticles > 0);

  if (randomTopics) topics = shuffle(topics);

  return topics.slice(0, limit);
}

export function getStaticArticleBySlug(slug) {
  const cleanSlug = String(slug || "").replace(/^\/+/, "");
  return getAllStaticArticles().find((article) => article.slug === cleanSlug) || null;
}

export function getStaticArticlesForSitemap() {
  const articleUrls = getAllStaticArticles().map((article) => ({
    slug: article.slug,
    published_at: article.published_at,
    modified_at: article.modified_at,
  }));

  const topicUrls = getAllStaticTopics().map((topic) => ({
    slug: topic.slug,
    published_at: STATIC_DATE,
    modified_at: STATIC_DATE,
  }));

  return [...topicUrls, ...articleUrls];
}

function matchesExclude(slug, exclude = []) {
  if (!exclude || !exclude.length) return false;
  return exclude.some((prefix) => slug.startsWith(prefix));
}

export function searchStaticArticles({ term = "", column = "title", limit = 12, random = false, exclude = [] } = {}) {
  const cleanTerm = String(term || "")
    .trim()
    .toLowerCase();

  let articles = getAllStaticArticles().filter((article) => !matchesExclude(article.slug, exclude));

  if (cleanTerm) {
    articles = articles.filter((article) => {
      if (column === "title") return article.title.toLowerCase().includes(cleanTerm);
      if (column === "slug") return article.slug.toLowerCase().includes(cleanTerm);
      if (column === "excerpt")
        return String(article.excerpt || "")
          .toLowerCase()
          .includes(cleanTerm);
      if (column === "url")
        return String(article.url || "")
          .toLowerCase()
          .includes(cleanTerm);
      return article.__searchableText.includes(cleanTerm);
    });
  }

  if (random) articles = shuffle(articles);

  return articles.slice(0, limit).map(({ __searchableText, staticArticle, body, ...article }) => ({
    ...article,
    body,
    staticArticle,
  }));
}

export function getStaticTopicsList() {
  return getTopicFiles().map((topicFile) => ({
    slug: `${BASE_STATIC_PREFIX}/${topicFile.topic.slug}`,
    name: topicFile.topic.name,
  }));
}
