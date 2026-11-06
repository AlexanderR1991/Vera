import {reviewMatchesClaim} from "./claims.mjs";

// Build-time status aggregation. Keep this separate from browser worksheet
// utilities: checking the snapshot fingerprint uses Node's crypto module.
export function summarizeProject(registry, topics, discovery, criticism) {
  const claims = registry.claims;
  const stream = data => ({items: Array.isArray(data.items) ? data.items.length : 0, updated_at: data.updated_at || null});
  return {
    claims: claims.length,
    reviewed: claims.filter(claim => claim.review_status === "reviewed" && reviewMatchesClaim(claim)).length,
    topics: topics.length,
    drafts: topics.filter(topic => topic.state === "draft").length,
    proposals: topics.filter(topic => topic.state === "proposed").length,
    open: topics.filter(topic => topic.state === "open").length,
    discovery: stream(discovery),
    criticism: stream(criticism)
  };
}
