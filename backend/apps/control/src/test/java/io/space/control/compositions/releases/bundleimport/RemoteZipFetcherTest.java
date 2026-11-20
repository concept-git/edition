package io.space.control.compositions.releases.bundleimport;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.InetAddress;
import java.net.URI;
import java.net.UnknownHostException;
import java.net.http.HttpClient;
import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.function.Function;
import javax.net.ssl.SSLSession;
import org.junit.jupiter.api.Test;

class RemoteZipFetcherTest {
    private static final InetAddress PUBLIC = address(93, 184, 216, 34);
    private static final InetAddress PRIVATE = address(10, 0, 0, 7);

    @Test
    void followsRedirectsRevalidatingEveryHopAndReturnsFinalBody() throws Exception {
        ScriptedHttpClient http = new ScriptedHttpClient();
        http.on(
                "https://github.com/o/r/archive/refs/heads/main.zip",
                redirect(302, "https://codeload.github.com/o/r/zip/refs/heads/main"));
        http.on("https://codeload.github.com/o/r/zip/refs/heads/main", ok("PKzip"));
        List<String> resolved = new ArrayList<>();
        RemoteZipFetcher fetcher = fetcher(
                http,
                host -> {
                    resolved.add(host);
                    return new InetAddress[] {PUBLIC};
                },
                List.of());

        try (RemoteZipFetcher.Fetched fetched = fetcher.open("https://github.com/o/r/archive/refs/heads/main.zip")) {
            assertThat(new String(fetched.body().readAllBytes(), StandardCharsets.UTF_8))
                    .isEqualTo("PKzip");
            assertThat(fetched.finalUrl()).isEqualTo("https://codeload.github.com/o/r/zip/refs/heads/main");
        }
        assertThat(resolved).containsExactly("github.com", "codeload.github.com");
        assertThat(http.requests).allSatisfy(request -> {
            assertThat(request.headers().firstValue("User-Agent")).contains("space-import/1");
            assertThat(request.headers().firstValue("Authorization")).isEmpty();
            assertThat(request.headers().firstValue("Cookie")).isEmpty();
        });
        assertThat(fetcher.permits.availablePermits()).isEqualTo(RemoteZipFetcher.MAX_CONCURRENT_FETCHES);
    }

    @Test
    void redirectIntoPrivateNetworkIsForbiddenEvenWhenFirstHopIsPublic() {
        ScriptedHttpClient http = new ScriptedHttpClient();
        http.on("https://public.example/x.zip", redirect(302, "https://internal.example/x.zip"));
        RemoteZipFetcher fetcher =
                fetcher(http, host -> new InetAddress[] {host.startsWith("internal") ? PRIVATE : PUBLIC}, List.of());
        assertForbidden(fetcher, "https://public.example/x.zip", "private_address");
        assertThat(http.requests).hasSize(1);
        assertThat(fetcher.permits.availablePermits()).isEqualTo(RemoteZipFetcher.MAX_CONCURRENT_FETCHES);
    }

    @Test
    void tooManyRedirectsIsForbidden() {
        ScriptedHttpClient http = new ScriptedHttpClient();
        for (int i = 0; i <= RemoteZipFetcher.MAX_REDIRECTS; i++) {
            http.on("https://loop.example/" + i, redirect(301, "https://loop.example/" + (i + 1)));
        }
        RemoteZipFetcher fetcher = fetcher(http, host -> new InetAddress[] {PUBLIC}, List.of());
        assertForbidden(fetcher, "https://loop.example/0", "too_many_redirects");
    }

    @Test
    void schemeHostAndUserinfoRulesAreForbidden() {
        RemoteZipFetcher fetcher = fetcher(new ScriptedHttpClient(), host -> new InetAddress[] {PUBLIC}, List.of());
        assertForbidden(fetcher, "http://example.com/x.zip", "scheme_not_https");
        assertForbidden(fetcher, "ftp://example.com/x.zip", "scheme_not_https");
        assertForbidden(fetcher, "https://user:pw@example.com/x.zip", "userinfo_not_allowed");
        assertForbidden(fetcher, "https:///x.zip", "missing_host");
        assertForbidden(fetcher, "not a url", "malformed_url");
        assertForbidden(fetcher, "", "empty_url");
    }

