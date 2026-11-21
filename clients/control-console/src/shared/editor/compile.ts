export function compileFiles(
  files: Record<string, string>,
  entryPoint: string,
  signal: AbortSignal,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('./compiler.worker.ts', import.meta.url),
      { type: 'module' },
    );
    const dispose = () => {
      worker.terminate();
      signal.removeEventListener('abort', abort);
      clearTimeout(timeout);
    };
    const abort = () => {
      dispose();
      reject(new DOMException('已取消', 'AbortError'));
    };
    const timeout = setTimeout(() => {
      dispose();
      reject(new Error('编译超过 30 秒，请减少源码或检查依赖。'));
    }, 30000);
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) {
      abort();
      return;
    }
    worker.onmessage = (
      event: MessageEvent<{ bundle?: string; error?: string }>,
    ) => {
      dispose();
      if (event.data.bundle) resolve(event.data.bundle);
      else reject(new Error(event.data.error ?? '编译失败'));
    };
    worker.onerror = (event) => {
      dispose();
      reject(new Error(event.message));
    };
    worker.postMessage({ files, entryPoint });
  });
}
