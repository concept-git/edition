import { describe, it, vi, afterEach } from 'vitest';
import assert from 'node:assert/strict';
import { SessionTransport, isRecord } from './session.ts';
afterEach(() => vi.unstubAllGlobals());

describe('management session transport', () => {
  it('shares one refresh across simultaneous expired requests and replays them with the new token', async () => {
    let refreshes = 0;
    const seen: string[] = [];
    const transport = new SessionTransport(async (request) => {
      if (new URL(request.url).pathname === '/auth/refresh') {
        refreshes++;
        await new Promise((resolve) => setTimeout(resolve, 10));
        return Response.json({ accessToken: 'renewed', expiresIn: 60 });
      }
      seen.push(request.headers.get('Authorization') ?? '');
      return request.headers.get('Authorization') === 'Bearer renewed'
        ? Response.json({ id: 'reader' })
        : Response.json({ code: 'authentication_required' }, { status: 401 });
    });
    transport.accept('expired');
    const result = await Promise.all([
      transport.fetch(new Request('https://edition.test/api/v1/me')),
      transport.fetch(new Request('https://edition.test/api/v1/me')),
    ]);
    assert.deepEqual(
      result.map((response) => response.status),
      [200, 200],
    );
    assert.equal(refreshes, 1);
    assert.equal(seen.filter((token) => token === 'Bearer renewed').length, 2);
  });

  it('keeps the session on refresh dependency failure and clears it only for invalid_refresh', async () => {
    let invalid = false;
    const transport = new SessionTransport(async (request) =>
      new URL(request.url).pathname === '/auth/refresh'
        ? Response.json(
            { code: invalid ? 'invalid_refresh' : 'dependency_unavailable' },
            { status: invalid ? 401 : 503 },
          )
        : Response.json({ code: 'authentication_required' }, { status: 401 }),
    );
    transport.accept('retained');
    assert.equal(
      (await transport.fetch(new Request('https://edition.test/api/v1/me')))
        .status,
      503,
    );
    assert.equal(transport.snapshot().token, 'retained');
    invalid = true;
    await transport.fetch(new Request('https://edition.test/api/v1/me'));
    assert.equal(transport.snapshot().token, null);
    assert.equal(transport.snapshot().expired, true);
  });

  it('does not resurrect a session when a refresh arrives after logout', async () => {
    let resolveRefresh: (response: Response) => void = () => {
      throw new Error('refresh not started');
    };
    const transport = new SessionTransport(
      async () =>
        new Promise<Response>((resolve) => {
          resolveRefresh = resolve;
        }),
    );
    const refresh = transport.restore('https://edition.test');
    transport.clear();
    resolveRefresh(Response.json({ accessToken: 'stale' }));
    await refresh;
    assert.equal(transport.snapshot().token, null);
  });

  it('never automatically replays a write after authentication failure', async () => {
    let writes = 0;
    const transport = new SessionTransport(async () => {
      writes++;
      return Response.json(
        { code: 'authentication_required' },
        { status: 401 },
      );
    });
    transport.accept('expired');
    await transport.fetch(
      new Request('https://edition.test/api/v1/spaces', {
        method: 'POST',
        body: '{}',
      }),
    );
    assert.equal(writes, 1);
  });
});

