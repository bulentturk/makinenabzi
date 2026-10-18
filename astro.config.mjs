import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://makinenabzi.com',
  integrations: [react()],
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
});
