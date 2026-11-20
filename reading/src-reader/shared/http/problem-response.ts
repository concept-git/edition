import type { Problem } from "../problem.ts";

export async function readProblem(response: Response): Promise<Problem> {
  let body: Record<string, unknown> = {};
  try {
    const parsed: unknown = await response.json();
    if (parsed && typeof parsed === "object")
      body = parsed as Record<string, unknown>;
  } catch {
    // 非 JSON 响应体：只保留状态码。
  }
  const text = (key: string) =>
    typeof body[key] === "string" && body[key] ? (body[key] as string) : null;
  return {
    status: response.status,
    code: text("code"),
    title: text("title"),
    detail: text("detail"),
    traceId: text("traceId"),
  };
}

export function retryAfterSeconds(response: Response): number | null {
  const value = Number(response.headers.get("retry-after"));
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function unavailableProblem(): Problem {
  return {
    status: 503,
    code: "upstream_unreachable",
    title: null,
    detail: null,
    traceId: null,
  };
}
