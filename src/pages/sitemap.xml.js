import {cards} from "../lib/play-cards.mjs";
import {locales,slugs,absoluteFor} from "../lib/paths.mjs";
export function GET(){
 const urls=[new URL(import.meta.env.BASE_URL, import.meta.env.SITE).href,
  ...locales.flatMap(lang=>["index",...cards.map(card=>card.slug),"werkstatt","erkenntnisnavigator","schnittmengen","projektstatus","projektobservatorium","impressum","datenschutz","kunst-und-erkenntnis","mission","regelkreis","ki-und-mensch","kollektive-moral","baum-des-wissens","aussagen","forum","fragen-und-ki-prompt",...slugs,"erkenntnishorizont","esoterik-und-mathematik","warum-liebe-wirkt","politik-die-dem-menschen-dient","forschungsstrom","angriffsschwarm","gegenprobe-01","bruecken-zwischen-den-religionen","militaer-und-verantwortung","medizin","ernaehrung-und-verantwortung"].map(slug=>absoluteFor(lang,slug)))];
 const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(u=>'<url><loc>'+u+'</loc></url>').join("\n")+"\n</urlset>";
 return new Response(xml,{headers:{"Content-Type":"application/xml; charset=utf-8"}});
}
