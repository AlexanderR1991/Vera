import {createHash} from "node:crypto";

const present=value=>typeof value==="string"&&value.trim().length>0;
const bilingual=value=>!!value&&present(value.de)&&present(value.en);
export function hasHumanReviewRecord(review){
 return !!review&&present(review.reviewer)&&typeof review.date==="string"&&
  /^\d{4}-\d{2}-\d{2}$/.test(review.date)&&!Number.isNaN(Date.parse(review.date))&&
  bilingual(review.method)&&bilingual(review.decision);
}

// The register is JSON. Object order is irrelevant; array order is retained.
function canonicalJSON(value){
 if(Array.isArray(value))return `[${value.map(canonicalJSON).join(",")}]`;
 if(value&&typeof value==="object")return `{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${canonicalJSON(value[key])}`).join(",")}}`;
 return JSON.stringify(value);
}

// Bind a review to the complete claim snapshot, in both languages. Review
// metadata and workflow status are excluded so that recording a review or
// marking it disputed does not change the content it refers to.
// This detects stale references; it does not authenticate a reviewer.
export function claimReviewFingerprint(claim){
 const {human_review,review_status,...snapshot}=claim;
 return createHash("sha256").update(canonicalJSON(snapshot)).digest("hex");
}

export function reviewMatchesClaim(claim){
 const review=claim.human_review;
 return hasHumanReviewRecord(review)&&Number.isInteger(review.claim_version)&&review.claim_version>0&&review.claim_version===claim.version&&
  typeof review.content_sha256==="string"&&
  /^[a-f0-9]{64}$/.test(review.content_sha256)&&
  review.content_sha256===claimReviewFingerprint(claim);
}
