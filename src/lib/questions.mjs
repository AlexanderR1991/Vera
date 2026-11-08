// Deterministic, advisory question graph. No model calls or publishing rights.
// Similarity is lexical only: a suggestion is never evidence of identity.
import {impactPaths} from "./impact-paths.mjs";

export const relationTypes = Object.freeze(["subquestion_of","depends_on","related_to","alternative_framing","possible_duplicate"]);
const questionTypes = new Set(["empirical","formal","normative","interpretive","conceptual","methodological"]);
const bilingual = x => x && ["de","en"].every(lang => typeof x[lang] === "string" && x[lang].trim().length > 0);
const date = x => typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x) && !Number.isNaN(Date.parse(x));
const validURL = x => {try {return new URL(x).protocol === "https:";} catch {return false;}};

// Static publication contract. AI candidates are not valid public records.
// This checks shape and references, not factual truth or reviewer identity.
export function validateQuestionAtlas(data, claims = [], knownTopics = []) {
 const errors = [], ids = new Set(), claimIds = new Set(claims.map(c => c.id));
 const topicIds = new Set(knownTopics.map(t => t.id));
 if (data?.schema_version !== 1) errors.push("Unsupported question atlas schema");
 if (!date(data?.updated_at)) errors.push("Missing atlas update date");
 if (!Array.isArray(data?.questions) || data.questions.length === 0) return [...errors,"Questions must be a nonempty array"];
 const relations = Array.isArray(data?.relations) ? data.relations : [];
 if (!Array.isArray(data?.relations)) errors.push("Relations must be an array");
 for (const q of data.questions) {
  if (!q || typeof q !== "object") {errors.push("Invalid question object");continue;}
  const fail = msg => errors.push(`${q.id || "<missing id>"}: ${msg}`);
  if (!/^Q-\d{3,}$/.test(q.id || "") || ids.has(q.id)) fail("invalid or duplicate identifier");
  ids.add(q.id);
  if (!Number.isInteger(q.version) || q.version < 1) fail("invalid version");
  if (!bilingual(q.question)) fail("missing bilingual question");
  if (!questionTypes.has(q.question_type)) fail("invalid question type");
  if (!["editorial_draft","human_submission"].includes(q.origin)) fail("AI drafts cannot enter the public atlas");
  if (!["unreviewed","human_curated"].includes(q.review_status)) fail("invalid review status");
  if (q.review_status === "human_curated" && !(q.human_review && typeof q.human_review.reviewer === "string" && q.human_review.reviewer.trim() && date(q.human_review.date))) fail("human curation requires a documented reviewer and date");
  if (!validURL(q.source_url)) fail("missing public source URL");
  if (!Array.isArray(q.claim_ids) || !q.claim_ids.length || new Set(q.claim_ids).size !== q.claim_ids.length || q.claim_ids.some(id => !claimIds.has(id))) fail("unknown, empty or duplicate claim links");
  if (!Array.isArray(q.topics) || !q.topics.length || new Set(q.topics).size !== q.topics.length || (knownTopics.length && q.topics.some(id => !topicIds.has(id)))) fail("invalid topic references");
 }
 const seen = new Set(), parentGraph = new Map();
 for (const edge of relations) {
  if (!edge || typeof edge !== "object") {errors.push("Invalid relation");continue;}
  const key = `${edge.from}:${edge.type}:${edge.to}`;
  if (!ids.has(edge.from) || !ids.has(edge.to) || edge.from === edge.to) errors.push(`${key}: missing endpoint or self link`);
  if (!relationTypes.includes(edge.type) || !bilingual(edge.reason)) errors.push(`${key}: invalid type or missing reason`);
  if (seen.has(key)) errors.push(`${key}: repeated relation`);
  seen.add(key);
  if (edge.type === "subquestion_of") {
   if (!parentGraph.has(edge.from)) parentGraph.set(edge.from,[]);
   parentGraph.get(edge.from).push(edge.to);
  }
 }
 const visited = new Set(), active = new Set();
 const visit = id => {
  if (active.has(id)) return true;
  if (visited.has(id)) return false;
  visited.add(id);active.add(id);
  for (const next of parentGraph.get(id) ?? []) if (visit(next)) return true;
  active.delete(id);return false;
 };
 if ([...ids].some(visit)) errors.push("Cycle in subquestion hierarchy");
 return errors;
}

// From a changed claim, follow direct citations and the reverse of depends_on.
// The published atlas is validated by validateQuestionAtlas. An unreferenced
// claim yields no candidates. Equal-length paths are resolved by ID order.
export function questionReviewImpact(atlas, claimId) {
 const dependents = new Map(atlas.questions.map(q => [q.id, []]));
 for (const {from, to, type} of atlas.relations) {
  if (type === "depends_on") dependents.get(to).push(from);
 }

 const root = Symbol("changed claim");
 dependents.set(root, atlas.questions.filter(q => q.claim_ids.includes(claimId)).map(q => q.id));
 return impactPaths(dependents, root, claimId);
}

export function connectionsForQuestion(atlas, id) {
 const byId = new Map((atlas.questions ?? []).map(q => [q.id,q]));
 return (atlas.relations ?? []).filter(edge => edge.from === id || edge.to === id)
  .map(edge => ({question:byId.get(edge.from === id ? edge.to : edge.from),
                  type:edge.type, direction:edge.from === id ? "outgoing" : "incoming",
                  reason:edge.reason}))
  .filter(link => link.question);
}

const normalized = value => String(value).normalize("NFKC").toLocaleLowerCase()
 .replace(/[^\p{L}\p{N}]+/gu," ").trim().replace(/\s+/g," ");
const terms = value => new Set(normalized(value).split(" ").filter(word => word.length > 2));
function similarity(left, right) {
 const a = terms(left), b = terms(right);
 if (!a.size || !b.size) return 0;
 const intersection = [...a].filter(word => b.has(word)).length;
 return intersection / (a.size + b.size - intersection);
}

// Takes at most 50 incoming draft questions; no network, writes, merging or comments.
// Even exact duplicates remain review suggestions, never automatic deletions.
export function triageQuestionCandidates(candidates, atlas, lang = "de") {
 if (!Array.isArray(candidates) || candidates.length > 50) throw Error("Expected at most 50 candidates per run");
 if (!["de","en"].includes(lang)) throw Error("Unsupported language");
 const existing = (atlas.questions ?? []).map(q => ({id:q.id, text:q.question[lang]}));
 const ids = new Set();
 return candidates.map(candidate => {
  if (!candidate || typeof candidate.id !== "string" || !/^C-[\w-]{1,60}$/.test(candidate.id) ||
      ids.has(candidate.id) || candidate.origin !== "ai_draft" ||
      !bilingual(candidate.question) || candidate.question.de.length > 600 || candidate.question.en.length > 600) {
   throw Error("Invalid candidate id, origin, text or duplicate");
  }
  ids.add(candidate.id);
  const text = candidate.question[lang], exact = existing.find(q => normalized(q.text) === normalized(text));
  const suggestions = existing.map(q => ({id:q.id, score:similarity(text,q.text)}))
   .filter(q => q.score >= 0.45).sort((a,b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0,3);
  const result = {candidate_id:candidate.id, review:exact ? "possible_duplicate" : "needs_human_triage",
                  exact_match_id:exact?.id ?? null, lexical_neighbors:suggestions};
  // Same-run matching is advisory, too; candidates are never added to the atlas.
  existing.push({id:candidate.id,text});
  return result;
 });
}
