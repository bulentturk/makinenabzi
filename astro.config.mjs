import { defineConfig } from 'astro/config';

const customSite = process.env.SITE_URL?.trim();

export default defineConfig({
  site: customSite || 'https://bulentturk.github.io',
  base: customSite ? undefined : '/makinenabzi',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
});
