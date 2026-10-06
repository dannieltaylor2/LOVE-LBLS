import { defineConfig } from 'astro/config';
const pages = process.env.GITHUB_PAGES === 'true';
export default defineConfig({
  site: 'https://dannieltaylor2.github.io',
  base: pages ? '/LOVE-LBLS/' : '/',
  devToolbar: { enabled: false },
});