    @Test
    void privateLoopbackLinkLocalAndMetadataAddressesAreNotPublic() throws Exception {
        assertThat(RemoteZipFetcher.publicAddress(address(127, 0, 0, 1))).isFalse();
        assertThat(RemoteZipFetcher.publicAddress(address(10, 1, 2, 3))).isFalse();
        assertThat(RemoteZipFetcher.publicAddress(address(172, 16, 0, 1))).isFalse();
        assertThat(RemoteZipFetcher.publicAddress(address(192, 168, 1, 1))).isFalse();
        assertThat(RemoteZipFetcher.publicAddress(address(169, 254, 169, 254))).isFalse();
        assertThat(RemoteZipFetcher.publicAddress(address(100, 64, 0, 1))).isFalse();
        assertThat(RemoteZipFetcher.publicAddress(address(0, 0, 0, 0))).isFalse();
        assertThat(RemoteZipFetcher.publicAddress(InetAddress.getByName("::1"))).isFalse();
        assertThat(RemoteZipFetcher.publicAddress(InetAddress.getByName("fd00::1")))
                .isFalse();
        assertThat(RemoteZipFetcher.publicAddress(InetAddress.getByName("fe80::1")))
                .isFalse();
        assertThat(RemoteZipFetcher.publicAddress(InetAddress.getByName("::ffff:10.0.0.1")))
                .isFalse();
        assertThat(RemoteZipFetcher.publicAddress(PUBLIC)).isTrue();
        assertThat(RemoteZipFetcher.publicAddress(InetAddress.getByName("2606:4700::1111")))
                .isTrue();
    }

    @Test
    void allowedHostSkipsAddressCheckAndPermitsPlainHttp() throws Exception {
        ScriptedHttpClient http = new ScriptedHttpClient();
        http.on("http://minio:9000/attachments/f.zip?X-Amz-Signature=abc", ok("PK"));
        RemoteZipFetcher fetcher = fetcher(
                http,
                host -> {
                    throw new AssertionError("allowed host must not be resolved");
                },
                List.of(" MinIO ", "gitlab.internal"));
        try (RemoteZipFetcher.Fetched fetched =
                fetcher.open("http://minio:9000/attachments/f.zip?X-Amz-Signature=abc")) {
            assertThat(fetched.body().readAllBytes()).hasSize(2);
        }
        assertForbidden(fetcher, "ftp://minio/x.zip", "scheme_not_http");
    }

    @Test
    void redirectIntoAnAllowedHostIsStillJudgedAsPublicTraffic() {
        ScriptedHttpClient http = new ScriptedHttpClient();
        http.on("https://public.example/x.zip", redirect(302, "http://minio:9000/x.zip"));
        RemoteZipFetcher fetcher = fetcher(http, host -> new InetAddress[] {PUBLIC}, List.of("minio"));
        assertForbidden(fetcher, "https://public.example/x.zip", "scheme_not_https");
        assertThat(http.requests).hasSize(1);
    }

    @Test
    void dnsFailureAndNon200AreUnreachable() {
        ScriptedHttpClient http = new ScriptedHttpClient();
        http.on("https://gone.example/x.zip", status(404));
        RemoteZipFetcher fetcher = fetcher(
                http,
                host -> {
                    if (host.equals("nowhere.invalid")) throw new UnknownHostException(host);
                    return new InetAddress[] {PUBLIC};
                },
                List.of());
        assertUnreachable(fetcher, "https://nowhere.invalid/x.zip", "dns_failed");
        assertUnreachable(fetcher, "https://gone.example/x.zip", "http_404");
        assertThat(fetcher.permits.availablePermits()).isEqualTo(RemoteZipFetcher.MAX_CONCURRENT_FETCHES);
    }

    @Test
    void connectFailureIsUnreachable() {
        ScriptedHttpClient http = new ScriptedHttpClient();
        http.failing("https://down.example/x.zip", new IOException("connection refused"));
        RemoteZipFetcher fetcher = fetcher(http, host -> new InetAddress[] {PUBLIC}, List.of());
        assertUnreachable(fetcher, "https://down.example/x.zip", "connect_failed");
    }

    @Test
    void brokenBodyStreamIsUnreachableReadFailedNotAnInternalError() throws Exception {
        ScriptedHttpClient http = new ScriptedHttpClient();
        http.on(
                "https://flaky.example/x.zip",
                request -> new StubResponse(request, 200, Map.of(), null, () -> new InputStream() {
                    @Override
                    public int read() throws IOException {
                        throw new IOException("connection reset");
                    }
                }));
        RemoteZipFetcher fetcher = fetcher(http, host -> new InetAddress[] {PUBLIC}, List.of());
        try (RemoteZipFetcher.Fetched fetched = fetcher.open("https://flaky.example/x.zip")) {
            assertThatExceptionOfType(ImportSourceUnreachableException.class)
                    .isThrownBy(() -> fetched.body().read(new byte[8]))
                    .satisfies(failure ->
                            assertThat(failure.violations().getFirst().code()).isEqualTo("read_failed"));
        }
    }

