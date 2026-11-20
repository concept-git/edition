/** 真实后端源（e2e 一律打真服务，MSW 只服务开发与组件测试）。 */
export const backendOrigin = process.env.E2E_BACKEND_ORIGIN ?? 'http://localhost:8081';

/** 管理 API 来源；直接打 /auth 的接口必须带它，否则被当跨站请求拒掉。 */
export const browserOrigin = process.env.E2E_BROWSER_ORIGIN ?? 'http://localhost:4176';

/** E2E 邮箱的 Mailpit HTTP API；SMTP 由被测后端使用。 */
export const mailpitOrigin = process.env.E2E_MAILPIT_ORIGIN ?? 'http://localhost:8025';

/**
 * 边缘入口（明文 HTTP）：阅读页面、/api/content/*、/_auth/* 都从这里进，
 * 路由由 Caddy 按 ADR-0035 分给阅读前端、Reader 与 Control。
 */
export const deliveryOrigin = process.env.E2E_DELIVERY_ORIGIN ?? 'http://localhost:8097';

/** Reader 自身（纯 JSON）：只用于不经边缘的探活与契约，如 /healthz。 */
export const readerOrigin = process.env.E2E_CONTENT_ORIGIN ?? 'http://localhost:8095';
