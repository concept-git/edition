export interface PageEvent {
  kind: "pv" | "notfound";
  path: string;
  /** 仅来源域名，不含路径与查询。 */
  referrer: string | null;
}

/** 仓储契约：向 Reader 上报；失败由用例吞掉。 */
export interface EventGateway {
  send(event: PageEvent): Promise<void>;
}

export function referrerDomain(
  referer: string | null,
  ownHost: string,
): string | null {
  if (!referer) return null;
  try {
    const host = new URL(referer).host;
    return host && host !== ownHost ? host : null;
  } catch {
    return null;
  }
}

/** 只有成功渲染的页面计 pv，页面缺失计 notfound，其余结果不上报。 */
export function eventFor(
  outcome: "article" | "missing" | string,
  path: string,
  referer: string | null,
  ownHost: string,
): PageEvent | null {
  const referrer = referrerDomain(referer, ownHost);
  if (outcome === "article") return { kind: "pv", path, referrer };
  if (outcome === "missing") return { kind: "notfound", path, referrer };
  return null;
}
