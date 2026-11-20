/** RFC 9457 problem+json 的最小可用形态；缺失字段一律为 null。 */
export interface Problem {
  status: number;
  code: string | null;
  title: string | null;
  detail: string | null;
  traceId: string | null;
}

/** Reader 以 HTTP 状态表达的失败结果；feature 据此表达导航意图。 */
export type ReadFailure =
  | { kind: "unauthorized"; problem: Problem }
  | { kind: "forbidden"; problem: Problem }
  | { kind: "missing"; problem: Problem }
  | { kind: "unavailable"; problem: Problem; retryAfter: number | null };