it('publishes updated snapshots to subscribers and stops after unsubscribe', () => {
  const transport = new SessionTransport();
  assert.deepEqual(transport.snapshot(), {
    token: null,
    expired: false,
    revision: 0,
  });
  const snapshots: ReturnType<typeof transport.snapshot>[] = [];
  const stop = transport.subscribe(() => snapshots.push(transport.snapshot()));
  transport.accept('signed-in');
  stop();
  transport.clear();
  assert.deepEqual(snapshots, [
    { token: 'signed-in', expired: false, revision: 1 },
  ]);
  assert.deepEqual(transport.snapshot(), {
    token: null,
    expired: true,
    revision: 2,
  });
});
it('uses the native fetch boundary with same-origin session credentials', async () => {
  let sent: Request | undefined;
  vi.stubGlobal('fetch', async (request: Request) => {
    sent = request;
    return Response.json({});
  });
  const transport = new SessionTransport();
  await transport.fetch(new Request('https://edition.test/api/v1/me'));
  assert.equal(sent?.credentials, 'include');
  assert.equal(sent?.headers.get('Authorization'), null);
});
it('never attaches an old bearer or rotates refresh during a rejected login', async () => {
  const seen: Request[] = [];
  const transport = new SessionTransport(async (request) => {
    seen.push(request);
    return Response.json({ code: 'invalid_credentials' }, { status: 401 });
  });
  transport.accept('existing');
  await transport.fetch(
    new Request('https://edition.test/auth/login', {
      method: 'POST',
      body: '{}',
    }),
  );
  assert.equal(seen.length, 1);
  assert.equal(seen[0].headers.get('Authorization'), null);
});
it('does not refresh a successful authenticated read', async () => {
  const seen: Request[] = [];
  const transport = new SessionTransport(async (request) => {
    seen.push(request);
    return Response.json({ value: 1 });
  });
  transport.accept('current');
  await transport.fetch(new Request('https://edition.test/api/v1/me'));
  assert.equal(seen.length, 1);
  assert.equal(seen[0].headers.get('Authorization'), 'Bearer current');
});
it('can refresh an expired HEAD request without treating it as a mutation', async () => {
  let reads = 0;
  const transport = new SessionTransport(async (request) => {
    if (new URL(request.url).pathname === '/auth/refresh') {
      assert.equal(request.method, 'POST');
      assert.equal(request.credentials, 'include');
      return Response.json({ accessToken: 'new' });
    }
    reads++;
    return new Response(null, { status: reads === 1 ? 401 : 200 });
  });
  transport.accept('old');
  assert.equal(
    (
      await transport.fetch(
        new Request('https://edition.test/api/v1/me', { method: 'HEAD' }),
      )
    ).status,
    200,
  );
  assert.equal(reads, 2);
});
it('retains credentials for malformed refresh payloads and dependency responses', async () => {
  const cases: [number, unknown][] = [
    [200, null],
    [200, []],
    [200, 'bad'],
    [200, { accessToken: 42 }],
    [503, { accessToken: 'must-not-accept' }],
    [403, { code: 'invalid_refresh' }],
    [401, { code: 'another_error' }],
  ];
  for (const [status, payload] of cases) {
    const transport = new SessionTransport(async () =>
      Response.json(payload, { status }),
    );
    transport.accept('preserved');
    await transport.restore('https://edition.test');
    assert.equal(transport.snapshot().token, 'preserved');
    assert.equal(transport.snapshot().expired, false);
  }
});
it('handles non-JSON refresh responses without clearing the existing session', async () => {
  const transport = new SessionTransport(
    async () => new Response('unavailable', { status: 503 }),
  );
  transport.accept('preserved');
  await transport.restore('https://edition.test');
  assert.equal(transport.snapshot().token, 'preserved');
});
it('does not replay a read cancelled during refresh', async () => {
  const controller = new AbortController();
  let reads = 0;
  const transport = new SessionTransport(async (request) => {
    if (new URL(request.url).pathname === '/auth/refresh') {
      controller.abort();
      return Response.json({ accessToken: 'new' });
    }
    reads++;
    return new Response(null, { status: 401 });
  });
  transport.accept('old');
  await transport.fetch(
    new Request('https://edition.test/api/v1/me', {
      signal: controller.signal,
    }),
  );
  assert.equal(reads, 1);
});
it('does not replay an old read after a concurrently revoked session', async () => {
  let complete: (response: Response) => void = () => {
    throw new Error('not started');
  };
  let reads = 0;
  const transport = new SessionTransport(async () => {
    reads++;
    return new Promise<Response>((resolve) => {
      complete = resolve;
    });
  });
  transport.accept('old');
  const request = transport.fetch(
    new Request('https://edition.test/api/v1/me'),
  );
  transport.clear();
  complete(new Response(null, { status: 401 }));
  await request;
  assert.equal(reads, 1);
  assert.equal(transport.snapshot().expired, true);
});
it('recognizes object-shaped input without accepting null, arrays or primitives', () => {
  for (const value of [null, undefined, [], 0, 1, true, false, 'string'])
    assert.equal(isRecord(value), false);
  assert.equal(isRecord({}), true);
  assert.equal(isRecord({ key: null }), true);
});
