/// <reference lib="webworker" />
import { build, initialize } from 'esbuild-wasm';
import wasmURL from 'esbuild-wasm/esbuild.wasm?url';

const ready = initialize({ wasmURL, worker: false });
self.onmessage = async (
  event: MessageEvent<{ files: Record<string, string>; entryPoint: string }>,
) => {
  try {
    await ready;
    const { files, entryPoint } = event.data;
    const result = await build({
      entryPoints: [entryPoint],
      bundle: true,
      write: false,
      format: 'esm',
      target: 'es2022',
      plugins: [
        {
          name: 'fixed-source-files',
          setup(build) {
            build.onResolve({ filter: /.*/ }, (args) => {
              const base = args.importer
                ? args.importer.split('/').slice(0, -1)
                : [];
              const parts = args.path.startsWith('.')
                ? [...base, ...args.path.split('/')]
                : args.path.split('/');
              const normalized: string[] = [];
              for (const part of parts) {
                if (part === '..') normalized.pop();
                else if (part && part !== '.') normalized.push(part);
              }
              const path = normalized.join('/');
              const found = [
                path,
                `${path}.ts`,
                `${path}.tsx`,
                `${path}.js`,
                `${path}/index.ts`,
                `${path}/index.js`,
              ].find((candidate) => Object.hasOwn(files, candidate));
              if (!found)
                return {
                  errors: [
                    {
                      text: `依赖 ${args.path} 不在固定源码中；请提供锁定的本地源码。工作台不拉取远程依赖。`,
                    },
                  ],
                };
              return { path: found, namespace: 'fixed' };
            });
            build.onLoad({ filter: /.*/, namespace: 'fixed' }, (args) => ({
              contents: files[args.path],
              loader: args.path.endsWith('.tsx')
                ? 'tsx'
                : args.path.endsWith('.ts')
                  ? 'ts'
                  : args.path.endsWith('.json')
                    ? 'json'
                    : 'js',
            }));
          },
        },
      ],
    });
    self.postMessage({ bundle: result.outputFiles[0].text });
  } catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : '编译失败',
    });
  }
};
