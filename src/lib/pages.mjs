import deHome from "../generated/pages/de/index.html?raw";
import deAtlas from "../generated/pages/de/atlas.html?raw";
import deLib from "../generated/pages/de/bibliothek.html?raw";
import deReading from "../generated/pages/de/lesestueck-wahrheit.html?raw";
import deManifest from "../generated/pages/de/manifest.html?raw";
import deProof from "../generated/pages/de/pruefstand.html?raw";
import deMethod from "../generated/pages/de/methode.html?raw";
import deContribute from "../generated/pages/de/mitwirken.html?raw";
import enHome from "../generated/pages/en/index.html?raw";
import enAtlas from "../generated/pages/en/atlas.html?raw";
import enLib from "../generated/pages/en/bibliothek.html?raw";
import enReading from "../generated/pages/en/lesestueck-wahrheit.html?raw";
import enManifest from "../generated/pages/en/manifest.html?raw";
import enProof from "../generated/pages/en/pruefstand.html?raw";
import enMethod from "../generated/pages/en/methode.html?raw";
import enContribute from "../generated/pages/en/mitwirken.html?raw";
const pages={
de:{index:deHome,atlas:deAtlas,bibliothek:deLib,"lesestueck-wahrheit":deReading,manifest:deManifest,pruefstand:deProof,methode:deMethod,mitwirken:deContribute},
en:{index:enHome,atlas:enAtlas,bibliothek:enLib,"lesestueck-wahrheit":enReading,manifest:enManifest,pruefstand:enProof,methode:enMethod,mitwirken:enContribute}
};
export function getPage(lang,slug){const page=pages[lang]?.[slug];if(!page)throw Error("Unknown page "+lang+"/"+slug);return page;}
