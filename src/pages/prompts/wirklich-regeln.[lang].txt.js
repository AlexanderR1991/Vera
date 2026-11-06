import {rulePack} from "../../lib/rule-pack.mjs";
import {locales} from "../../lib/paths.mjs";

export function getStaticPaths() {
  return locales.map(lang => ({params: {lang}}));
}

export function GET({params}) {
  return new Response(rulePack(params.lang), {headers: {"Content-Type": "text/plain; charset=utf-8"}});
}
