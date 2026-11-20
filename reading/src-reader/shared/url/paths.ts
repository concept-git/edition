const controlCharacters = /[\u0000-\u001f\u007f]/;

/** 只接受站内相对路径：以单个 "/" 开头，不含反斜杠、控制字符，且解析后仍在同源。 */
export function isSiteRelativePath(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.length > 2048)
    return false;
  if (!value.startsWith("/") || value.startsWith("//")) return false;
  if (value.includes("\\") || controlCharacters.test(value)) return false;
  try {
    const base = "http://site.invalid";
    return new URL(value, base).origin === base;
  } catch {
    return false;
  }
}

/** 站内相对路径或 http(s) 绝对地址；其余（javascript:、data: 等）返回 null。 */
export function safeUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const text = value.trim();
  if (isSiteRelativePath(text)) return text;
  try {
    const url = new URL(text);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

/** 按段编码页面路径，保留 "/" 分隔。 */
export function encodePathSegments(path: string): string {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}
