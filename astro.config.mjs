import { defineConfig } from "astro/config";
export default defineConfig({
 site:"https://alexanderr1991.github.io",
 base:"/grundtext-des-wirklichen",
 output:"static",
 trailingSlash:"always",
 i18n:{locales:["de","en"],defaultLocale:"de",routing:{prefixDefaultLocale:true,redirectToDefaultLocale:false}}
});