    @Test
    void bodyReadPastTotalDeadlineIsUnreachableTimeout() throws Exception {
        MutableClock clock = new MutableClock(Instant.parse("2026-09-11T00:00:00Z"));
        ScriptedHttpClient http = new ScriptedHttpClient();
        http.on("https://slow.example/x.zip", ok("PK....slow"));
        RemoteZipFetcher fetcher = new RemoteZipFetcher(List.of(), clock, host -> new InetAddress[] {PUBLIC}, http);
        try (RemoteZipFetcher.Fetched fetched = fetcher.open("https://slow.example/x.zip")) {
            byte[] two = new byte[2];
            assertThat(fetched.body().read(two)).isEqualTo(2);
            clock.advance(RemoteZipFetcher.TOTAL_TIMEOUT.plusSeconds(1));
            assertThatExceptionOfType(ImportSourceUnreachableException.class)
                    .isThrownBy(() -> fetched.body().read(two))
                    .satisfies(failure ->
                            assertThat(failure.violations().getFirst().code()).isEqualTo("timeout"));
        }
    }

    @Test
    void aBodyThatStopsAfterHeadersIsInterruptedAtTheDeadline() throws Exception {
        var server = com.sun.net.httpserver.HttpServer.create(
                new java.net.InetSocketAddress(InetAddress.getLoopbackAddress(), 0), 0);
        var release = new java.util.concurrent.CountDownLatch(1);
        server.createContext("/stalled", exchange -> {
            exchange.sendResponseHeaders(200, 0);
            exchange.getResponseBody().flush();
            try {
                release.await(5, java.util.concurrent.TimeUnit.SECONDS);
            } catch (InterruptedException interrupted) {
                Thread.currentThread().interrupt();
            }
            exchange.close();
        });
        server.start();
        try (var client = HttpClient.newHttpClient();
                var pool = java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor()) {
            var response = client.send(
                    HttpRequest.newBuilder(URI.create(
                                    "http://localhost:" + server.getAddress().getPort() + "/stalled"))
                            .build(),
                    HttpResponse.BodyHandlers.ofInputStream());
            try (var body = new RemoteZipFetcher.DeadlineInputStream(
                    response.body(), Instant.now().plusMillis(150), Clock.systemUTC())) {
                var read = pool.submit(() -> body.read());
                try {
                    org.assertj.core.api.Assertions.assertThatThrownBy(
                                    () -> read.get(2, java.util.concurrent.TimeUnit.SECONDS))
                            .isInstanceOf(java.util.concurrent.ExecutionException.class)
                            .hasCauseInstanceOf(ImportSourceUnreachableException.class);
                } finally {
                    release.countDown();
                    read.cancel(true);
                }
            }
        } finally {
            release.countDown();
            server.stop(0);
        }
    }

    @Test
    void concurrencyBudgetExhaustedIsBusyAndReleasedOnClose() throws Exception {
        ScriptedHttpClient http = new ScriptedHttpClient();
        http.on("https://a.example/x.zip", ok("PK"));
        RemoteZipFetcher fetcher = fetcher(http, host -> new InetAddress[] {PUBLIC}, List.of());
        List<RemoteZipFetcher.Fetched> held = new ArrayList<>();
        for (int i = 0; i < RemoteZipFetcher.MAX_CONCURRENT_FETCHES; i++) {
            held.add(fetcher.open("https://a.example/x.zip"));
        }
        assertThatExceptionOfType(ImportRemoteBusyException.class)
                .isThrownBy(() -> fetcher.open("https://a.example/x.zip"));
        held.getFirst().close();
        held.getFirst().close(); // 幂等：不会多还一个额度
        try (RemoteZipFetcher.Fetched again = fetcher.open("https://a.example/x.zip")) {
            assertThat(again).isNotNull();
        }
        for (RemoteZipFetcher.Fetched fetched : held.subList(1, held.size())) fetched.close();
        assertThat(fetcher.permits.availablePermits()).isEqualTo(RemoteZipFetcher.MAX_CONCURRENT_FETCHES);
    }

    private static RemoteZipFetcher fetcher(
            HttpClient http, RemoteZipFetcher.HostResolver resolver, List<String> allowed) {
        return new RemoteZipFetcher(allowed, Clock.systemUTC(), resolver, http);
    }

    private static void assertForbidden(RemoteZipFetcher fetcher, String url, String reason) {
        assertThatExceptionOfType(ImportSourceForbiddenException.class)
                .isThrownBy(() -> fetcher.open(url).close())
                .satisfies(failure ->
                        assertThat(failure.violations().getFirst().code()).isEqualTo(reason));
    }

    private static void assertUnreachable(RemoteZipFetcher fetcher, String url, String reason) {
        assertThatExceptionOfType(ImportSourceUnreachableException.class)
                .isThrownBy(() -> fetcher.open(url).close())
                .satisfies(failure ->
                        assertThat(failure.violations().getFirst().code()).isEqualTo(reason));
    }

