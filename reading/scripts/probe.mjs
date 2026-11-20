import { readSource, sourceFingerprint } from "../src/lib/space-source.ts";

try {
  const source = await readSource(
    process.env.SPACE_BLOG_SOURCE ?? "https://beautyclaw.cn",
    process.env.SPACE_BLOG_SPACE ?? "blog",
    true,
  );
  const result = process.argv.includes("--manifest")
    ? JSON.stringify({
        fingerprint: sourceFingerprint(source),
        paths: source.manifest
          .filter((entry) => entry.kind === "file")
          .map((entry) => entry.path)
          .sort(),
      })
    : sourceFingerprint(source);
  process.stdout.write(result + "\n");
} catch (error) {
  process.stderr.write(error.message + "\n");
  process.exitCode = [401, 403, 404, 410].includes(error.status) ? 4 : 1;
}
