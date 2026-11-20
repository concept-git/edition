package io.space.control.compositions.releases.bundleimport;

import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.InetAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.UnknownHostException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.Semaphore;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * 受理时同步拉取远程 zip 的出流量守卫：仅 https、每跳 DNS 重验拒私网、最多 5 跳、不带凭据、
 * 连接 10 s / 总时长 60 s、服务端并发 ≤4。大小上限由 {@link ImportZipIngress} 边读边截。
 *
 * <p>失败分类：用户给的地址不可用 → {@link ImportSourceUnreachableException}（4xx）；
 * 地址本身不允许 → {@link ImportSourceForbiddenException}（4xx）；我方并发满 → {@link ImportRemoteBusyException}（503）。
 * 残余风险：DNS 校验与实际连接之间的重绑定窗口——JDK HttpClient 不支持按已校验 IP 连接；
 * 校验用的 {@link InetAddress#getAllByName} 与随后的连接共用 JVM 解析缓存（{@code networkaddress.cache.ttl}，
 * 默认 30 s），把窗口压到缓存 TTL 内；部署时不得把该 TTL 设为 0。
 */
@Component
class RemoteZipFetcher {
    static final long MAX_REMOTE_ZIP_BYTES = 100L * 1024 * 1024;
    static final int MAX_REDIRECTS = 5;
    static final int MAX_CONCURRENT_FETCHES = 4;
    static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(10);
    static final Duration TOTAL_TIMEOUT = Duration.ofSeconds(60);
    private static final String USER_AGENT = "space-import/1";
    private static final Set<Integer> REDIRECTS = Set.of(301, 302, 303, 307, 308);

    private final HttpClient client;
    private final Set<String> allowedHosts;
    /** 包内可见供并发测试直接占满额度。 */
    final Semaphore permits = new Semaphore(MAX_CONCURRENT_FETCHES, true);

    private final Clock clock;
    private final HostResolver resolver;

    @Autowired
    RemoteZipFetcher(@Value("${io.space.import.remote.allowed-hosts:}") List<String> allowedHosts) {
        this(allowedHosts, Clock.systemUTC(), InetAddress::getAllByName, defaultClient());
    }

    RemoteZipFetcher(List<String> allowedHosts, Clock clock, HostResolver resolver, HttpClient client) {
        this.allowedHosts = allowedHosts.stream()
                .map(String::strip)
                .filter(host -> !host.isEmpty())
                .map(host -> host.toLowerCase(Locale.ROOT))
                .collect(Collectors.toUnmodifiableSet());
        this.clock = clock;
        this.resolver = resolver;
        this.client = client;
    }

    static HttpClient defaultClient() {
        return HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.NEVER)
                .connectTimeout(CONNECT_TIMEOUT)
                .build();
    }

    /** 打开远程正文；调用方负责关闭（关闭即归还并发额度）。 */
    Fetched open(String rawUrl) {
        URI url = parse(rawUrl);
        if (!permits.tryAcquire()) throw new ImportRemoteBusyException();
        boolean handedOver = false;
        try {
            Instant deadline = clock.instant().plus(TOTAL_TIMEOUT);
            HttpResponse<InputStream> response = follow(url, deadline);
            Fetched fetched = new Fetched(response.body(), response.uri().toString(), permits, deadline, clock);
            handedOver = true;
            return fetched;
        } finally {
            if (!handedOver) permits.release();
        }
    }

    private HttpResponse<InputStream> follow(URI first, Instant deadline) {
        URI current = first;
        for (int hop = 0; hop <= MAX_REDIRECTS; hop++) {
            guard(current, hop == 0);
            HttpResponse<InputStream> response = send(current, deadline);
            if (REDIRECTS.contains(response.statusCode())) {
                closeQuietly(response.body());
                Optional<String> location = response.headers().firstValue("Location");
                if (location.isEmpty()) throw new ImportSourceUnreachableException("redirect_without_location");
                current = resolveRedirect(current, location.get());
                continue;
            }
            if (response.statusCode() == 200) return response;
            closeQuietly(response.body());
            throw new ImportSourceUnreachableException("http_" + response.statusCode());
        }
        throw new ImportSourceForbiddenException("too_many_redirects");
    }

    private HttpResponse<InputStream> send(URI url, Instant deadline) {
        Duration remaining = Duration.between(clock.instant(), deadline);
        if (remaining.isNegative() || remaining.isZero()) throw new ImportSourceUnreachableException("timeout");
        HttpRequest request = HttpRequest.newBuilder(url)
                .GET()
                .timeout(remaining)
                .header("User-Agent", USER_AGENT)
                .header("Accept", "application/zip, application/octet-stream;q=0.9, */*;q=0.1")
                .build();
        try {
            return client.send(request, HttpResponse.BodyHandlers.ofInputStream());
        } catch (HttpTimeoutException timeout) {
            throw new ImportSourceUnreachableException("timeout");
        } catch (IOException io) {
            throw new ImportSourceUnreachableException("connect_failed");
        } catch (InterruptedException interrupted) {
            Thread.currentThread().interrupt();
            throw new ImportSourceUnreachableException("interrupted");
        }
    }

    private static URI parse(String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) throw new ImportSourceForbiddenException("empty_url");
        try {
            return new URI(rawUrl.strip());
        } catch (URISyntaxException malformed) {
            throw new ImportSourceForbiddenException("malformed_url");
        }
    }

    private static URI resolveRedirect(URI from, String location) {
        try {
            return from.resolve(new URI(location.strip()));
        } catch (URISyntaxException | IllegalArgumentException malformed) {
            throw new ImportSourceForbiddenException("malformed_redirect");
        }
    }

    /**
     * 每一跳都重新走：有主机、无用户信息、https、DNS 全部地址非私网。
     * 白名单主机是运维明示信任的来源（测试栈 MinIO、自建 GitLab），豁免 https 与地址检查——
     * 但只对用户直接给出的首跳生效：公开地址 302 到白名单主机仍按公网规则拒绝，堵住"借跳转打内网"。
     */
    void guard(URI url, boolean firstHop) {
        if (url.getHost() == null || url.getHost().isBlank()) throw new ImportSourceForbiddenException("missing_host");
        if (url.getRawUserInfo() != null) throw new ImportSourceForbiddenException("userinfo_not_allowed");
        String host = url.getHost().toLowerCase(Locale.ROOT);
        String scheme = url.getScheme() == null ? "" : url.getScheme().toLowerCase(Locale.ROOT);
        if (firstHop && allowedHosts.contains(host)) {
            if (!scheme.equals("https") && !scheme.equals("http")) {
                throw new ImportSourceForbiddenException("scheme_not_http");
            }
            return;
        }
        if (!scheme.equals("https")) throw new ImportSourceForbiddenException("scheme_not_https");
        InetAddress[] addresses;
        try {
            addresses = resolver.resolve(host);
        } catch (UnknownHostException unknown) {
            throw new ImportSourceUnreachableException("dns_failed");
        }
        if (addresses == null || addresses.length == 0) throw new ImportSourceUnreachableException("dns_failed");
        for (InetAddress address : addresses) {
            if (!publicAddress(address)) throw new ImportSourceForbiddenException("private_address");
        }
    }

    static boolean publicAddress(InetAddress address) {
        if (address.isAnyLocalAddress()
                || address.isLoopbackAddress()
                || address.isLinkLocalAddress()
                || address.isSiteLocalAddress()
                || address.isMulticastAddress()) {
            return false;
        }
        byte[] raw = address.getAddress();
        if (raw.length == 4) {
            int first = raw[0] & 0xff;
            int second = raw[1] & 0xff;
            if (first == 100 && second >= 64 && second <= 127) return false; // 100.64.0.0/10 CGNAT
            if (first == 0) return false; // 0.0.0.0/8
            return !(first == 192 && second == 0 && (raw[2] & 0xff) == 0); // 192.0.0.0/24
        }
        if (raw.length == 16) {
            int first = raw[0] & 0xff;
            if ((first & 0xfe) == 0xfc) return false; // fc00::/7 unique local
            boolean v4Mapped = true;
            for (int i = 0; i < 10; i++) v4Mapped &= raw[i] == 0;
            v4Mapped &= (raw[10] & 0xff) == 0xff && (raw[11] & 0xff) == 0xff;
            if (v4Mapped) {
                try {
                    return publicAddress(InetAddress.getByAddress(new byte[] {raw[12], raw[13], raw[14], raw[15]}));
                } catch (UnknownHostException impossible) {
                    return false;
                }
            }
        }
        return true;
    }

    private static void closeQuietly(InputStream body) {
        if (body == null) return;
        try {
            body.close();
        } catch (IOException ignored) {
            // 重定向/错误响应的正文无关紧要
        }
    }

    @FunctionalInterface
    interface HostResolver {
        InetAddress[] resolve(String host) throws UnknownHostException;
    }

    /** 远程正文；关闭时归还并发额度。 */
    static final class Fetched implements AutoCloseable {
        private final InputStream body;
        private final String finalUrl;
        private final Semaphore permits;
        private final AtomicBoolean released = new AtomicBoolean();

        Fetched(InputStream body, String finalUrl, Semaphore permits, Instant deadline, Clock clock) {
            this.finalUrl = finalUrl;
            this.permits = permits;
            this.body = new DeadlineInputStream(body, deadline, clock, this::releasePermit);
        }

        InputStream body() {
            return body;
        }

        String finalUrl() {
            return finalUrl;
        }

        @Override
        public void close() throws IOException {
            try {
                body.close();
            } finally {
                releasePermit();
            }
        }

        private void releasePermit() {
            if (released.compareAndSet(false, true)) permits.release();
        }
    }

    /**
     * 读正文期间超过总时长即按超时中止（JDK HttpClient 的 timeout 只覆盖响应头）；
     * 正文中途断流（连接重置、截断）同样是远端问题，翻译为 unreachable 而不是让 IOException 变成 500。
     */
    static final class DeadlineInputStream extends FilterInputStream {
        private static final java.util.concurrent.ScheduledThreadPoolExecutor DEADLINES = scheduler();
        private final Instant deadline;
        private final Clock clock;
        private final AtomicBoolean expired = new AtomicBoolean();
        private final Runnable onTimeout;
        private final java.util.concurrent.ScheduledFuture<?> timeout;

        DeadlineInputStream(InputStream in, Instant deadline, Clock clock) {
            this(in, deadline, clock, () -> {});
        }

        DeadlineInputStream(InputStream in, Instant deadline, Clock clock, Runnable onTimeout) {
            super(in);
            this.deadline = deadline;
            this.clock = clock;
            this.onTimeout = onTimeout;
            this.timeout = DEADLINES.schedule(
                    this::expire,
                    Math.max(0, Duration.between(clock.instant(), deadline).toNanos()),
                    java.util.concurrent.TimeUnit.NANOSECONDS);
        }

        @Override
        public int read() throws IOException {
            check();
            try {
                int read = super.read();
                check();
                return read;
            } catch (IOException broken) {
                throw new ImportSourceUnreachableException(expired.get() ? "timeout" : "read_failed");
            }
        }

        @Override
        public int read(byte[] buffer, int offset, int length) throws IOException {
            check();
            try {
                int read = super.read(buffer, offset, length);
                check();
                return read;
            } catch (IOException broken) {
                throw new ImportSourceUnreachableException(expired.get() ? "timeout" : "read_failed");
            }
        }

        private void check() {
            if (!clock.instant().isBefore(deadline)) expire();
            if (expired.get()) throw new ImportSourceUnreachableException("timeout");
        }

        private void expire() {
            if (!expired.compareAndSet(false, true)) return;
            onTimeout.run();
            closeQuietly(in);
        }

        @Override
        public void close() throws IOException {
            timeout.cancel(false);
            super.close();
        }

        private static java.util.concurrent.ScheduledThreadPoolExecutor scheduler() {
            var scheduler = new java.util.concurrent.ScheduledThreadPoolExecutor(1, work -> {
                var thread = new Thread(work, "remote-import-deadline");
                thread.setDaemon(true);
                return thread;
            });
            scheduler.setRemoveOnCancelPolicy(true);
            return scheduler;
        }
    }
}