    private static InetAddress address(int a, int b, int c, int d) {
        try {
            return InetAddress.getByAddress(new byte[] {(byte) a, (byte) b, (byte) c, (byte) d});
        } catch (UnknownHostException impossible) {
            throw new IllegalStateException(impossible);
        }
    }

    private static Function<HttpRequest, HttpResponse<InputStream>> ok(String body) {
        return request -> new StubResponse(request, 200, Map.of(), body.getBytes(StandardCharsets.UTF_8));
    }

    private static Function<HttpRequest, HttpResponse<InputStream>> status(int code) {
        return request -> new StubResponse(request, code, Map.of(), new byte[0]);
    }

    private static Function<HttpRequest, HttpResponse<InputStream>> redirect(int code, String location) {
        return request -> new StubResponse(request, code, Map.of("Location", List.of(location)), new byte[0]);
    }

    /** 可编排的 HttpClient：按 URL 返回脚本化响应或抛 IO 异常，记录全部请求。 */
    static final class ScriptedHttpClient extends HttpClient {
        final List<HttpRequest> requests = new ArrayList<>();
        private final Map<String, Function<HttpRequest, HttpResponse<InputStream>>> routes = new java.util.HashMap<>();
        private final Map<String, IOException> failures = new java.util.HashMap<>();

        void on(String url, Function<HttpRequest, HttpResponse<InputStream>> handler) {
            routes.put(url, handler);
        }

        void failing(String url, IOException failure) {
            failures.put(url, failure);
        }

        @Override
        @SuppressWarnings("unchecked")
        public <T> HttpResponse<T> send(HttpRequest request, HttpResponse.BodyHandler<T> handler) throws IOException {
            requests.add(request);
            String url = request.uri().toString();
            IOException failure = failures.get(url);
            if (failure != null) throw failure;
            Function<HttpRequest, HttpResponse<InputStream>> route = routes.get(url);
            if (route == null) throw new AssertionError("unscripted request: " + url);
            return (HttpResponse<T>) route.apply(request);
        }

        @Override
        public <T> CompletableFuture<HttpResponse<T>> sendAsync(
                HttpRequest request, HttpResponse.BodyHandler<T> handler) {
            throw new UnsupportedOperationException();
        }

        @Override
        public <T> CompletableFuture<HttpResponse<T>> sendAsync(
                HttpRequest request, HttpResponse.BodyHandler<T> handler, HttpResponse.PushPromiseHandler<T> push) {
            throw new UnsupportedOperationException();
        }

        @Override
        public Optional<java.net.CookieHandler> cookieHandler() {
            return Optional.empty();
        }

        @Override
        public Optional<Duration> connectTimeout() {
            return Optional.empty();
        }

        @Override
        public Redirect followRedirects() {
            return Redirect.NEVER;
        }

        @Override
        public Optional<java.net.ProxySelector> proxy() {
            return Optional.empty();
        }

        @Override
        public javax.net.ssl.SSLContext sslContext() {
            throw new UnsupportedOperationException();
        }

        @Override
        public javax.net.ssl.SSLParameters sslParameters() {
            throw new UnsupportedOperationException();
        }

        @Override
        public Optional<java.net.Authenticator> authenticator() {
            return Optional.empty();
        }

        @Override
        public Version version() {
            return Version.HTTP_1_1;
        }

        @Override
        public Optional<java.util.concurrent.Executor> executor() {
            return Optional.empty();
        }
    }

    record StubResponse(
            HttpRequest request,
            int statusCode,
            Map<String, List<String>> headerMap,
            byte[] bytes,
            java.util.function.Supplier<InputStream> bodySupplier)
            implements HttpResponse<InputStream> {
        StubResponse(HttpRequest request, int statusCode, Map<String, List<String>> headerMap, byte[] bytes) {
            this(request, statusCode, headerMap, bytes, null);
        }

        @Override
        public HttpHeaders headers() {
            return HttpHeaders.of(headerMap, (a, b) -> true);
        }

        @Override
        public InputStream body() {
            return bodySupplier != null ? bodySupplier.get() : new ByteArrayInputStream(bytes);
        }

        @Override
        public Optional<HttpResponse<InputStream>> previousResponse() {
            return Optional.empty();
        }

        @Override
        public Optional<SSLSession> sslSession() {
            return Optional.empty();
        }

        @Override
        public URI uri() {
            return request.uri();
        }

        @Override
        public HttpClient.Version version() {
            return HttpClient.Version.HTTP_1_1;
        }
    }

    static final class MutableClock extends Clock {
        private Instant now;

        MutableClock(Instant now) {
            this.now = now;
        }

        void advance(Duration by) {
            now = now.plus(by);
        }

        @Override
        public java.time.ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(java.time.ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return now;
        }
    }
}
