import {
  createRootRoute,
  createRoute,
  createRouter,
  type ErrorComponentProps,
} from '@tanstack/react-router';
import { ConsoleApp } from './console-app';
const rootRoute = createRootRoute({
  component: ConsoleApp,
  validateSearch: (search: Record<string, unknown>) => search,
  errorComponent: RouteFailure,
});
const index = createRoute({ getParentRoute: () => rootRoute, path: '/' });
const resource = createRoute({ getParentRoute: () => rootRoute, path: '$' });
export const router = createRouter({
  routeTree: rootRoute.addChildren([index, resource]),
  basepath: '/console',
  defaultPreload: 'intent',
});
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
function RouteFailure({ error, reset }: ErrorComponentProps) {
  return (
    <section
      role="alert"
      className="mx-auto my-16 max-w-xl rounded-lg border p-6"
    >
      <h1 className="text-xl font-semibold">界面暂时不可用</h1>
      <p className="my-3 text-sm">
        当前请求未继续执行。请保留页面地址，重试或联系维护者。
      </p>
      <details className="my-4 text-sm">
        <summary>诊断信息</summary>
        <pre className="mt-2 whitespace-pre-wrap break-all">
          {error instanceof Error ? error.message : 'Unknown interface error'}
        </pre>
      </details>
      <button className="rounded-md border px-4 py-2 text-sm" onClick={reset}>
        重试加载界面
      </button>
    </section>
  );
}
