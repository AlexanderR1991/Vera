import {locales,slugs,absoluteFor} from "../lib/paths.mjs";
export function GET(){
 const urls=["https://alexanderr1991.github.io/grundtext-des-wirklichen/",
  ...locales.flatMap(lang=>["index",...slugs,"fragen-und-ki-prompt","erkenntnishorizont","warum-liebe-wirkt","politik-die-dem-menschen-dient","forschungsstrom","angriffsschwarm","bruecken-zwischen-den-religionen","militaer-und-verantwortung","ernaehrung-und-verantwortung"].map(slug=>absoluteFor(lang,slug)))];
 const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(u=>'<url><loc>'+u+'</loc></url>').join("\n")+"\n</urlset>";
 return new Response(xml,{headers:{"Content-Type":"application/xml; charset=utf-8"}});
}
