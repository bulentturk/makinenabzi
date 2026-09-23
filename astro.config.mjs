import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://makinenabzi.com',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
});
