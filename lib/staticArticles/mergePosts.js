export function mergePostsWithDbPriority(dbPosts = [], staticPosts = [], limit = 12, random = false) {
  let merged = [...dbPosts];

  if (random) {
    merged = merged.sort(() => Math.random() - 0.5);
  }

  return merged.slice(0, limit);
}
