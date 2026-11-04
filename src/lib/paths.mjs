export const base=import.meta.env.BASE_URL;
export const locales=["de","en"];
export const slugs=["atlas","bibliothek","lesestueck-wahrheit","manifest","pruefstand","methode","mitwirken"];
export const pathFor=(lang,slug="index")=>base+lang+"/"+(slug==="index"?"":slug+"/");
export const absoluteFor=(lang,slug="index")=>"https://alexanderr1991.github.io"+pathFor(lang,slug);
