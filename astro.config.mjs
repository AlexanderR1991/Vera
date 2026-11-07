import { defineConfig } from "astro/config";
export default defineConfig({
 site:"https://alexanderr1991.github.io",
 base:"/Vera",
 output:"static",
 trailingSlash:"always",
 // Explicit development-preview host; static production output is unaffected.
 server:{allowedHosts:["terminal.local"]},
 i18n:{locales:["de","en"],defaultLocale:"de",routing:{prefixDefaultLocale:true,redirectToDefaultLocale:false}}
});
