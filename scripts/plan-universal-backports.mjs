// Read-only route plan for reviewed findings. Never edits a domain page or merges a PR.
import catalogue from "../public/knowledge/universal-questions.v1.json" with {type:"json"};
import ledger from "../public/knowledge/universal-findings.v1.json" with {type:"json"};
import {findingsForRoute} from "../src/lib/universal-questions.mjs";
import {ui} from "../src/lib/ui.mjs";
const routes=[...new Set(catalogue.questions.flatMap(q=>q.return_routes))].sort();
const plan=routes.flatMap(route=>findingsForRoute(catalogue,ledger,route).map(f=>({
  route,question_id:f.question_id,finding_id:f.id,review_url:f.review_url,
  route_de:"https://alexanderr1991.github.io/Vera/de/"+route+"/",
  route_en:"https://alexanderr1991.github.io/Vera/en/"+route+"/",
  label_de:ui.de.titles[route],label_en:ui.en.titles[route],
  action:"already projected by UniversalQuestionsContext; editorial prose changes require a separate reviewed PR"
})));
console.log(JSON.stringify({status:plan.length?"reviewed_findings_ready_for_domain_review":"no_reviewed_findings_to_backport",
  plan,policy:"Never convert lexical scan suggestions or open questions into accepted findings automatically."},null,2));
