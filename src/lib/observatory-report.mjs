import project from "../../public/project.json" with {type: "json"};
import milestones from "./observatory-events.json" with {type: "json"};
import {getObservatory} from "./observatory.mjs";

export function observatoryReport() {
  const history = getObservatory();
  return {
    ...history,
    repository: project.repository,
    sampling: "last_first_parent_revision_per_active_utc_day",
    missing_value: null,
    metrics: {
      revisions: {de: "Projektstände", en: "Revisions"},
      claims: {de: "Aussagen im Register", en: "Registered claims", path: "public/knowledge/claims.json"},
      reviewed: {de: "Davon mit gültigem Prüfvermerk", en: "Of those, with a matching review", path: "public/knowledge/claims.json"},
      discovery: {de: "Literaturhinweise", en: "Literature leads", path: "public/research/stream.json"},
      criticism: {de: "KI-Kritikentwürfe", en: "AI critiques", path: "public/research/angriffe.json"}
    },
    events: milestones.map(event => ({
      ...event,
      source: project.repository + (event.kind === "issue" ? "/issues/" : "/pull/") + event.number
    }))
  };
}
