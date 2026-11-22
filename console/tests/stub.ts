export async function resetStub() {
  const response = await fetch('http://127.0.0.1:4188/__stub/reset', { method: 'POST' });
  if (!response.ok && response.status !== 204) throw new Error(`stub reset ${response.status}`);
}

export async function arm(kind: 'login' | 'refresh', mode: string) {
  const response = await fetch(`http://127.0.0.1:4188/__stub/${kind}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mode })
  });
  if (!response.ok && response.status !== 204) throw new Error(`stub ${kind} ${response.status}`);
}
