/** Single TypeScript entry. Compose, Caddy, Postgres, MinIO and coverage tools keep their own files. */
import { Argument, Command, Option } from 'commander';
import { execa } from 'execa';
import type { Options } from 'execa';
import { generateKeyPairSync, randomBytes, randomUUID, createHash } from 'node:crypto';
import { existsSync, globSync, mkdirSync, readFileSync, writeFileSync, chmodSync, copyFileSync, openSync, closeSync, fsyncSync, renameSync, unlinkSync, readSync, statSync, createWriteStream, rmSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';
import { isDeepStrictEqual } from 'node:util';
import { hostname } from 'node:os';
import { connect as connectTcp, isIP } from 'node:net';
import { connect as connectTls } from 'node:tls';
import { pipeline } from 'node:stream/promises';
import { get as httpGet } from 'node:http';
import { get as httpsGet } from 'node:https';


/** Compare covered item counts, not rounded percentages. Missing or empty reports cannot pass. */
export type Metric = { covered: number; total: number };
export type Coverage = Record<string, Metric>;

export function coverageErrors(name: string, metrics: Coverage, required: string[], minimum = 90): string[] {
  return required.flatMap(metric => {
    const value = metrics[metric];
    if (!value || !Number.isSafeInteger(value.covered) || !Number.isSafeInteger(value.total)
      || value.covered < 0 || value.total < value.covered) return [`${name}: invalid ${metric} coverage`];
    // A branch-free module is valid; a module with no measured executable lines is not.
    if (value.total === 0) return metric === 'branches' ? [] : [`${name}: empty ${metric} coverage`];
    return value.covered * 100 >= minimum * value.total ? []
      : [`${name}: ${metric} ${(value.covered / value.total * 100).toFixed(2)}% < ${minimum}% (${value.covered}/${value.total})`];
  });
}

/** JaCoCo repeats counters per class and package. Only the final report counters are totals. */
export function javaCoverage(xml: string): Coverage {
  const rootCounters = xml.slice(xml.lastIndexOf('</package>') + '</package>'.length);
  const names: Record<string, string> = { LINE: 'lines', BRANCH: 'branches', METHOD: 'methods' };
  return Object.fromEntries([...rootCounters.matchAll(/<counter type="(LINE|BRANCH|METHOD)" missed="(\d+)" covered="(\d+)"\s*\/>/g)]
    .map(([, type, missed, covered]) => [names[type], { covered: Number(covered), total: Number(missed) + Number(covered) }]));
}

/** Both c8 and Vitest emit Istanbul summary counters. Keep each module as a separate result. */
export function javascriptCoverage(summary: { total: Record<string, Metric> }): Coverage {
  return Object.fromEntries(['lines', 'branches', 'functions', 'statements'].map(name => [name, summary.total[name]]));
}

export function pythonCoverage(summary: { totals: { covered_lines: number; num_statements: number; covered_branches: number; num_branches: number } }): Coverage {
  return {
    lines: { covered: summary.totals.covered_lines, total: summary.totals.num_statements },
    branches: { covered: summary.totals.covered_branches, total: summary.totals.num_branches }
  };
}

/** Retain diagnostics in logs. This recognizes warnings; it never filters them out of output. */
export function warningLines(output: string): string[] {
  return output.split(/\r?\n/).filter(line =>
    /(?:\b(?:Deprecation|Experimental|Runtime|Resource|User)Warning\b|\bwarning:|^\s*WARNING\b|^\s*\[WARN\]|^\s*WARN\b|\b[1-9]\d* warnings?\b|Deprecated Gradle features were used|Build was configured to prefer settings repositories)/i.test(line));
}

/** Shared topology and scoped role configuration for Compose, acceptance and manual diagnosis. */

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const DEV = join(ROOT, '.scratch/dw-v1/runtime');
export const DEPLOYMENT = join(ROOT, 'infra/deployment');
export const runtime = process.env.E2E_RUNTIME_DIR ?? join(DEV, 'private-reader');
export const project = process.env.EDITION_COMPOSE_PROJECT ?? 'dw-remaining';
export const ports = { source: 5412, search: 7712, objects: 9012,
  smtp: 1035, mailpit: 8035, ingress: 8446, control: 8094, content: 8095, browser: 4176,
  // Reading frontend (Astro SSR) and the plain-HTTP edge that routes between Reader, Control and the frontend.
  reading: 8096, edge: 8097 };
type Service = keyof typeof ports;
export type Role = 'control' | 'content' | 'index' | 'reading' | 'edge';
type JavaRole = 'control' | 'content' | 'index';
export type Mode = 'local' | 'acceptance';
export type Flags = { shortReaderAccess?: boolean; port?: string };
export const run = (exe: string, args: readonly string[] = [], options: Options = {}) => execa(exe, args, { cwd: ROOT, ...options });
const composeFor = (name: string) => ['compose', '-p', name, '-f', join(DEPLOYMENT, 'compose.yml')];
export const compose = composeFor(project);
const localPorts = { ...ports, source: 5432, search: 7700, objects: 9000,
  smtp: 1025, mailpit: 8025, control: 8091, content: 8082, browser: 8088, reading: 8083, edge: 8088 };
const internalPorts = { ...ports, source: 5432, search: 7700, objects: 9000, smtp: 1025, mailpit: 8025 };
const container = () => process.env.EDITION_CONTAINER === '1';
export function port(service: Service, mode: Mode = 'acceptance') {
  if (container()) return internalPorts[service];
  if (mode === 'local') return localPorts[service];
  const offset = Number(process.env.E2E_PORT_OFFSET ?? 0);
  if (!Number.isInteger(offset) || offset < 0 || offset > 65535 - Math.max(...Object.values(ports))) throw new Error('Invalid E2E_PORT_OFFSET');
  return ports[service] + offset;
}
export function host(service: Service) {
  return container() ? ({ smtp: 'mailpit', browser: 'web', edge: 'ingress' }[service as string] ?? service) : 'localhost';
}
export const origin = (service: Service, mode: Mode = 'acceptance') => `http://${host(service)}:${port(service, mode)}`;
export const bindings = () => ({ ...Object.fromEntries(Object.keys(ports).map(name => [`E2E_${name.toUpperCase()}_PORT`, String(port(name as Service))])),
  E2E_TLS_CERT_FILE: join(runtime, 'tls-cert.pem'), E2E_TLS_KEY_FILE: join(runtime, 'tls-key.pem') });
export const readJson = <T = Record<string, string>>(path: string): T => JSON.parse(readFileSync(path, 'utf8'));
export function privateWrite(path: string, value: string) {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const temporary = join(dirname(path), `.pending-${randomUUID()}`);
  const fd = openSync(temporary, 'wx', 0o600);
  try {
    try { writeFileSync(fd, value); fsyncSync(fd); } finally { closeSync(fd); }
    renameSync(temporary, path);
  } finally { if (existsSync(temporary)) unlinkSync(temporary); }
}
export const writeJson = (path: string, value: unknown) => privateWrite(path, JSON.stringify(value) + '\n');
export async function waitHttp(url: string, seconds = 60) {
  const until = Date.now() + seconds * 1000;
  while (Date.now() < until) {
    try { if ((await fetch(url, { signal: AbortSignal.timeout(2000) })).status === 200) return; } catch {}
    await sleep(250);
  }
  throw new Error(`Service not ready: ${url}; inspect role logs`);
}
/** Frontend readiness has no /healthz of its own (the edge sends that path to Reader): any HTTP answer proves the listener is up. */
export async function waitUp(url: string, seconds = 60) {
  const until = Date.now() + seconds * 1000;
  while (Date.now() < until) {
    try { await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(3000) }); return; } catch {}
    await sleep(250);
  }
  throw new Error(`Service not ready: ${url}; inspect role logs`);
}
export async function javaBin() {
  const executable = process.platform === 'win32' ? 'java.exe' : 'java';
  const candidates = [process.env.JAVA_HOME && join(process.env.JAVA_HOME, 'bin', executable),
    ...globSync(`**/bin/${executable}`, { cwd: join(process.env.USERPROFILE ?? process.env.HOME ?? '', '.gradle/jdks') }).map(path => join(process.env.USERPROFILE ?? process.env.HOME ?? '', '.gradle/jdks', path)), executable].filter(Boolean) as string[];
  for (const java of candidates) {
    const result = await run(java, ['-version'], { reject: false }).catch(() => null);
    if (result?.exitCode === 0 && /\bversion "25\./.test(String(result.stdout) + String(result.stderr))) return java;
  }
  throw new Error('Java 25 is required; build with Gradle Wrapper first.');
}
export const SITE_ENTRY = join(ROOT, 'reading/dist-reader/server/entry.mjs');
export const jarPath = (role: JavaRole) => join(ROOT, 'backend', 'apps', role, 'build', 'libs', role === 'control' ? `edition-control-${readFileSync(join(ROOT, 'VERSION'), 'utf8').trim()}.jar` : `edition-${role}.jar`);
export function snapshotJar(folder: string, role: JavaRole) {
  const jar = jarPath(role);
  const path = join(folder, 'artifacts', `${role}-${createHash('sha256').update(readFileSync(jar)).digest('hex').slice(0, 16)}.jar`);
  mkdirSync(dirname(path), { recursive: true });
  if (!existsSync(path)) { copyFileSync(jar, path); chmodSync(path, 0o400); }
  return path;
}
const secrets = ['DELIVERY_CURSOR_KEY', 'ANALYTICS_INGEST_KEY', 'WEBHOOK_ENCRYPTION_KEY', 'IDEMPOTENCY_ENCRYPTION_KEY', 'MAIL_OUTBOX_ENCRYPTION_KEY'];
export function credentialsFile(folder = runtime) {
  const namespace = process.env.E2E_STORAGE_NAMESPACE ?? 'dw-remaining';
  return join(folder, namespace === 'dw-remaining' ? 'credentials.json' : `credentials-${createHash('sha256').update(namespace).digest('hex').slice(0, 16)}.json`);
}
async function openssl(args: string[], folder?: string) {
  const native = await run('openssl', ['version'], { reject: false }).catch(() => null);
  const local = native?.exitCode === 0 && process.platform !== 'win32';
  const mount = folder ? ['-v', `${folder}:/keys:ro`] : [];
  return String((await run(local ? 'openssl' : 'docker', local ? args : ['run', '--rm', ...mount, 'postgres:18.6', 'openssl', ...args.map(arg => folder && arg.startsWith(folder) ? arg.replace(folder, '/keys').replaceAll('\\', '/') : arg)], { stripFinalNewline: false })).stdout);
}
export async function init(folder = runtime) {
  mkdirSync(folder, { recursive: true });
  const config = credentialsFile(folder), saved = existsSync(config) ? readJson(config) : {};
  for (const name of secrets) saved[name] ||= randomBytes(32).toString('base64');
  writeJson(config, saved);
  const privateKey = join(folder, 'session-private.pem'), publicKey = join(folder, 'session-public.pem');
  if (existsSync(privateKey) !== existsSync(publicKey)) throw new Error('Both session keys must exist; repair the partial pair.');
  if (!existsSync(privateKey)) {
    const pair = generateKeyPairSync('rsa', { modulusLength: 2048, publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } });
    privateWrite(privateKey, pair.privateKey); writeFileSync(publicKey, pair.publicKey);
  }
  for (const [prefix, commonName, san, days] of [['tls', '*.acme.test', '*.acme.test', '30'], ['webhook-receiver', 'localhost', 'localhost', '365']]) {
    const key = join(folder, `${prefix}-key.pem`), cert = join(folder, `${prefix}-cert.pem`);
    if (existsSync(key) !== existsSync(cert)) throw new Error(`Both ${prefix} TLS files must exist.`);
    if (!existsSync(key)) {
      const privatePem = await openssl(['genpkey', '-algorithm', 'RSA', '-pkeyopt', 'rsa_keygen_bits:2048']);
      // Execa uses a socket for stdin on Linux; OpenSSL cannot reopen it as /dev/stdin.
      const pendingKey = join(folder, `.certificate-${randomUUID()}.pem`);
      privateWrite(pendingKey, privatePem);
      let certPem: string;
      try { certPem = await openssl(['req', '-new', '-x509', '-key', pendingKey, '-days', days, '-subj', `/CN=${commonName}`, '-addext', `subjectAltName=DNS:${san}`], folder); }
      finally { unlinkSync(pendingKey); }
      privateWrite(key, privatePem); writeFileSync(cert, certPem);
      if (prefix === 'webhook-receiver' && existsSync(join(folder, 'webhook-truststore.p12'))) unlinkSync(join(folder, 'webhook-truststore.p12'));
    }
  }
  const store = join(folder, 'webhook-truststore.p12');
  if (!existsSync(store)) {
    const java = await javaBin();
    // Resolve PATH's Java to JAVA_HOME when available; keytool must use the same JDK roots.
    const settings = await run(java, ['-XshowSettings:properties', '-version']);
    const home = /\bjava.home = ([^\r\n]+)/.exec(String(settings.stderr))?.[1].trim();
    if (!home) throw new Error('Cannot resolve the selected Java 25 home.');
    const keytool = join(home, 'bin', process.platform === 'win32' ? 'keytool.exe' : 'keytool');
    await run(keytool, ['-importkeystore', '-noprompt', '-srckeystore', join(home, 'lib/security/cacerts'), '-srcstorepass', 'changeit', '-destkeystore', store, '-deststoretype', 'PKCS12', '-deststorepass', 'changeit']);
    await run(keytool, ['-importcert', '-noprompt', '-alias', 'space-webhook-receiver', '-file', join(folder, 'webhook-receiver-cert.pem'), '-keystore', store, '-storepass', 'changeit']);
  }
}
export async function mintMeili(url: string, master: string, saved: Record<string, string>) {
  const writer = ['indexes.create', 'indexes.get', 'indexes.update', 'indexes.delete', 'documents.add', 'documents.get', 'documents.delete', 'settings.get', 'settings.update', 'tasks.get'];
  for (const [key, actions] of [['MEILI_SEARCH_KEY', ['search']], ['MEILI_WRITER_KEY', writer]] as const) {
    if (saved[key]) continue;
    const response = await fetch(`${url}/keys`, { method: 'POST', signal: AbortSignal.timeout(10000), headers: { Authorization: `Bearer ${master}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: key, actions, indexes: ['site-*'], expiresAt: null }) });
    if (!response.ok) throw new Error(`Meili key provisioning failed (${response.status})`);
    saved[key] = (await response.json()).key;
  }
}
const objectImage = (env: NodeJS.ProcessEnv) => env.EDITION_OBJECT_IMAGE ?? 'edition-objectstore:2025-09-07';

async function ensureObjectImage(docker: string, env: NodeJS.ProcessEnv, execute: Execute = run) {
  const image = objectImage(env);
  if ((await execute(docker, ['image', 'inspect', image], { env, reject: false })).exitCode === 0) return;
  if (env.EDITION_OBJECT_IMAGE) throw new Error(`Configured object image ${image} must already be available locally`);
  await execute(docker, [...composeFor(env.EDITION_COMPOSE_PROJECT ?? project), 'build', 'objects'], { env, stdio: 'inherit' });
}

const objectInit = (host: 'objects' | 'minio') => `
set -eu
mc alias set local http://${host}:9000 edition edition-dev >/dev/null
mc mb -p local/attachments local/bundles
mc admin user add local delivery-reader delivery-local-reader-secret
mc admin policy create local delivery-reader /policies/reader-policy.json
mc admin policy attach local delivery-reader --user delivery-reader
`;

export async function provision(mode: Mode = 'acceptance') {
  const folder = mode === 'local' ? DEV : runtime, saved = readJson(credentialsFile(folder));
  const source = mode === 'local' ? ['exec', '-i', 'edition-postgres-1'] : [...compose, 'exec', '-T', 'source'];
  await run('docker', [...source, 'psql', '-v', 'ON_ERROR_STOP=1', '-U', 'edition', '-d', 'edition'], { input: readFileSync(join(DEPLOYMENT, 'source-logins.sql'), 'utf8') });
  await mintMeili(origin('search', mode), mode === 'local' ? 'dev-master-key-change-me' : 'acceptance-master-key', saved);
  writeJson(credentialsFile(folder), saved);
  const script = objectInit(mode === 'local' ? 'minio' : 'objects');
  await ensureObjectImage('docker', process.env);
  await run('docker', ['run', '--rm', '--network', `${mode === 'local' ? 'edition' : project}_default`, '-v', `${join(DEPLOYMENT, 'reader-policy.json')}:/policies/reader-policy.json:ro`, '--entrypoint', 'sh', objectImage(process.env), '-ec', script]);
}
/** Host-run frontend reaches Reader and Control over IPv4 loopback: Java reports an IPv6 peer as 0:0:0:0:0:0:0:1, which the trusted-proxy list ('::1') would not match. */
const upstreamOrigin = (service: Service, mode: Mode) => container() ? origin(service, mode) : `http://127.0.0.1:${port(service, mode)}`;
export function roleEnv(role: Role, mode: Mode = 'acceptance', flags: Flags = {}) {
  const env: NodeJS.ProcessEnv = Object.fromEntries(['PATH', 'HOME', 'USERPROFILE', 'JAVA_HOME', 'TMPDIR', 'TEMP', 'TMP', 'LANG', 'LC_ALL', 'SystemRoot', 'SYSTEMROOT'].filter(name => process.env[name]).map(name => [name, process.env[name]]));
  if (role === 'reading') {
    // The reading frontend is stateless: it needs only the two upstream origins and its own listener.
    Object.assign(env, { HOST: '0.0.0.0', PORT: flags.port ?? String(port('reading', mode)),
      EDITION_CONTENT_ORIGIN: upstreamOrigin('content', mode), EDITION_CONTROL_ORIGIN: upstreamOrigin('control', mode), NODE_ENV: 'production' });
    return env;
  }
  if (role === 'edge') {
    // Caddy resolves upstreams from the container's point of view unless Compose supplied service names.
    const upstream = (variable: string, service: Service) => process.env[variable] ?? (container() ? `${service}:${port(service, mode)}` : `host.docker.internal:${port(service, mode)}`);
    Object.assign(env, { E2E_CONTENT_UPSTREAM: upstream('E2E_CONTENT_UPSTREAM', 'content'), E2E_CONTROL_UPSTREAM: upstream('E2E_CONTROL_UPSTREAM', 'control'), E2E_READING_UPSTREAM: upstream('E2E_READING_UPSTREAM', 'reading') });
    return env;
  }
  const folder = mode === 'local' ? DEV : runtime, saved = readJson(credentialsFile(folder));
  const primaryDb = `jdbc:postgresql://${host('source')}:${port('source', mode)}/edition`;
  if (role !== 'index') {
    env.OBJECT_STORE_ENDPOINT = origin('objects', mode);
    env.TRUSTED_PROXIES = process.env.E2E_TRUSTED_PROXIES ?? '127.0.0.1,::1';
  }
  if (role !== 'control') {
    env.DELIVERY_DB_URL = primaryDb;
    env.MEILI_URL = origin('search', mode);
  }
  const take = (...names: string[]) => Object.assign(env, Object.fromEntries(names.map(name => [name, saved[name]])));
  if (role === 'control') {
    take('ANALYTICS_INGEST_KEY', 'WEBHOOK_ENCRYPTION_KEY', 'IDEMPOTENCY_ENCRYPTION_KEY', 'MAIL_OUTBOX_ENCRYPTION_KEY');
    // Spring's environment properties override the dev profile's fixed localhost Mailpit address.
    Object.assign(env, { SPRING_MAIL_HOST: host('smtp'), SPRING_MAIL_PORT: String(port('smtp', mode)) });
    Object.assign(env, {
      DB_URL: primaryDb, DB_USER: 'edition', DB_PASSWORD: 'edition',
      PORT: flags.port ?? String(port('control', mode)), SPRING_PROFILES_ACTIVE: process.env.EDITION_CONSOLE_PROFILE ?? 'default',
      // Published site links point at the edge, not at Reader: Reader no longer serves reading pages.
      READER_PUBLIC_SCHEME: process.env.READER_PUBLIC_SCHEME ?? 'http', READER_PUBLIC_PORT: process.env.READER_PUBLIC_PORT ?? String(port('edge', mode)),
      SESSION_PRIVATE_KEY: join(folder, 'session-private.pem'), SESSION_PUBLIC_KEY: join(folder, 'session-public.pem'),
      DNS_RESOLVER: 'fake', MAIL_ENABLED: 'true', MAIL_FROM: 'noreply@edition.local', SMTP_HOST: host('smtp'), SMTP_PORT: String(port('smtp', mode)), SMTP_STARTTLS: 'false',
      LOGIN_IP_CAPACITY: '1000', LOGIN_EMAIL_CAPACITY: '1000', FORGOT_IP_CAPACITY: '1000', FORGOT_EMAIL_CAPACITY: '1000',
      IMPORT_REMOTE_ALLOWED_HOSTS: 'localhost', WEBHOOK_ALLOWED_HOSTS: 'localhost', CORS_ALLOWED_ORIGINS: process.env.EDITION_CONSOLE_ORIGINS ?? origin('browser', mode),
      LOG_FILE: join(folder, 'control-application.log'), SERVER_TOMCAT_ACCESSLOG_ENABLED: 'true', SERVER_TOMCAT_ACCESSLOG_DIRECTORY: join(folder, 'peer-access'),
      SERVER_TOMCAT_ACCESSLOG_PATTERN: '%a', SERVER_TOMCAT_ACCESSLOG_BUFFERED: 'false',
    });
  } else if (role === 'content') {
    take('MEILI_SEARCH_KEY', 'DELIVERY_CURSOR_KEY');
    Object.assign(env, {
      DELIVERY_DB_USER: 'publication_reader_login', DELIVERY_DB_PASSWORD: 'publication-local-reader',
      OBJECT_STORE_READER_KEY: 'delivery-reader', OBJECT_STORE_READER_SECRET: 'delivery-local-reader-secret', OBJECT_STORE_BUCKET: 'attachments',
      PORT: flags.port ?? String(port('content', mode)), READER_LOG_FILE: join(folder, 'content-application.log'),
      SERVER_TOMCAT_ACCESSLOG_ENABLED: 'true', SERVER_TOMCAT_ACCESSLOG_DIRECTORY: join(folder, 'content-peer-access'),
      SERVER_TOMCAT_ACCESSLOG_PATTERN: '%a', SERVER_TOMCAT_ACCESSLOG_BUFFERED: 'false',
    });
  } else {
    take('MEILI_WRITER_KEY');
    Object.assign(env, {
      DELIVERY_WRITER_USER: 'publication_search_login', DELIVERY_WRITER_PASSWORD: 'publication-local-search',
    });
  }
  if (flags.shortReaderAccess && role === 'control') env.READER_ACCESS_TTL = 'PT5S';
  return env;
}
export async function roleCommand(role: Role, mode: Mode = 'acceptance', flags: Flags = {}) {
  const folder = mode === 'local' ? DEV : runtime, env = roleEnv(role, mode, flags);
  // The frontend is a build artifact of reading (`pnpm build:reader`); it runs on the host Node, not on a JAR.
  if (role === 'reading') return { exe: process.execPath, args: [SITE_ENTRY], env };
  if (role === 'edge') return { exe: 'docker', args: [...compose, '--profile', 'ingress', 'up', '-d', 'ingress'], env };
  const args = [role === 'content' ? '-Xmx512m' : '-Xmx1024m'];
  if (role === 'control') args.push('-Dio.edition.certificates.tls-enabled=false', `-Djavax.net.ssl.trustStore=${join(folder, 'webhook-truststore.p12')}`, '-Djavax.net.ssl.trustStoreType=PKCS12', '-Djavax.net.ssl.trustStorePassword=changeit');
  return { exe: await javaBin(), args: [...args, '-jar', snapshotJar(folder, role)], env };
}
export async function exportContract(check: boolean, reader = origin('content'), control = origin('control')) {
  // `reader` must be the Reader origin itself (E2E_CONTENT_ORIGIN): api-docs is not routed by the edge.
  const [document, commands] = await Promise.all([`${reader}/api-docs`, `${control}/api-docs/reader-commands`].map(async url => {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`Contract endpoint ${url} returned ${response.status}`);
    return response.json();
  }));
  if (!commands.paths?.['/_auth/history']) throw new Error('Reader command contract is missing history');
  for (const [target, source] of [[document.paths, commands.paths], [document.components.schemas, commands.components.schemas]]) {
    for (const [name, value] of Object.entries(source)) {
      if (name in target && !isDeepStrictEqual(target[name], value)) throw new Error(`Delivery contract collision at ${name}`);
      target[name] = value;
    }
  }
  const target = join(ROOT, 'contracts/delivery-openapi.json');
  if (check) {
    if (!existsSync(target) || !isDeepStrictEqual(readJson(target), document)) throw new Error('Independent delivery contract drift; regenerate from the current reader artifact');
  } else writeFileSync(target, JSON.stringify(document, null, 2) + '\n');
}

/** Validate maintained navigation, executable entries and the complete PRD composition graph. */

export function entrypoints(text: string) {
  const files = [...text.matchAll(/\bnode\s+((?:infra|docs)\/[\w./-]+\.(?:ts|mjs|js))\b/g)].map(match => match[1]);
  // Keep detecting stale Python commands so a migration cannot silently break documentation.
  files.push(...[...text.matchAll(/\b(?:python3?|py\s+-3)\s+((?:infra|docs)\/[\w./-]+\.py)\b/g)].map(match => match[1]));
  files.push(...[...text.matchAll(/\b(?:python3?|py\s+-3)\s+-m\s+(infra(?:\.[A-Za-z_]\w*)+)/g)].map(match => match[1].replaceAll('.', '/') + '.py'));
  return files;
}
export function documentErrors(root: string, paths: string[]) {
  const errors: string[] = [];
  for (const path of paths) {
    const text = readFileSync(path, 'utf8'), name = relative(root, path).replaceAll('\\', '/');
    const navigation = text.replace(/^```[^\n]*\n[\s\S]*?^```[^\n]*$/gm, '');
    for (const match of navigation.matchAll(/(?<!!)\[[^\]\n]*\]\(\s*(<[^>]+>|[^\s)]+)(?:\s+"[^"\n]*")?\s*\)/g)) {
      let target = match[1].replace(/^<|>$/g, '');
      if (/^[a-zA-Z][\w+.-]*:/.test(target) || target.startsWith('//')) continue;
      target = decodeURIComponent(target.split(/[?#]/)[0]);
      if (target && !existsSync(target.startsWith('/') ? join(root, target) : join(dirname(path), target))) errors.push(`${name}: missing link ${target}`);
    }
    if (!/^docs\/(history|reference|research)\//.test(name) && /io[./]edition[./](concept|sync)(?=[./"`\s]|$)/.test(text)) errors.push(`${name}: obsolete Control package; use concepts/syncs`);
    if (name !== 'CHANGELOG.md') for (const target of entrypoints(text)) if (!existsSync(join(root, target)) || !statSync(join(root, target)).isFile()) errors.push(`${name}: missing script ${target}`);
  }
  return errors;
}
export function entrypointErrors(root: string) {
  const errors: string[] = [];
  const check = (text: string, name: string) => { for (const file of entrypoints(text)) if (!existsSync(join(root, file))) errors.push(`${name}: missing script ${file}`); };
  for (const path of globSync('.github/workflows/*.yml', { cwd: root })) check(readFileSync(join(root, path), 'utf8'), path);
  for (const directory of ['acceptance', 'reading', 'infra']) {
    const path = join(root, directory, 'package.json'); if (!existsSync(path)) continue;
    const scripts = readJson<{ scripts?: Record<string, string> }>(path).scripts ?? {};
    for (const [name, command] of Object.entries(scripts)) {
      check(command, `${directory}/package.json [${name}]`);
      for (const match of command.matchAll(/\bnode\s+(scripts\/[\w./-]+\.(?:mjs|js|ts))\b/g)) if (!existsSync(join(root, directory, match[1]))) errors.push(`${directory}/package.json [${name}]: missing script ${match[1]}`);
    }
  }
  return errors;
}
export function composition(root: string) {
  const prd = readFileSync(join(root, 'docs/prd/README.md'), 'utf8'), app = readFileSync(join(root, 'backend/apps/control/src/main/java/io/edition/control/compositions/SYNCS.md'), 'utf8');
  const graph = prd.split('## 依赖图与交付口径')[1].split('```text')[1].split('```')[0];
  const bindings = app.split('## app 组合')[1].split('```text')[1].split('```')[0];
  const includes = [...bindings.matchAll(/^\s*include[ \t]+(\w+)(?:[ \t]+\[([^\n]*)\])?/gm)], names = new Set(includes.map(match => match[1]));
  if (names.size !== 19) throw new Error('The app must instantiate all 19 PRD concepts');
  const aliases = Object.fromEntries([...bindings.matchAll(/^\s*(\w+)[ \t]*=[ \t]*([^\n]+)/gm)].map(match => [match[1], match[2]]));
  const actual = new Set<string>(), expected = new Set<string>();
  for (const [, name, expression = ''] of includes) for (const token of expression.split('//')[0].match(/\b[A-Z]\w*/g) ?? []) {
    for (const target of names.has(token) ? [token] : aliases[token]?.match(/\b[A-Z]\w*/g) ?? []) if (names.has(target)) actual.add(`${name}->${target}`);
  }
  for (const [, left, right] of graph.matchAll(/([A-Z]\w*(?:\s*\/\s*[A-Z]\w*)*)\s*──►\s*([A-Z]\w*(?:,\s*[A-Z]\w*)*)/g)) for (const source of left.match(/[A-Z]\w*/g)!) for (const target of right.match(/[A-Z]\w*/g)!) expected.add(`${source}->${target}`);
  if (expected.size !== 20) throw new Error('PRD graph shape changed; review its complete edge inventory');
  const report = { prdEdges: [...expected].sort(), appBindings: [...actual].sort(), missing: [...expected].filter(edge => !actual.has(edge)).sort() };
  const output = join(root, 'backend/apps/control/build/spring-modulith-docs/prd-composition.json'); mkdirSync(dirname(output), { recursive: true }); writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
  if (report.missing.length) throw new Error(`PRD edges missing from app type bindings: ${report.missing.join(', ')}`);
  return report;
}
export function repositoryCheck(root = ROOT) {
  const patterns = ['*.md', 'docs/**/*.md', 'infra/**/*.md', '{backend,acceptance,reading,clients/edition,contracts}/*.md', 'backend/{apps,libraries}/*/*.md', 'backend/{apps,libraries}/*/src/main/java/**/*.md'];
  const paths = [...new Set(globSync(patterns, { cwd: root }).map(path => join(root, path)))].sort();
  const errors = [...documentErrors(root, paths), ...entrypointErrors(root)];
  let count = 0;
  try { count = composition(root).prdEdges.length; } catch (error) { errors.push(`PRD composition: ${(error as Error).message}`); }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`Repository checks passed: ${paths.length} documents, script entries, ${count} PRD composition edges`);
}
export async function repositoryCommand(argv: string[]) {
  await new Command().description('Check navigation, scripts and PRD composition').action(() => repositoryCheck()).parseAsync(argv, { from: 'user' });
}

/** Stop an owned tree, including preview servers that create a separate process group. */

export async function stopProcessTree(root: number) {
  if (process.platform === 'win32') {
    await run('taskkill', ['/PID', String(root), '/T', '/F'], { reject: false });
    return;
  }
  // Read only process relationships. Command lines can contain application secrets.
  const listing = await run('ps', ['-axo', 'pid=,ppid=,pgid=']);
  const rows = String(listing.stdout).trim().split('\n').map(line => line.trim().split(/\s+/).map(Number));
  const owned = new Set([root]);
  let size: number;
  do {
    size = owned.size;
    for (const [pid, parent] of rows) if (owned.has(parent)) owned.add(pid);
  } while (owned.size !== size);
  // Snapshot descendants before signaling: otherwise orphaned children lose their owner link.
  let groupStopped = false;
  try { process.kill(-root, 'SIGTERM'); groupStopped = true; } catch { /* The process may already have exited. */ }
  for (const pid of [...owned].reverse()) {
    // Do not signal group members twice: a second TERM can interrupt graceful JVM shutdown.
    if (groupStopped && rows.some(([member, , group]) => member === pid && group === root)) continue;
    try { process.kill(pid, 'SIGTERM'); } catch { /* Shutdown is idempotent. */ }
  }
}

/** Run isolated real applications and acceptance profiles locally and in CI; preserve data volumes. */

type AcceptanceResult = { suite: string; profile: string; passed?: boolean; selected?: boolean; seconds?: number };
type Process = { child: ReturnType<typeof run>; log: Promise<void> };
/** Scope transform code and source maps to one acceptance run, preserving the application environment. */
export function browserTestEnvironment(directory: string, runId: string, environment: NodeJS.ProcessEnv): NodeJS.ProcessEnv & { PWTEST_CACHE_DIR: string } {
  const env: NodeJS.ProcessEnv & { PWTEST_CACHE_DIR: string } = { ...environment, PWTEST_CACHE_DIR: join(directory, 'playwright-cache', runId) };
  // Playwright supplies its own color setting to workers and preview processes.
  // An inherited NO_COLOR conflicts with that setting and produces Node warnings.
  delete env.NO_COLOR; delete env.FORCE_COLOR;
  return env;
}
/** Reader's trusted forwarders: loopback (the host-run reading frontend), the ingress peer, and any extra frontend addresses. */
export function trustedProxies(...peers: string[]) {
  return [...new Set(['127.0.0.1', '::1', ...peers, ...(process.env.E2E_READING_PEERS ?? '').split(',').map(item => item.trim()).filter(Boolean)])].join(',');
}
export async function verify(suite: string, options: { profile: string; grep: string; updateContract?: boolean }) {
  mkdirSync(runtime, { recursive: true });
  const acceptanceCompose = [...compose];
  if (process.platform === 'linux') {
    const file = join(runtime, 'linux-compose.json'); writeFileSync(file, JSON.stringify({ services: { ingress: { extra_hosts: ['host.docker.internal:host-gateway'] } } })); acceptanceCompose.push('-f', file);
  }
  const runId = `${suite}-${Date.now()}`;
  const env = browserTestEnvironment(runtime, runId, { ...process.env, ...bindings(), E2E_RESULTS_DIR: join(runtime, 'runs', runId, 'browser'), E2E_BACKEND_ORIGIN: origin('control'), E2E_BROWSER_ORIGIN: origin('browser'), E2E_DELIVERY_ORIGIN: origin('edge'), E2E_CONTENT_ORIGIN: origin('content'),
    E2E_DATABASE_URL: `postgresql://edition:edition@localhost:${port('source')}/edition`, E2E_MAILPIT_ORIGIN: origin('mailpit'), E2E_MINIO_CONTAINER: `${project}-objects-1`, E2E_MINIO_ORIGIN: origin('objects'),
    E2E_WEBHOOK_TLS_KEY: join(runtime, 'webhook-receiver-key.pem'), E2E_WEBHOOK_TLS_CERT: join(runtime, 'webhook-receiver-cert.pem') });
  const processes = new Map<Role, Process>(), active = new Set<Process>(), results: AcceptanceResult[] = [], started = Date.now();
  const abort = new AbortController();
  const kill = async (item: Process) => {
    const pid = item.child.pid; if (!pid) { item.child.kill(); return; }
    await stopProcessTree(pid);
  };
  const logged = (exe: string, args: string[], name: string, extra: Options = {}) => {
    // Own the complete process tree, including Playwright's preview server, on cancellation.
    // The environment already contains inherited application settings. Merging the
    // parent environment again would restore the color variables removed above.
    const child = run(exe, args, { env, extendEnv: false, all: true, buffer: false, detached: process.platform !== 'win32', ...extra });
    const log = pipeline(child.all!, createWriteStream(join(runtime, name)));
    const item = { child, log }; active.add(item);
    child.then(() => active.delete(item), () => active.delete(item)); log.catch(() => {}); return item;
  };
  const command = async (exe: string, args: string[], log: string, cwd = ROOT) => {
    const item = logged(exe, args, log, { cwd });
    try { await Promise.all([item.child, item.log]); } catch { throw new Error(`Command failed; see ${join(runtime, log)}`); }
  };
  const stop = async (role: Role) => {
    const item = processes.get(role); if (!item) return; processes.delete(role);
    await kill(item); await Promise.allSettled([item.child, item.log]);
  };
  const start = async (role: Role, profile = 'normal') => {
    await stop(role);
    const flags = { shortReaderAccess: ['control', 'content'].includes(role) && profile === 'short-reader' };
    const app = await roleCommand(role, 'acceptance', flags);
    processes.set(role, logged(app.exe, app.args, `28-${suite}-${role}-${profile}.log`, { cwd: role === 'reading' ? join(ROOT, 'reading') : join(ROOT, 'backend'), env: app.env, extendEnv: false, forceKillAfterDelay: 12000 }));
    if (role === 'reading') await waitUp(origin('reading'));
    else if (role !== 'index') await waitHttp(origin(role) + '/healthz', 150); // cold JVM starts on a loaded host exceed 60 s
    else {
      // Index has no HTTP endpoint; wait for its startup log before running scenarios.
      const file = join(runtime, `28-${suite}-${role}-${profile}.log`), until = Date.now() + 60000;
      while (Date.now() < until) {
        if (processes.get(role)!.child.nodeChildProcess.exitCode !== null) throw new Error(`Index exited; see ${file}`);
        if (existsSync(file) && readFileSync(file, 'utf8').includes('Started IndexApplication')) return;
        await sleep(250);
      }
      throw new Error(`Index did not start; see ${file}`);
    }
  };
  const testProfile = async (profile: string, config?: string, browserProject?: string, grep = options.grep, invert?: string) => {
    if (profile === 'short-reader') await start('content', profile);
    await start('control', profile); await waitHttp(origin('control') + '/health');
    const args = ['exec', 'playwright', 'test', '--workers=1', '--reporter=line', '--no-deps', ...(config ? ['--config', config] : []), ...(browserProject ? ['--project', browserProject] : []), ...(grep ? ['--grep', grep] : []), ...(invert ? ['--grep-invert', invert] : [])];
    const began = Date.now(); let passed = false;
    try {
      const log = `28-${suite}-${profile}-browser.log`;
      await command('pnpm', args, log, join(ROOT, 'acceptance'));
      if (warningLines(readFileSync(join(runtime, log), 'utf8')).length) throw new Error(`Browser acceptance emitted warnings; see ${join(runtime, log)}`);
      passed = true;
    }
    finally { results.push({ suite, profile, passed, seconds: (Date.now() - began) / 1000 }); }
    console.log(`${suite}/${profile} passed`);
  };
  const interrupted = () => { abort.abort(); for (const item of active) void kill(item); };
  process.once('SIGINT', interrupted); process.once('SIGTERM', interrupted);
  try {
    // The edge listens inside this project's persistent Caddy container, which survives between runs; only a foreign listener is a conflict.
    const ownedIngress = String((await run('docker', ['ps', '--filter', `name=^${project}-ingress-1$`, '--format', '{{.Names}}'], { reject: false })).stdout ?? '').trim() !== '';
    for (const role of ['control', 'content', 'reading', 'edge'] as const) {
      if (role === 'edge' && ownedIngress) continue;
      const occupied = await new Promise<boolean>(resolve => {
        const socket = connectTcp({ host: '127.0.0.1', port: port(role) });
        socket.once('connect', () => { socket.destroy(); resolve(true); }); socket.once('error', () => resolve(false));
      });
      if (occupied) throw new Error(`Port ${port(role)} has an unowned service; use another E2E_PORT_OFFSET`);
    }
    // Reading pages come from the Astro SSR artifact; build it before any process starts so a stale dist cannot be tested.
    await command('pnpm', ['build:reader'], '28-reading-build.log', join(ROOT, 'reading'));
    if (!existsSync(SITE_ENTRY)) throw new Error(`Reading frontend entry is missing after build: ${SITE_ENTRY}`);
    await init();
    await ensureObjectImage('docker', env);
    await command('docker', [...acceptanceCompose, 'up', '--wait', '--wait-timeout', '180', 'source', 'search', 'objects', 'mailpit'], '28-dependencies.log');
    await waitHttp(origin('mailpit') + '/api/v1/info');
    await provision(); await start('control'); await start('content'); await start('reading');
    await command('docker', [...acceptanceCompose, 'up', '-d', 'ingress'], '28-caddy.log');
    // Record the actual Caddy peer; trust only its observed address plus loopback.
    const until = Date.now() + 20000; let ready = false;
    while (!ready && Date.now() < until) {
      ready = await new Promise<boolean>(resolve => {
        const socket = connectTls({ host: '127.0.0.1', port: port('ingress'), servername: 'probe.acme.test', rejectUnauthorized: false });
        socket.setTimeout(2000); socket.once('secureConnect', () => socket.write(`GET /healthz HTTP/1.1\r\nHost: probe.acme.test:${port('ingress')}\r\nConnection: close\r\n\r\n`));
        socket.once('data', data => { socket.destroy(); resolve(/^HTTP\/1\.[01] 200/.test(data.toString())); }); socket.once('error', () => resolve(false)); socket.once('timeout', () => { socket.destroy(); resolve(false); });
      });
      if (!ready) await sleep(250);
    }
    if (!ready) throw new Error('Caddy cannot reach the Reader upstream');
    const logs = globSync('*', { cwd: join(runtime, 'content-peer-access') }).map(file => join(runtime, 'content-peer-access', file)).sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
    const peer = logs.length ? readFileSync(logs[0], 'utf8').trim().split('\n').at(-1)! : '';
    if (!isIP(peer)) throw new Error('Ingress peer was not recorded');
    // Reader is reached by Caddy (observed peer) and by the frontend, which runs on this host and connects over loopback.
    env.E2E_TRUSTED_PROXIES = trustedProxies(peer);
    const edge = await fetch(origin('edge') + '/healthz', { signal: AbortSignal.timeout(5000) }).catch(() => null);
    if (edge?.status !== 200) throw new Error('The plain-HTTP edge cannot reach the Reader upstream');
    process.env.E2E_TRUSTED_PROXIES = env.E2E_TRUSTED_PROXIES;
    await start('content'); await start('index');
    if (suite === 'vfs') {
      const venv = join(runtime, 'edition-vfs-venv'), python = join(venv, process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
      if (!existsSync(python)) await command(process.platform === 'win32' ? 'python' : 'python3', ['-m', 'venv', venv], '28-vfs-venv.log');
      await command(python, ['-m', 'pip', 'install', '-q', '-e', join(ROOT, 'clients/edition/python')], '28-vfs-install.log');
      env.EDITION_VFS_PYTHON = python;
    }
    await testProfile(options.profile === 'short-reader' ? 'short-reader' : 'normal', 'playwright.config.ts', suite);
    await exportContract(!options.updateContract, env.E2E_CONTENT_ORIGIN, env.E2E_BACKEND_ORIGIN);
    if (!results.some(result => result.passed)) throw new Error('No acceptance scenarios were selected');
  } finally {
    process.off('SIGINT', interrupted); process.off('SIGTERM', interrupted);
    for (const role of processes.keys()) await stop(role);
    rmSync(env.PWTEST_CACHE_DIR!, { recursive: true, force: true });
    try { await command('docker', [...acceptanceCompose, 'up', '-d', 'source'], '28-restore-databases.log'); } catch { console.error('Dependency recovery failed; inspect 28-restore-databases.log'); }
    const archive = join(runtime, 'runs', runId); mkdirSync(archive, { recursive: true });
    for (const result of results) {
      const log = `28-${suite}-${result.profile}-browser.log`; if (result.passed !== undefined && existsSync(join(runtime, log))) copyFileSync(join(runtime, log), join(archive, log));
    }
    writeFileSync(join(archive, 'results.json'), JSON.stringify({ suite, ...options, seconds: (Date.now() - started) / 1000, results }, null, 2) + '\n');
    for (const name of [`28-${suite}-results.json`, `28-${suite}-${options.profile}-results.json`]) writeFileSync(join(runtime, name), JSON.stringify(results, null, 2) + '\n');
  }
}
export async function verifyCommand(argv: string[]) {
  await new Command().description('Run the isolated real acceptance topology')
  .addArgument(new Argument('<suite>').choices(['delivery', 'private', 'vfs']))
  .option('--grep <pattern>', 'select scenarios', '').option('--update-contract', 'regenerate the Reader contract')
  .addOption(new Option('--profile <name>').choices(['all', 'normal', 'short-reader']).default('all'))
  .action(verify).parseAsync(argv, { from: 'user' });
}

/** Local lifecycle: Compose owns processes and data; Commander and Execa own CLI and execution. */

type Execute = (exe: string, args: readonly string[], options?: Options) => Promise<{ stdout?: unknown; exitCode?: number }>;
type Settings = { offset: number; demo: boolean };
const actions = ['doctor', 'setup', 'start', 'restart', 'stop', 'status', 'logs'];

export async function main(argv = process.argv.slice(2), execute: Execute = run, system = process.platform) {
  const cli = new Command().name('edition-platform').description('Check/install dependencies, deploy, start or stop the local platform')
    .addArgument(new Argument('<action>', 'doctor | setup | start | restart | stop | status | logs').choices(actions))
    .option('--project <name>', 'isolated Compose project and data volumes', 'dw-platform')
    .option('--port-offset <number>', 'move all exposed ports; retained for restart')
    .option('--demo', 'seed reader examples, management examples and a content PAT')
    .option('--no-demo', 'start services without seeding; retained for restart').exitOverride();
  try { cli.parse(argv, { from: 'user' }); } catch (error) { if ((error as { exitCode?: number }).exitCode === 0) return; throw error; }
  if (Number(process.versions.node.split('.')[0]) !== 24) throw new Error('Use Node 24, matching the frontend toolchain.');
  const [action] = cli.args, options = cli.opts<{ project: string; portOffset?: string; demo?: boolean }>();
  if (!/^[a-z][a-z0-9-]{1,47}$/.test(options.project)) throw new Error('Project must be a lowercase name of 2–48 characters.');
  const folder = join(DEV, `platform-${options.project}`), config = join(folder, 'deployment.json');
  const saved = existsSync(config) ? readJson<Settings>(config) : { offset: 0, demo: true };
  const offset = Number(options.portOffset ?? saved.offset), demo = options.demo ?? saved.demo;
  if (!Number.isInteger(offset) || offset < 0 || offset > 65535 - Math.max(...Object.values(ports))) throw new Error('Port offset is out of range.');
  const probe = async (exe: string, args: string[]) => {
    try { const result = await execute(exe, args, { reject: false, timeout: 5000 }); return result.exitCode === 0 ? String(result.stdout ?? '').trim() : ''; } catch { return ''; }
  };
  const candidates = ['docker', join(process.env.ProgramFiles ?? 'C:/Program Files', 'Docker/Docker/resources/bin/docker.exe'),
    '/Applications/Docker.app/Contents/Resources/bin/docker', '/Applications/OrbStack.app/Contents/MacOS/xbin/docker'];
  const findDocker = async () => { for (const path of candidates) if (await probe(path, ['--version'])) return path; };
  const install = ['setup', 'start', 'restart'].includes(action);
  let docker = await findDocker();
  if (!docker && install) {
    if (system === 'darwin') await execute('brew', ['install', '--cask', 'docker-desktop'], { stdio: 'inherit' });
    else if (system === 'win32') await execute('winget', ['install', '--exact', '--id', 'Docker.DockerDesktop', '--accept-package-agreements', '--accept-source-agreements'], { stdio: 'inherit' });
    else throw new Error('Install Docker Engine and the Compose plugin on Linux first.');
    docker = await findDocker();
  }
  if (!docker) throw new Error('Docker is missing; run setup or install Docker Desktop.');
  const version = (await probe(docker, ['compose', 'version', '--short'])).match(/(\d+)\.(\d+)\.(\d+)/);
  const [major, minor, patch] = version?.slice(1).map(Number) ?? [0, 0, 0];
  if (major < 2 || (major === 2 && (minor < 24 || (minor === 24 && patch < 4)))) {
    throw new Error('Docker Compose 2.24.4 or newer is required.');
  }
  if (!await probe(docker, ['info', '--format', '{{.OSType}}'])) {
    if (action === 'stop' || action === 'status') { console.log('Docker engine is stopped.'); return; }
    if (install) {
      if (system === 'darwin') await execute('open', ['-a', (await probe(docker, ['context', 'show'])).includes('orbstack') ? 'OrbStack' : 'Docker']);
      else if (system === 'win32') await execute(docker, ['desktop', 'start'], { stdio: 'inherit' });
      else throw new Error('Start the Docker Engine service on Linux first.');
      console.log('Waiting for Docker; complete first-run prompts in Docker Desktop if shown.');
      for (let n = 0; n < 60 && !await probe(docker, ['info', '--format', '{{.OSType}}']); n++) await sleep(2000);
    }
  }
  if (await probe(docker, ['info', '--format', '{{.OSType}}']) !== 'linux') throw new Error('A Linux Docker engine is required; start Docker Desktop and select Linux containers.');
  if (action === 'doctor') { console.log(`Node ${process.versions.node}; ${await probe(docker, ['compose', 'version'])}; Linux engine ready`); return; }
  // The project owns its volumes, keys and ports. Stop preserves them for the next start.
  const env = { ...process.env, EDITION_COMPOSE_PROJECT: options.project, E2E_STORAGE_NAMESPACE: options.project,
    EDITION_RUNTIME_DIR: folder, E2E_CONTENT_UPSTREAM: 'content:8095', E2E_CONTROL_UPSTREAM: 'control:8094', E2E_READING_UPSTREAM: 'reading:8096',
    E2E_TLS_CERT_FILE: join(folder, 'tls-cert.pem'), E2E_TLS_KEY_FILE: join(folder, 'tls-key.pem'),
    ...Object.fromEntries(Object.entries(ports).map(([name, port]) => [`E2E_${name.toUpperCase()}_PORT`, String(port + offset)])) };
  const projectCompose = (args: string[], input?: string) => execute(docker!, [
    ...composeFor(options.project), '--profile', 'platform', '--profile', 'ingress', ...args,
  ], { cwd: ROOT, env, input, stdout: 'inherit', stderr: 'inherit' });
  const up = (...services: string[]) => projectCompose(['up', '--wait', '--wait-timeout', '180', ...services]);
  if (action === 'status') { await projectCompose(['ps', '--all']); return; }
  if (action === 'logs') { await projectCompose(['logs', '--tail', '100']); return; }
  if (action === 'stop') { await projectCompose(['stop']); return; }
  mkdirSync(folder, { recursive: true });
  await projectCompose(['config', '--quiet']);
  await ensureObjectImage(docker!, env, execute);
  await projectCompose(['build', 'init', 'web', 'reading']);
  if (action === 'restart') await projectCompose(['stop']);
  await up('source', 'search', 'objects', 'mailpit');
  await projectCompose(['exec', '-T', 'source', 'psql', '-v', 'ON_ERROR_STOP=1', '-U', 'edition', '-d', 'edition'], readFileSync(join(DEPLOYMENT, 'source-logins.sql'), 'utf8'));
  await projectCompose(['run', '--rm', '--no-deps', 'init']);
  await projectCompose(['run', '--rm', '--no-deps', 'objects-init', objectInit('objects')]);
  writeJson(config, { offset, demo });
  if (action === 'setup') return;
  // The reading frontend calls Reader and Control from its own container: Reader must trust its address as well as the ingress.
  await up('reading', 'ingress');
  const address = async (service: string) => probe(docker!, ['inspect', '--format', '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}', `${options.project}-${service}-1`]);
  const [peer, site] = [await address('ingress'), await address('reading')];
  if (!isIP(peer)) throw new Error('Cannot identify the private HTTPS ingress address');
  if (!isIP(site)) throw new Error('Cannot identify the reading frontend address');
  Object.assign(env, { E2E_TRUSTED_PROXIES: `127.0.0.1,::1,${peer},${site}` });
  // Migration runs once at bootstrap. Reader and Worker can restart with the database alone.
  await up('control');
  await up('content', 'index', 'web');
  if (demo) await projectCompose(['run', '--rm', '--no-deps', 'seed']);
  console.log(`Reader: http://docs.localhost:${ports.browser + offset}/docs/intro\nRuntime: ${folder}`);
}

/** Manual role diagnosis; Compose and acceptance share the same credential preparation. */

export async function diagnose(argv = process.argv.slice(2)) {
  const cli = new Command().description('Prepare scoped credentials or run one independent application');
  cli.command('init').action(async () => {
    await init(); const file = credentialsFile(), saved = readJson(file);
    await mintMeili(origin('search'), 'acceptance-master-key', saved); writeJson(file, saved);
    console.log('Stable platform keys prepared.');
  });
  cli.command('provision').action(() => provision());
  cli.command('bootstrap').action(async () => { await init(DEV); await provision('local'); console.log(`Scoped local credentials: ${DEV}`); });
  cli.command('run').addArgument(new Argument('<role>').choices(['control', 'content', 'index']))
    .addOption(new Option('--environment <mode>').choices(['local', 'acceptance']).default('local'))
    .option('--port <number>').option('--short-reader-access').option('--short-sessions').option('--acceptance-timeouts')
    .action(async (role: Role, options) => {
      const command = await roleCommand(role, options.environment as Mode, options);
      const child = run(command.exe, command.args, { env: command.env, extendEnv: false, cwd: join(ROOT, 'backend'), stdio: 'inherit', forceKillAfterDelay: 12000 });
      const stop = () => child.kill();
      process.once('SIGINT', stop); process.once('SIGTERM', stop);
      try { await child; } finally { process.off('SIGINT', stop); process.off('SIGTERM', stop); }
    });
  await cli.parseAsync(argv, { from: 'user' });
}

/** Keep repository VFS convenience while the read-only client remains an independent Python SDK. */

export async function vfs(argv = process.argv.slice(2)) {
  const cli = new Command().helpOption(false).allowUnknownOption().passThroughOptions().argument('[words...]')
    .option('--project <name>', 'local platform project', 'dw-platform').option('--python <path>', 'Python with the EditionVFS client installed');
  cli.parse(argv, { from: 'user' });
  const options = cli.opts<{ project: string; python?: string }>(), words = cli.args;
  if (!/^[a-z][a-z0-9-]{1,47}$/.test(options.project)) throw new Error('Invalid platform project');
  const folder = join(DEV, `platform-${options.project}`), venv = join(folder, 'vfs-venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
  const python = options.python ?? (existsSync(venv) ? venv : process.platform === 'win32' ? 'python' : 'python3');
  const config = join(folder, 'deployment.json'), offset = existsSync(config) ? readJson<{ offset: number }>(config).offset : 0;
  const defaults = words.some(word => ['--origin', '--host', '--space'].includes(word)) ? [] : ['--origin', `http://127.0.0.1:${8095 + offset}`, '--host', 'docs.localhost', '--space', 'docs'];
  // Pass argv and raw streams directly: no shell evaluation or binary output conversion.
  const result = await run(python, [join(ROOT, 'clients/edition/python/src/edition_vfs/cli.py'), ...defaults, ...words], { cwd: process.cwd(), stdio: 'inherit', reject: false, buffer: false });
  return result.exitCode ?? 1;
}

/** One repeatable seed: reader examples, management examples and a tenant-scoped content PAT. */

type Row = { id: string; [key: string]: any };
type Page = readonly [slug: string, title: string, format: string, content: string, publish: boolean];
const controlURL = process.env.LOCAL_CONTROL_ORIGIN ?? 'http://localhost:8094';
const contentURL = process.env.LOCAL_CONTENT_ORIGIN ?? 'http://localhost:8095';
// Reading pages are rendered by the frontend; Reader answers JSON only.
const readingURL = process.env.LOCAL_READING_ORIGIN ?? 'http://localhost:8096';
const browserURL = process.env.LOCAL_BROWSER_ORIGIN ?? 'http://localhost:4176';
const demoHost = process.env.LOCAL_READER_HOST ?? 'docs.localhost';
const sample = (name: string) => readFileSync(join(ROOT, 'infra/content', `${name}.md`), 'utf8');
const pages: Page[] = [
  ['intro', '开始使用', 'markdown', '# 开始使用\n\n把内容放进空间，保存修订，再发版给读者。\n', true],
  ['guide', '操作说明', 'markdown', '# 操作说明\n\n1. 保存工作稿\n2. 进版\n3. 发版\n4. 通过站点阅读\n', true],
  ['note', 'HTML 示例', 'html', '<p>同一份内容也可以是 HTML。</p>\n', true],
  ['draft', '工作稿', 'markdown', '# 工作稿\n\n未进版的页面不会出现在读者和消费面里。\n', false],
  ...(['a2ui-example', 'json-schema-example', 'xml-example'] as const).map((slug, i): Page => [slug, ['Google A2UI 示例', 'JSON Schema 示例', 'XML 示例'][i], 'markdown', sample(slug), true]),
  ['deep', '深入阅读', 'markdown', '# 深入阅读\n\n用目录定位内容。\n\n## 空间\n\n从空间切换到需要阅读的主题。\n\n### 页面目录\n\n右侧目录跟随当前页面的小节。\n\n## 关联资源\n\n[外部资料](https://example.com/) 可以正常打开。\n', true],
];
const apiPages: Page[] = [
  ['start', '接口总览', 'markdown', '# 接口总览\n\n从认证开始，按需阅读 Webhook 与数据格式示例。\n', true],
  ['authentication', '认证与权限', 'markdown', '# 认证与权限\n\n为应用签发阅读令牌，只授予所需空间的 read 范围。\n', true],
  ['webhook-payload', 'Webhook 事件示例', 'json', '{"event":"page.published","space":"api","version":1}\n', true],
  ['next-version', '下一版草稿', 'markdown', '# 下一版草稿\n\n这页已保存，但尚未交付给读者。\n', false],
];
const opsPages: Page[] = [
  ['incident', '故障响应', 'markdown', '# 故障响应\n\n先确认影响范围，再记录时间线和恢复结果。\n', true],
  ['checklist', '值班清单', 'markdown', '# 值班清单\n\n- 检查服务健康\n- 查看待处理作业\n', false],
];
export const PAT_NAME = '本地内容维护';
export const PAT_SCOPES = ['content:read', 'content:write', 'content:publish'];
export const TOKEN_PATH = '/api/v1/me/access-tokens';

async function api(method: string, path: string, token?: string, body?: unknown, extra: Record<string, string> = {}) {
  const headers = { Origin: browserURL, Accept: 'application/json', 'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}`, 'Idempotency-Key': randomUUID() } : {}), ...extra };
  const response = await fetch(controlURL + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw Object.assign(new Error(`${method} ${path} failed (${response.status})`), { status: response.status });
  return response.status === 204 ? undefined : response.headers.get('content-type')?.startsWith('application/json') ? response.json() : response.text();
}
async function items(token: string, path: string): Promise<Row[]> {
  const rows: Row[] = []; let cursor: string | undefined;
  do { const page = await api('GET', `${path}?limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`, token); rows.push(...page.items); cursor = page.nextCursor; } while (cursor);
  return rows;
}
function nodes(rows: Row[]): Row[] { return rows.flatMap(row => [row, ...nodes(row.children ?? [])]); }
async function ensure(token: string, path: string, name: string, body: object = {}): Promise<[Row, boolean]> {
  const found = (await items(token, path)).find(row => row.name === name);
  return found ? [found, false] : [await api('POST', path, token, { name, ...body }), true];
}
export async function ensurePages(token: string, base: string, space: Row, specs: readonly Page[]) {
  const path = `${base}/spaces/${space.id}/pages`, found = Object.fromEntries((await items(token, path)).map(page => [page.slug, page]));
  // Existing slugs retain the user's body, draft and publication state.
  for (const [slug, title, format, content, publish] of specs) if (!found[slug]) {
    const page = await api('POST', path, token, { slug, title, format });
    await api('PUT', `${path}/${page.id}/content`, token, { content }, { 'If-Match': '"rev-0"' });
    if (publish) await api('POST', `${path}/${page.id}:publish`, token);
    found[slug] = page;
  }
  return found;
}
async function mount(token: string, base: string, site: Row, slug: string, space: Row) {
  const detail = await api('GET', `${base}/sites/${site.id}`, token);
  if (!(detail.mounts ?? []).some((row: Row) => row.slug === slug)) await api('PUT', `${base}/sites/${site.id}/mounts/${slug}`, token, { spaceId: space.id });
}
async function domain(token: string, base: string, site: Row, name: string, verify: boolean) {
  const path = `${base}/sites/${site.id}/domains`, bound = (await items(token, `${base}/domains`)).some(row => row.host === name);
  const detail = bound ? await api('GET', `${path}/${name}`, token) : await api('POST', path, token, { host: name });
  if (verify && !detail.verified) {
    if (!/^[a-z0-9_.-]+$/.test(detail.txtName) || !/^[A-Za-z0-9_.-]+$/.test(detail.txtValue)) throw new Error('Invalid DNS stub');
    const command = process.env.EDITION_CONTAINER === '1' ? ['psql', '-h', 'source'] : ['docker', 'exec', '-i', process.env.LOCAL_SOURCE_CONTAINER ?? 'dw-platform-source-1', 'psql'];
    await run(command[0], [...command.slice(1), '-v', 'ON_ERROR_STOP=1', '-U', 'edition', '-d', 'edition'], { input: `insert into shared.dns_txt_stubs(name,value) values('${detail.txtName}','${detail.txtValue}') on conflict do nothing;` });
    await api('POST', `${path}/${name}:verify`, token);
  }
}
async function readerDemo(token: string, base: string) {
  const existing = (await items(token, `${base}/sites`)).find(site => (site.domains ?? []).some((row: Row) => row.host === demoHost));
  const [site, created] = existing ? [existing, false] : await ensure(token, `${base}/sites`, '本地站');
  const detail = await api('GET', `${base}/sites/${site.id}`, token), mounted = (detail.mounts ?? []).find((row: Row) => row.slug === 'docs');
  const space = mounted ? { id: mounted.spaceId } : (await ensure(token, `${base}/spaces`, '本地指南', { mode: 'authored' }))[0];
  const found = await ensurePages(token, base, space, pages);
  await mount(token, base, site, 'docs', space);
  if (!detail.home) await api('PATCH', `${base}/sites/${site.id}`, token, { locale: 'zh-CN', home: space.id, titleTemplate: '%s | 本地站' }, { 'Content-Type': 'application/merge-patch+json' });
  if (created) await api('PUT', `${base}/sites/${site.id}/permissions/grants/anonymous`, token, { role: 'reader' });
  await domain(token, base, site, demoHost, true);
  const toc = `${base}/spaces/${space.id}/toc/entries`;
  const entry = async (kind: string, label: string, parentId: string | null = null, targetId: string | null = null, position = 0, url: string | null = null) => {
    const tree = nodes((await api('GET', toc, token)).entries);
    let row = tree.find(row => row.kind === kind && (targetId ? row.targetId === targetId : row.label === label));
    if (!row) { await api('POST', toc, token, { kind, label, parentId, targetId, url }); row = nodes((await api('GET', toc, token)).entries).find(row => row.kind === kind && (targetId ? row.targetId === targetId : row.label === label))!; }
    if (row.parentId !== parentId) await api('POST', `${toc}/${row.id}:move`, token, { parentId, position });
    return row;
  };
  await entry('target', '开始使用', null, found.intro.id);
  const route = await entry('group', '阅读路径');
  await entry('target', '操作说明', route.id, found.guide.id);
  const branch = await entry('group', '进阶内容', route.id, null, 1);
  await entry('target', '深入阅读', branch.id, found.deep.id);
  await entry('link', '外部资料', route.id, null, 2, 'https://example.com/');
  const formats = await entry('group', '数据格式');
  for (const [i, slug] of ['a2ui-example', 'json-schema-example', 'xml-example'].entries()) await entry('target', pages.find(page => page[0] === slug)![1], formats.id, found[slug].id, i);
  if (!(detail.mounts ?? []).some((row: Row) => row.slug === 'examples')) {
    const example = (await ensure(token, `${base}/spaces`, '阅读案例', { mode: 'authored' }))[0];
    const examplePages = await ensurePages(token, base, example, [['start', '案例首页', 'markdown', '# 案例首页\n\n## 选择空间\n\n从顶部切换器回到指南。\n', true]]);
    const path = `${base}/spaces/${example.id}/toc/entries`;
    if (!nodes((await api('GET', path, token)).entries).some(row => row.targetId === examplePages.start.id)) await api('POST', path, token, { label: '案例首页', kind: 'target', targetId: examplePages.start.id });
    await mount(token, base, site, 'examples', example);
  }
}
async function showcase(token: string, base: string) {
  const collection = async (name: string, icon: string, parentId: string | null = null) => {
    const find = async () => nodes((await api('GET', `${base}/collections`, token)).collections).find(row => row.name === name && row.parentId === parentId);
    const found = await find(); if (found) return found;
    await api('POST', `${base}/collections`, token, { name, icon, ...(parentId ? { parentId } : {}) }); return (await find())!;
  };
  const content = await collection('内容库', 'book'), guides = await collection('产品指南', 'guide', content.id), developers = await collection('开发者资料', 'api', content.id);
  const reference = await collection('接口规范', 'reference', developers.id), team = await collection('团队协作', 'book');
  const operations = await collection('运维', 'code', team.id), external = await collection('外部内容', 'reference'); await collection('待整理', 'book');
  const spaces = Object.fromEntries((await items(token, `${base}/spaces`)).map(row => [row.name, row]));
  const place = async (space: Row, group: Row) => { if (!space.collectionId) await api('PUT', `${base}/collections/${group.id}/spaces/${space.id}`, token); };
  await place(spaces['本地指南'], guides); await place(spaces['阅读案例'], developers);
  const apiSpace = (await ensure(token, `${base}/spaces`, '接口参考', { mode: 'authored' }))[0], ops = (await ensure(token, `${base}/spaces`, '运维手册', { mode: 'authored' }))[0];
  const synced = (await ensure(token, `${base}/spaces`, '外部同步示例', { mode: 'synced' }))[0], empty = (await ensure(token, `${base}/spaces`, '空白工作区', { mode: 'authored' }))[0];
  for (const [space, group] of [[apiSpace, reference], [ops, operations], [synced, external], [empty, guides]]) await place(space, group);
  const apiFound = await ensurePages(token, base, apiSpace, apiPages), opsFound = await ensurePages(token, base, ops, opsPages);
  const docs = Object.fromEntries((await items(token, `${base}/spaces/${spaces['本地指南'].id}/pages`)).map(row => [row.slug, row]));
  const examples = Object.fromEntries((await items(token, `${base}/spaces/${spaces['阅读案例'].id}/pages`)).map(row => [row.slug, row]));
  const tags: [Row, Row, string[]][] = [[spaces['本地指南'], docs.intro, ['入门', '重要']], [spaces['阅读案例'], examples.start, ['入门', '示例']], [apiSpace, apiFound.start, ['API', '入门']], [apiSpace, apiFound.authentication, ['API', '重要']], [apiSpace, apiFound['webhook-payload'], ['API', '示例']], [apiSpace, apiFound['next-version'], ['草稿']], [ops, opsFound.incident, ['运维', '重要', '内部']], [ops, opsFound.checklist, ['运维', '草稿', '内部']]];
  for (const [space, page, labels] of tags) for (const label of labels) await api('PUT', `${base}/spaces/${space.id}/pages/${page.id}/tags/${encodeURIComponent(label)}`, token);
  const [publicSite, created] = await ensure(token, `${base}/sites`, '开发者中心'); await mount(token, base, publicSite, 'api', apiSpace);
  if (!publicSite.home) await api('PATCH', `${base}/sites/${publicSite.id}`, token, { home: apiSpace.id, locale: 'zh-CN', titleTemplate: '%s | 开发者中心' }, { 'Content-Type': 'application/merge-patch+json' });
  if (created) await api('PUT', `${base}/sites/${publicSite.id}/permissions/grants/anonymous`, token, { role: 'reader' });
  await domain(token, base, publicSite, 'api.localhost', true); await domain(token, base, publicSite, 'preview-api.localhost', false);
  const redirects = `${base}/sites/${publicSite.id}/redirects`;
  if (!(await items(token, redirects)).some(row => row.path === '/old-api-overview')) await api('POST', redirects, token, { path: '/old-api-overview', targetType: 'page', targetId: apiFound.start.id });
  const privateSite = (await ensure(token, `${base}/sites`, '团队知识库'))[0]; await mount(token, base, privateSite, 'runbook', ops); await domain(token, base, privateSite, 'internal.localhost', true);
  for (const name of ['文档维护', '发布审核']) await ensure(token, `${base}/teams`, name);
}

type Checkpoint = { context: { origin: string; ownerId: string; tenantId: string }; key: string; startedAt: string; request: object; issued?: { token: Row; secret: string } };
export async function ensurePat(session: string, tenant: string, folder: string, check = false) {
  const checkpoint = join(folder, 'management-pat.json'), secretFile = join(folder, 'management-pat.token');
  const actor = await api('GET', '/api/v1/auth/context', session), context = { origin: process.env.LOCAL_PUBLIC_CONTROL_ORIGIN ?? controlURL, ownerId: actor.actorId, tenantId: tenant };
  let listed = await items(session, TOKEN_PATH), saved: Checkpoint;
  if (existsSync(checkpoint)) {
    saved = readJson<Checkpoint>(checkpoint);
    if (!isDeepStrictEqual(saved.context, context)) throw new Error('PAT checkpoint belongs to another origin, owner or tenant; use a separate runtime directory');
  } else {
    if (check) throw new Error('Local management PAT checkpoint is missing');
    if (listed.some(row => row.name === PAT_NAME && row.tenantId === tenant && row.status === 'active')) throw new Error('Local management PAT already exists without its checkpoint; revoke it before reseeding');
    saved = { context, key: randomUUID(), startedAt: new Date().toISOString(), request: { name: PAT_NAME, scopes: PAT_SCOPES, tenantId: tenant, expiry: new Date(Date.now() + 30 * 86400000).toISOString() } };
    privateWrite(checkpoint, JSON.stringify(saved) + '\n');
  }
  if (!saved.issued) {
    if (check) throw new Error('Local management PAT issuance is incomplete; rerun the seed');
    // Keep the exact request and key for recovery within the server's 24-hour replay window.
    if (Date.now() - Date.parse(saved.startedAt) >= 23 * 3600000) throw new Error('PAT issuance recovery window elapsed; inspect and revoke the seed PAT before removing its checkpoint');
    saved.issued = await api('POST', TOKEN_PATH, session, saved.request, { 'Idempotency-Key': saved.key });
    privateWrite(checkpoint, JSON.stringify(saved) + '\n'); listed = await items(session, TOKEN_PATH);
  }
  const issued = saved.issued!, current = listed.find(row => row.id === issued.token.id);
  if (!current || current.status !== 'active') {
    if (check) throw new Error('Local management PAT is expired, revoked or absent');
    console.log('Local management PAT is expired, revoked or absent; issue a new PAT through the management API.'); return false;
  }
  const auth = await api('GET', '/api/v1/auth/context', issued.secret);
  if (auth.credentialType !== 'management_token' || auth.actorId !== context.ownerId || auth.credentialId !== current.id || auth.tenantId !== tenant || !isDeepStrictEqual([...auth.scopes].sort(), [...PAT_SCOPES].sort())) throw new Error('Local management PAT does not match the demo owner, tenant or content scopes');
  await api('GET', `/api/v1/tenants/${tenant}/spaces?limit=1`, issued.secret);
  if (check) {
    if (!existsSync(secretFile) || readFileSync(secretFile, 'utf8').trim() !== issued.secret) throw new Error('Local management PAT secret file is missing or differs; rerun the seed');
  } else { chmodSync(checkpoint, 0o600); privateWrite(secretFile, issued.secret + '\n'); }
  console.log(`Local management PAT ready (content maintenance, expires ${current.expiry}): ${secretFile}`); return true;
}
async function checkShowcase(token: string, base: string) {
  const require = (wanted: string[], actual: string[], what: string) => { if (wanted.some(name => !actual.includes(name))) throw new Error(`Showcase ${what} are incomplete`); };
  require(['内容库', '产品指南', '开发者资料', '接口规范', '团队协作', '运维', '外部内容', '待整理'], nodes((await api('GET', `${base}/collections`, token)).collections).map(row => row.name), 'collections');
  const spaces = await items(token, `${base}/spaces`), sites = await items(token, `${base}/sites`);
  require(['本地指南', '阅读案例', '接口参考', '运维手册', '外部同步示例', '空白工作区'], spaces.map(row => row.name), 'spaces');
  require(['入门', '示例', 'api', '运维', '重要', '内部', '草稿'], (await items(token, `${base}/tags`)).map(row => row.label), 'tags');
  require(['本地站', '开发者中心', '团队知识库'], sites.map(row => row.name), 'sites');
  require(['api.localhost', 'internal.localhost', 'preview-api.localhost'], (await items(token, `${base}/domains`)).map(row => row.host), 'domains');
  require(['文档维护', '发布审核'], (await items(token, `${base}/teams`)).map(row => row.name), 'teams');
  require(['/old-api-overview'], (await items(token, `${base}/sites/${sites.find(row => row.name === '开发者中心')!.id}/redirects`)).map(row => row.path), 'redirects');
  require(apiPages.map(page => page[0]), (await items(token, `${base}/spaces/${spaces.find(row => row.name === '接口参考')!.id}/pages`)).map(row => row.slug), 'pages');
}
async function reader(path: string, query: Record<string, string> = {}, binary = false, siteHost = demoHost, base = contentURL) {
  // Node's fetch discards Host; the native client preserves the Reader's virtual-site identity.
  const url = new URL(base + path); url.search = new URLSearchParams(query).toString();
  const body = await new Promise<Buffer>((resolve, reject) => {
    (url.protocol === 'https:' ? httpsGet : httpGet)(url, { headers: { Host: siteHost, Accept: binary ? '*/*' : 'application/json' }, signal: AbortSignal.timeout(10000) }, async response => {
      try {
        if (response.statusCode !== 200) { response.resume(); throw new Error(`Reader ${path} failed (${response.statusCode})`); }
        const chunks: Buffer[] = []; let size = 0;
        for await (const chunk of response) { size += chunk.length; if (size > 67108864) throw new Error('Reader response exceeds 64 MiB'); chunks.push(Buffer.from(chunk)); }
        resolve(Buffer.concat(chunks));
      } catch (error) { response.destroy(); reject(error); }
    }).on('error', reject);
  });
  return binary ? body : JSON.parse(body.toString('utf8'));
}
async function checkReader() {
  const until = Date.now() + 60000; let last = 'No probe';
  while (Date.now() < until) try {
    const snap = await reader('/api/content/spaces/docs/snapshot'), example = await reader('/api/content/spaces/examples/snapshot');
    if (!snap.snapshot || !example.snapshot) throw new Error('Reader snapshot is pending');
    const toc: Row[] = await reader('/api/content/toc/docs'), route = toc.find(row => row.kind === 'group' && row.label === '阅读路径');
    const branch = (route?.children ?? []).find((row: Row) => row.label === '进阶内容'), formats = toc.find(row => row.label === '数据格式');
    if (!(branch?.children ?? []).some((row: Row) => row.href === '/docs/deep') || !(route?.children ?? []).some((row: Row) => row.href === 'https://example.com/') || ['a2ui-example', 'json-schema-example', 'xml-example'].some(slug => !(formats?.children ?? []).some((row: Row) => row.href === `/docs/${slug}`))) throw new Error('Reader hierarchy is pending');
    const files = (await reader('/api/content/spaces/docs/files', { snapshot: snap.snapshot, limit: '100' })).entries.map((row: Row) => row.path);
    if (pages.filter(page => page[4]).some(page => !files.includes('/' + page[0])) || files.some((path: string) => path.includes('draft'))) throw new Error('Reader listing is incomplete or exposes a draft');
    if (!(await reader('/api/content/spaces/docs/content', { snapshot: snap.snapshot, path: '/intro' }, true)).length) throw new Error('Intro content is empty');
    for (const [path, marker] of [['/a2ui-example', '"createSurface"'], ['/json-schema-example', '"$schema"'], ['/xml-example', '<document id="doc-1024"']]) if (!(await reader('/api/content/spaces/docs/content', { snapshot: snap.snapshot, path }, true)).includes(marker)) throw new Error(`Reader sample missing: ${path}`);
    // Reader answers the page as JSON; the frontend renders the stable reading markers from it.
    const intro = await reader('/api/content/pages/docs/intro');
    if (!intro?.title || !String(intro.content ?? '').includes('开始使用')) throw new Error('Reader page JSON is incomplete');
    const html: Buffer = await reader('/docs/intro', {}, true, demoHost, readingURL);
    if (!html.includes('class="page-main"') || !html.includes('href="/examples"')) throw new Error('Reading frontend HTML is incomplete');
    await reader('/api/start', {}, true, 'api.localhost'); return snap;
  } catch (error) { last = (error as Error).message; await sleep(500); }
  throw new Error(`Reader content not ready: ${last}`);
}
export async function seed(check = false) {
  let login; const readyUntil = Date.now() + 30000;
  // A new dev owner can be awaiting Worker projection; invalid credentials fail immediately.
  while (!login) try {
    login = await api('POST', '/auth/login', undefined, { email: process.env.LOCAL_SEED_EMAIL ?? 'owner@dev.local', password: process.env.LOCAL_SEED_PASSWORD ?? 'password1' });
  } catch (error) { if ((error as { status?: number }).status !== 503 || Date.now() >= readyUntil) throw error; await sleep(500); }
  const token = login.accessToken, me = await api('GET', '/api/v1/me', token), tenant = me.tenants?.[0]?.id;
  if (!tenant) throw new Error('The demo owner has no tenant; provision an owner first');
  const base = `/api/v1/tenants/${tenant}`;
  if (!check) { await readerDemo(token, base); await showcase(token, base); }
  await checkShowcase(token, base);
  await ensurePat(token, tenant, process.env.LOCAL_SEED_RUNTIME_DIR ?? join(DEV, 'platform-dw-platform'), check);
  const snap = await checkReader(); console.log(`Local demo ready (${snap.name} @ ${demoHost})\n  reader ${readingURL}/docs/intro (Host: ${demoHost})`);
}
export async function seedCommand(argv: string[]) {
  await new Command().description('Seed reader examples, management examples and one content PAT').option('--check', 'verify without creating data or changing credential files').action(options => seed(options.check)).parseAsync(argv, { from: 'user' });
}

/** Replay bounded telemetry; advance the byte checkpoint only after ingestion succeeds. */

type State = { inode?: number; offset?: number; gaps?: number };
type Event = Record<string, unknown>;
function collectorId(log: string) {
  const digest = createHash('sha1').update(Buffer.from('6ba7b8119dad11d180b400c04fd430c8', 'hex')).update(process.env.ANALYTICS_COLLECTOR_ID ?? `${hostname()}:${resolve(log)}`).digest().subarray(0, 16);
  digest[6] = (digest[6] & 15) | 80; digest[8] = (digest[8] & 63) | 128;
  const hex = digest.toString('hex'); return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
export function readBatch(log: string, state: State) {
  const stat = statSync(log), rotated = state.inode !== undefined && state.inode !== stat.ino;
  let offset = rotated ? 0 : state.offset ?? 0, gaps = state.gaps ?? 0;
  if (rotated || stat.size < offset) { gaps++; offset = 0; }
  const fd = openSync(log, 'r'), batch: Event[] = [], buffer = Buffer.alloc(65537);
  let position = offset, length = 0, pieces: Buffer[] = [];
  try {
    while (batch.length < 200) {
      const count = readSync(fd, buffer, 0, buffer.length, position); if (!count) break;
      const start = position; position += count;
      for (let index = 0; index < count && batch.length < 200;) {
        const newline = buffer.indexOf(10, index), end = newline >= 0 && newline < count ? newline + 1 : count;
        length += end - index;
        if (length <= 65536) pieces.push(Buffer.from(buffer.subarray(index, end))); else pieces = [];
        index = end;
        if (newline < 0 || newline >= count) break; // An incomplete tail is retried from the last committed line.
        offset = start + end;
        if (length <= 65536) {
          let row: Event | undefined;
          try { row = JSON.parse(Buffer.concat(pieces).toString('utf8')); } catch {}
          if (row?.event === 'delivery.analytics') {
            const event = typeof row.telemetry === 'string' ? JSON.parse(row.telemetry) : row.telemetry;
            if (event && typeof event === 'object' && !Array.isArray(event)) batch.push(event as Event);
          }
        }
        length = 0; pieces = [];
      }
    }
  } finally { closeSync(fd); }
  return { batch, state: { inode: stat.ino, offset, gaps } };
}
export async function collect(log: string, origin: string, once: boolean, key: string) {
  const checkpoint = log.replace(/\.[^/\\.]+$/, '') + '.collector-offset.json', id = collectorId(log);
  let lastHeartbeat = 0;
  do {
    try {
      const { batch, state } = readBatch(log, existsSync(checkpoint) ? readJson<State>(checkpoint) : {});
      const heartbeat = Date.now() - lastHeartbeat >= 5000;
      if (heartbeat) batch.push({ id: randomUUID(), sourceId: id, time: new Date().toISOString(), type: 'collector_heartbeat', zero: false, observable: false, dropped: state.gaps });
      if (batch.length) {
        const response = await fetch(origin + '/internal/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Analytics-Key': key }, body: JSON.stringify(batch), signal: AbortSignal.timeout(10000) });
        if (response.status !== 200) throw new Error('Ingestion rejected');
        if (heartbeat) lastHeartbeat = Date.now();
      }
      writeJson(checkpoint, state);
      if (!once && !batch.length) await sleep(1000);
    } catch {
      // Keep the checkpoint retryable and never print request bodies or credentials.
      if (once) throw new Error('Analytics collection unavailable; checkpoint retained');
      await sleep(5000);
    }
  } while (!once);
}
export async function collectCommand(argv: string[]) {
  await new Command().description('Collect Reader telemetry with replayable byte checkpoints')
  .option('--log <path>', 'reader application log', join(DEV, 'content-application.log')).option('--origin <url>', 'Control origin', 'http://localhost:8091').option('--once', 'ingest one batch and exit')
  .action(async options => {
    const legacy = join(DEV, 'delivery.env');
    const key = process.env.ANALYTICS_INGEST_KEY ?? (existsSync(legacy) ? Object.fromEntries(readFileSync(legacy, 'utf8').split('\n').filter(Boolean).map(line => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)])) : readJson(credentialsFile(DEV))).ANALYTICS_INGEST_KEY;
    if (!key) throw new Error('ANALYTICS_INGEST_KEY is required');
    await collect(options.log, options.origin, !!options.once, key);
  }).parseAsync(argv, { from: 'user' });
}

/** One quality entry point. Test ownership remains with each application; no test suite is duplicated. */

const scopes = ['infra', 'backend', 'cli', 'vfs', 'compiler'] as const;
type Scope = typeof scopes[number];
export type Result = { name: string; exitCode: number; warnings: string[]; log: string };
function backendModules(workspace: string) {
  const inventory = JSON.parse(readFileSync(join(workspace, 'backend/concept-modules.json'), 'utf8')) as { concepts: { directory: string }[] };
  if (!Array.isArray(inventory.concepts) || inventory.concepts.length === 0) throw new Error('Backend concept coverage inventory is empty');
  const concepts = inventory.concepts.map(concept => concept.directory);
  if (new Set(concepts).size !== concepts.length || concepts.some(path => !/^libraries\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path))) throw new Error('Backend concept coverage inventory is invalid');
  const libraries = globSync('backend/libraries/*/build.gradle.kts', { cwd: workspace })
    .map(path => dirname(path).replace(/^backend\//, ''))
    .filter(path => !concepts.includes(path)).sort();
  if (libraries.length === 0) throw new Error('Backend technical-library coverage inventory is empty');
  return ['apps/control', 'apps/content', 'apps/index', ...concepts, ...libraries];
}
const gradle = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const python = process.env.EDITION_QUALITY_PYTHON ?? (process.platform === 'win32' ? 'python' : 'python3');

/** Stream every diagnostic and save it. Continue independent checks so one run reports all failures. */
async function command(name: string, executable: string, args: string[], directory = '.', extra: NodeJS.ProcessEnv = {}): Promise<Result> {
  const log = join(ROOT, '.scratch/dw-v1/runtime/quality/logs', `${name}.log`);
  mkdirSync(dirname(log), { recursive: true });
  console.log(`\n[quality] ${name}`);
  const env = { ...process.env, ...extra };
  // Execa handles Windows .cmd launchers without constructing a shell command from arguments.
  const child = execa(executable, args, { cwd: join(ROOT, directory), env, reject: false });
  let text = '';
  child.stdout.on('data', chunk => { text += String(chunk); process.stdout.write(chunk); });
  child.stderr.on('data', chunk => { text += String(chunk); process.stderr.write(chunk); });
  const exitCode = await child.then(result => result.exitCode ?? 1, error => { text += `${error.message}\n`; return 1; });
  writeFileSync(log, text);
  return { name, exitCode, warnings: warningLines(text), log };
}

export async function check(mode: string, options: { scope: string; measure?: boolean }, dependencies: { root?: string; execute?: typeof command } = {}) {
  // The execution seam lets orchestration tests use a temporary repository and deterministic commands.
  // Production and tests cross this same interface; applications keep their real integration suites.
  const workspace = dependencies.root ?? ROOT;
  const output = join(workspace, '.scratch/dw-v1/runtime/quality');
  const execute = dependencies.execute ?? command;
  if (!['doctor', 'static', 'coverage', 'acceptance', 'all'].includes(mode)) throw new Error(`Unknown quality mode: ${mode}`);
  if (!['all', ...scopes].includes(options.scope)) throw new Error(`Unknown quality scope: ${options.scope}`);
  if (process.versions.node.split('.')[0] !== '24') throw new Error('Use Node 24 before running quality checks.');
  if (options.measure && mode !== 'coverage') throw new Error('--measure is only valid for coverage.');
  const selected = options.scope === 'all' ? [...scopes] : [options.scope as Scope];
  const results: Result[] = [], coverage: Record<string, Coverage> = {}, errors: string[] = [];
  const record = async (name: string, exe: string, args: string[], dir = '.', env = {}) => results.push(await execute(name, exe, args, dir, env));
  const read = (path: string) => readFileSync(join(workspace, path), 'utf8');
  const collect = (name: string, path: string, kind: 'java' | 'js' | 'python') => {
    try {
      const text = read(path);
      coverage[name] = kind === 'java' ? javaCoverage(text) : kind === 'js' ? javascriptCoverage(JSON.parse(text)) : pythonCoverage(JSON.parse(text));
      errors.push(...coverageErrors(name, coverage[name], kind === 'java' ? ['lines', 'branches', 'methods'] : kind === 'js' ? ['lines', 'branches', 'functions', 'statements'] : ['lines', 'branches']));
    } catch (error) { errors.push(`${name}: cannot read current coverage: ${(error as Error).message}`); }
  };
  const gradleArgs = ['--no-daemon', '--max-workers=2', '--console=plain', '--warning-mode=fail'];

  if (mode === 'doctor' || mode === 'all') {
    await record('node', process.execPath, ['--version']);
    await record('pnpm', pnpm, ['--version']);
    await record('java', 'java', ['-version']);
    await record('python', python, ['--version']);
    await record('docker', 'docker', ['info', '--format', '{{.ServerVersion}}']);
  }
  if (mode === 'static' || mode === 'all') {
    await record('repository', process.execPath, ['infra/edition.ts', 'repository']);
    if (selected.includes('infra')) await record('infra-types', pnpm, ['check'], 'infra');
    if (selected.includes('backend')) await record('backend-check', gradle, [...gradleArgs, 'check', 'bootJar'], 'backend');
    if (selected.includes('cli')) await record('cli-check', gradle, [...gradleArgs, 'check'], 'clients/control');
    if (selected.includes('vfs') || selected.includes('compiler')) {
      const paths = [...(selected.includes('vfs') ? ['clients/edition/python'] : []), ...(selected.includes('compiler') ? ['clients/control/scripts'] : [])];
      await record('python-lint', python, ['-m', 'ruff', 'check', '--select', 'E9,F63,F7,F82,F401', ...paths]);
    }
  }
  if (mode === 'coverage' || mode === 'all') {
    // Remove stale reports before each owner runs: a failed command must not reuse yesterday's result.
    const { rmSync } = await import('node:fs');
    const clear = (path: string) => rmSync(join(workspace, path), { recursive: true, force: true });
    if (selected.includes('infra')) {
      clear('.scratch/dw-v1/runtime/quality/coverage/infra');
      await record('infra-coverage', pnpm, ['exec', 'c8', '--config', 'c8.json', ...(options.measure ? ['--check-coverage=false'] : []), 'node', '--test', 'tests/*.test.ts'], 'infra');
      collect('infra', '.scratch/dw-v1/runtime/quality/coverage/infra/coverage-summary.json', 'js');
    }
    for (const [scope, directory] of [['backend', 'backend'], ['cli', 'clients/control']] as const) {
      if (!selected.includes(scope)) continue;
      const modules = scope === 'backend' ? backendModules(workspace) : [''];
      for (const module of modules) clear(`${directory}/${module}/build/reports/jacoco/test`);
      await record(`${scope}-coverage`, gradle, [...gradleArgs, 'test', 'jacocoTestReport', ...(options.measure ? [] : ['jacocoTestCoverageVerification'])], directory);
      for (const module of modules) collect(module || 'control-cli', `${directory}/${module}/build/reports/jacoco/test/jacocoTestReport.xml`, 'java');
    }
    for (const scope of ['vfs', 'compiler'] as const) {
      if (!selected.includes(scope)) continue;
      const data = join(output, `${scope}.coverage`), json = join(output, 'coverage', scope, 'coverage.json');
      const source = scope === 'vfs' ? 'edition_vfs' : 'clients/control/scripts';
      const tests = scope === 'vfs' ? 'clients/edition/python/tests' : 'clients/control/scripts/tests';
      clear(`.scratch/dw-v1/runtime/quality/coverage/${scope}`);
      rmSync(data, { force: true });
      for (const path of globSync(`${data}.*`)) rmSync(path, { force: true });
      const env = { COVERAGE_RCFILE: join(ROOT, 'infra/python.coveragerc'), COVERAGE_FILE: data, EDITION_COVERAGE_SOURCE: source };
      await record(`${scope}-tests`, python, ['-W', 'error', '-m', 'coverage', 'run', '-m', 'unittest', 'discover', '-s', tests, '-p', 'test_*.py'], '.', env);
      await record(`${scope}-combine`, python, ['-m', 'coverage', 'combine', '--keep'], '.', env);
      await record(`${scope}-report`, python, ['-m', 'coverage', 'json', `--data-file=${data}`, '-o', json], '.', env);
      collect(scope, `.scratch/dw-v1/runtime/quality/coverage/${scope}/coverage.json`, 'python');
    }
  }
  if (mode === 'acceptance' || mode === 'all') {
    // These suites share a topology. Await each one; parallel runs can corrupt test preconditions.
    const env = { EDITION_COMPOSE_PROJECT: process.env.EDITION_COMPOSE_PROJECT ?? 'dw-quality', E2E_STORAGE_NAMESPACE: process.env.E2E_STORAGE_NAMESPACE ?? 'dw-quality', E2E_PORT_OFFSET: process.env.E2E_PORT_OFFSET ?? '2000', E2E_RUNTIME_DIR: process.env.E2E_RUNTIME_DIR ?? join(output, 'acceptance') };
    for (const suite of ['delivery', 'private', 'vfs']) await record(`acceptance-${suite}`, process.execPath, ['infra/edition.ts', 'verify', suite], '.', env);
  }
  const commandFailures = results.filter(result => result.exitCode !== 0 || result.warnings.length > 0);
  const passed = commandFailures.length === 0 && errors.length === 0;
  mkdirSync(output, { recursive: true });
  const report = { mode, scope: options.scope, measurementOnly: Boolean(options.measure), passed, results, coverage, coverageErrors: errors };
  writeFileSync(join(output, `${mode}-${options.scope}.json`), JSON.stringify(report, null, 2) + '\n');
  for (const error of errors) console.error(`[quality] ${error}`);
  if (commandFailures.length || (!options.measure && errors.length)) throw new Error(`Quality checks failed. See ${output}`);
  console.log(options.measure ? '[quality] Measurement complete; this is not an acceptance pass.' : '[quality] All selected checks passed without warnings.');
}

export async function qualityCommand(argv: string[]) {
  await new Command().description('Run quality checks without moving application-owned tests')
    .argument('<mode>', 'doctor, static, coverage, acceptance, or all')
    .addOption(new Option('--scope <name>').choices(['all', ...scopes]).default('all'))
    .option('--measure', 'collect coverage gaps without accepting the result')
    .action(async (mode, options) => {
      if (!['doctor', 'static', 'coverage', 'acceptance', 'all'].includes(mode)) throw new Error(`Unknown quality mode: ${mode}`);
      await check(mode, options);
    }).parseAsync(argv, { from: 'user' });
}


const commands = {
  platform: main,
  diagnose,
  vfs: async (argv: string[]) => { process.exitCode = await vfs(argv); },
  verify: verifyCommand,
  seed: seedCommand,
  collect: collectCommand,
  quality: qualityCommand,
  repository: repositoryCommand,
};
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, ...rest] = process.argv.slice(2);
  const names = Object.keys(commands).join('|');
  if (!command || command === '--help' || command === '-h') {
    console.log(`Usage: node infra/edition.ts <${names}> ...`);
    process.exitCode = command ? 0 : 1;
  } else if (!Object.hasOwn(commands, command)) {
    console.error(`Unknown command ${command}. Usage: node infra/edition.ts <${names}> ...`);
    process.exitCode = 1;
  } else {
    Promise.resolve(commands[command as keyof typeof commands](rest)).catch(error => {
      console.error(error.shortMessage ?? error.message); process.exitCode = error.isCanceled ? 130 : 1;
    });
  }
}
