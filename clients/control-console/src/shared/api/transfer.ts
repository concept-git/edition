import { isRecord } from './session';
export function multipartBody(body: unknown): FormData {
  const form = new FormData();
  if (!isRecord(body)) throw new TypeError('Expected multipart fields');
  for (const [key, value] of Object.entries(body)) {
    if (value instanceof Blob) form.append(key, value);
    else if (typeof value === 'string') form.append(key, value);
  }
  return form;
}
export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name.replaceAll(/[\\/]/g, '_');
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
