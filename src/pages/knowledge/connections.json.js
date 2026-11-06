import {connections} from "../../lib/navigator.mjs";

// Public editorial data only. Personal questions and condition answers never
// reach this build-time endpoint.
export function GET() {
  return new Response(JSON.stringify({
    schema_version: 1,
    status: "editorial_drafts",
    matching: "local_terms_and_cue_pairs",
    connections
  }, null, 2), {headers: {"Content-Type": "application/json; charset=utf-8"}});
}
