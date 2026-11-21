import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

const upstream = process.env.EDITION_CONTROL_ORIGIN ?? 'http://127.0.0.1:8094';
export default defineConfig({
  base: '/console/',
  preview: { allowedHosts: ['console.acme.test'] },
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: {
    rolldownOptions: {
      // React Compiler is not enabled; its opt-out directive has no runtime meaning.
      onwarn(warning, handler) {
        if (
          warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
          warning.message.includes('use no memo') &&
          warning.message.includes('react-compiler-runtime')
        )
          return;
        handler(warning);
      },
      output: {
        strictExecutionOrder: true,
        codeSplitting: {
          maxSize: 350000,
          includeDependenciesRecursively: false,
          groups: [
            {
              name: 'react-runtime',
              test: /\/node_modules\/(?:react-dom|react|scheduler)\//,
            },
            {
              name: 'routing',
              test: /\/node_modules\/@tanstack\/(?:react-router|router-core|history)\//,
            },
            {
              name: 'forms',
              test: /\/node_modules\/(?:react-hook-form|@hookform|zod)\//,
            },
            {
              name: 'plate-runtime',
              test: /\/node_modules\/(?:@platejs\/(?:core|slate)|slate[^/]*|platejs)\//,
            },
            {
              name: 'plate-features',
              test: /\/node_modules\/@platejs\/(?:table|list|basic-nodes|markdown|link|code-block)\//,
            },
            {
              name: 'codemirror-core',
              test: /\/node_modules\/@codemirror\/(?:view|state|commands|language|search|autocomplete|lint)\//,
            },
            {
              name: 'codemirror-languages',
              test: /\/node_modules\/@codemirror\/lang-[^/]+\//,
            },
            {
              name: 'markdown-parsers',
              test: /\/node_modules\/(?:micromark[^/]*|mdast[^/]*|hast[^/]*|remark[^/]*|rehype[^/]*|unified|vfile[^/]*|unist[^/]*|parse5|acorn[^/]*|estree[^/]*|character-entities[^/]*|decode-named-character-reference|property-information|html-void-elements|ccount|markdown-[^/]*|trim-[^/]*|bail|trough)\//,
            },
          ],
        },
      },
    },
  },
  server: {
    port: 4180,
    strictPort: true,
    proxy: Object.fromEntries(
      ['/api', '/auth', '/admin', '/ops', '/audit', '/stats', '/webhooks'].map(
        (path) => [path, { target: upstream, changeOrigin: false }],
      ),
    ),
  },
});
