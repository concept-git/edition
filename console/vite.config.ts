import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type ProxyOptions } from 'vite';

declare const process: { env: Record<string, string | undefined> };

const controlOrigin = process.env.EDITION_CONTROL_ORIGIN ?? 'http://127.0.0.1:8081';

function controlProxy(target: string): ProxyOptions {
  return {
    target,
    changeOrigin: true,
    configure(proxy) {
      const server = proxy as unknown as {
        on: (
          event: 'error',
          handler: (error: unknown, req: unknown, res: { headersSent?: boolean; destroy: () => void }) => void
        ) => void;
      };
      server.on('error', (_error, _req, res) => {
        if (!res.headersSent) res.destroy();
      });
    }
  };
}

export default defineConfig(async () => ({
  plugins: [
    tailwindcss(),
    ...(await sveltekit({
      preprocess: vitePreprocess(),
      adapter: adapter(),
      paths: { relative: false }
    }))
  ],
  server: {
    proxy: {
      '/auth': controlProxy(controlOrigin),
      '/api': controlProxy(controlOrigin),
      '/admin': controlProxy(controlOrigin),
      '/ops': controlProxy(controlOrigin),
      '/audit': {
        ...controlProxy(controlOrigin),
        bypass(req) {
          const accept = req.headers.accept;
          if (typeof accept === 'string' && accept.includes('text/html')) return req.url;
        }
      },
      '/webhooks': controlProxy(controlOrigin),
      '/stats': controlProxy(controlOrigin)
    }
  }
}));
