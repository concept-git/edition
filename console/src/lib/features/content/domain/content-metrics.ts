export type Count = number | null;

export type Figure = {
  label: '成员' | '页面' | '已进版页面';
  total: Count;
  yesterday: Count;
};

export type ContentHome =
  | { status: 'ready'; figures: [Figure, Figure, Figure] }
  | { status: 'empty' }
  | { status: 'error'; traceId: string | null };

export type MemberRecord = { joinedAt?: unknown };
export type SpaceRecord = { id?: unknown; pageCount?: unknown };
export type PageRecord = { status?: unknown; publishedAt?: unknown; createdAt?: unknown; updatedAt?: unknown };

export type Source<T> = { kind: 'list'; items: T[] } | { kind: 'none' } | { kind: 'error'; traceId: string | null };

/** Turns list payloads into the three figures. A missing measurement stays null, which the page renders as a gap. */
export function contentHome(
  members: Source<MemberRecord>,
  spaces: Source<SpaceRecord>,
  pages: Source<PageRecord>,
  now = new Date()
): ContentHome {
  for (const source of [members, spaces, pages]) {
    if (source.kind === 'error') return { status: 'error', traceId: source.traceId };
  }
  if (members.kind === 'none' && spaces.kind === 'none') return { status: 'empty' };

  const memberItems = members.kind === 'list' ? members.items : null;
  const spaceItems = spaces.kind === 'list' ? spaces.items : null;
  const pageItems = pages.kind === 'list' ? pages.items : null;

  return {
    status: 'ready',
    figures: [
      {
        label: '成员',
        total: memberItems === null ? null : memberItems.length,
        yesterday: memberItems === null ? null : countStamps(memberItems.map((member) => member.joinedAt), now)
      },
      {
        label: '页面',
        total: spaceItems === null ? null : pageTotal(spaceItems),
        yesterday: pageItems === null ? null : pagesYesterday(pageItems, now)
      },
      {
        label: '已进版页面',
        total: pageItems === null ? null : publishedTotal(pageItems),
        yesterday: pageItems === null ? null : publishedYesterday(pageItems, now)
      }
    ]
  };
}

function pageTotal(spaces: SpaceRecord[]): Count {
  let sum = 0;
  for (const space of spaces) {
    if (typeof space.pageCount !== 'number' || !Number.isFinite(space.pageCount)) return null;
    sum += space.pageCount;
  }
  return sum;
}

function publishedTotal(pages: PageRecord[]): Count {
  let count = 0;
  for (const page of pages) {
    if (page.status !== 'published' && page.status !== 'draft') return null;
    if (page.status === 'published') count += 1;
  }
  return count;
}

function publishedYesterday(pages: PageRecord[], now: Date): Count {
  return countStamps(
    pages.filter((page) => page.status === 'published').map((page) => page.publishedAt),
    now
  );
}

/** Count pages whose payload includes a time. No time stays a gap, never a made-up zero. */
function pagesYesterday(pages: PageRecord[], now: Date): Count {
  const stamps = pages.map((page) => pageTime(page));
  if (stamps.length === 0 || stamps.every((stamp) => stamp === undefined)) return null;
  return countStamps(stamps, now);
}

function pageTime(page: PageRecord): unknown {
  if (page.createdAt !== undefined) return page.createdAt;
  if (page.updatedAt !== undefined) return page.updatedAt;
  return undefined;
}

function countStamps(stamps: unknown[], now: Date): Count {
  if (stamps.some((stamp) => typeof stamp !== 'string' || Number.isNaN(Date.parse(stamp)))) return null;
  const yesterday = localDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  return stamps.filter((stamp) => localDay(new Date(stamp as string)) === yesterday).length;
}

function localDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
