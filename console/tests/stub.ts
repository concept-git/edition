const stubOrigin = `http://127.0.0.1:${process.env.AUTH_STUB_PORT ?? '4188'}`;

export async function resetStub() {
  const response = await fetch(`${stubOrigin}/__stub/reset`, { method: 'POST' });
  if (!response.ok && response.status !== 204) throw new Error(`stub reset ${response.status}`);
}

export async function arm(kind: 'login' | 'refresh', mode: string) {
  const response = await fetch(`${stubOrigin}/__stub/${kind}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mode })
  });
  if (!response.ok && response.status !== 204) throw new Error(`stub ${kind} ${response.status}`);
}
