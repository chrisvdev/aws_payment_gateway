// @ts-check
import { defineConfig, envField } from 'astro/config';
import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({
  integrations: [preact()],
  env: {
    schema: {
      CLOUDFLARE_SITE_KEY: envField.string({ context: "client", access: "public" }),
    }
  },
  vite: {
    envDir: "../"
  }
});