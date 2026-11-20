import type { ReadFailure } from "../problem.ts";
import {
  readProblem,
  retryAfterSeconds,
  unavailableProblem,
} from "./problem-response.ts";
import { UpstreamUnreachable } from "./reader-client.ts";

/** 把非成功响应翻译成失败意图；未识别的状态按不可用处理。 */
export async function failureFrom(response: Response): Promise<ReadFailure> {
  const problem = await readProblem(response);
  switch (response.status) {
    case 401:
      return { kind: "unauthorized", problem };
    case 403:
      return { kind: "forbidden", problem };
    case 404:
    case 422:
      return { kind: "missing", problem };
    default:
      return {
        kind: "unavailable",
        problem:
          response.status === 503 ? problem : { ...problem, status: 503 },
        retryAfter: retryAfterSeconds(response),
      };
  }
}

export function unreachable(error: unknown): ReadFailure | null {
  return error instanceof UpstreamUnreachable
    ? { kind: "unavailable", problem: unavailableProblem(), retryAfter: null }
    : null;
}
