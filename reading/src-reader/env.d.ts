/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** 由 app/middleware 装配：一次请求内共用的仓储实现。 */
    reader: import("./app/services.ts").ReaderServices;
    /** 页面路由写入；响应渲染完成后由 middleware 上报。 */
    pageEvent?: import("./features/analytics/index.ts").PageEvent | null;
  }
}
