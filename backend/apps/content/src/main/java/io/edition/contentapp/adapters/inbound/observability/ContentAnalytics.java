package io.edition.contentapp.adapters.inbound.observability;

import io.edition.contentapp.usecases.shared.ContentProblem;
import io.edition.delivery.contract.TelemetryEvent;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.servlet.http.HttpServletRequest;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

/**
 * 非阻塞读侧观察。日志由独立 collector 外送；阅读进程没有管理凭据。
 */
@Component
public class ContentAnalytics {
    public static final ThreadLocal<Frame> REQUEST = new ThreadLocal<>();

    public static final class Frame {
        public UUID tenant, site, page;
        public String kind, path;
        public Proof proof;
    }

    private static final int EVENTS_PER_MINUTE = 120;
    private static final int MAX_WINDOWS = 10000;

    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();
    private final ArrayBlockingQueue<TelemetryEvent> queue = new ArrayBlockingQueue<>(10000);
    private final UUID source = UUID.randomUUID();
    private final AtomicLong dropped = new AtomicLong();
    private final ScheduledExecutorService drain = Executors.newSingleThreadScheduledExecutor(r -> {
        var t = new Thread(r, "analytics-log");
        t.setDaemon(true);
        return t;
    });
    private final Set<String> trusted;
    private final JsonMapper json;
    private final byte[] key;
    private final Clock clock;

    public ContentAnalytics(
            JsonMapper json,
            @Value("${delivery.cursor-key}") String key,
            Clock clock,
            MeterRegistry metrics,
            @Value("${security.trusted-proxies:127.0.0.1,::1}") Set<String> trusted) {
        this.trusted = trusted;
        this.json = json;
        this.key = Base64.getDecoder().decode(key);
        this.clock = clock;
        metrics.gauge("edition.analytics.buffer", queue, Collection::size);
        metrics.gauge("edition.analytics.dropped", dropped, AtomicLong::get);
        drain.scheduleWithFixedDelay(this::flush, 1, 1, TimeUnit.SECONDS);
    }

    @jakarta.annotation.PreDestroy
    public void close() {
        drain.shutdown();
        try {
            drain.awaitTermination(2, TimeUnit.SECONDS);
        } catch (InterruptedException interrupted) {
            Thread.currentThread().interrupt();
        }
        while (!queue.isEmpty()) flush();
    }

    public static void begin() {
        REQUEST.set(new Frame());
    }

    public static void site(UUID tenant, UUID site) {
        var f = REQUEST.get();
        if (f != null) {
            f.tenant = tenant;
            f.site = site;
        }
    }

    public static void redirect(String path) {
        var f = REQUEST.get();
        if (f != null) {
            f.path = path;
            f.kind = "redirect";
        }
    }

    public void finish(HttpServletRequest request, int status) {
        var f = REQUEST.get();
        REQUEST.remove();
        if (f == null || f.site == null || !request.getMethod().equals("GET")) return;
        String kind = f.kind;
        if (status == 404
                && !request.getRequestURI().startsWith("/api/")
                && !request.getRequestURI().startsWith("/_")) {
            kind = "notfound";
            f.path = request.getRequestURI();
        }
        if (kind == null || (!(status >= 200 && status < 400) && status != 404)) return;
        offer(event(f, kind, f.path, null, "pv".equals(kind) ? visitor(f, request) : null, request));
    }

    /** 阅读前端信标：页面已由 Reader 判定可读；浏览器 POST 本身不产生页面事件。 */
    public void pageViewed(UUID page, String path, String referrer, HttpServletRequest request) {
        var f = traced();
        f.page = page;
        offer(event(f, "pv", path, null, visitor(f, request), referrer(referrer, request)));
    }

    /** 阅读前端信标：路径已由 Reader 判定为不存在。 */
    public void notFound(String path, String referrer, HttpServletRequest request) {
        offer(event(traced(), "notfound", path, null, null, referrer(referrer, request)));
    }

    /** 信标按主机与客户端地址的每分钟窗口限流，先于任何数据库读取。 */
    public void admit(String host, HttpServletRequest request) {
        long minute = clock.instant().getEpochSecond() / 60;
        if (windows.size() > MAX_WINDOWS) windows.values().removeIf(window -> window.minute != minute);
        var window = windows.compute(host + ":" + clientAddress(request), (key, current) -> {
            if (current == null || current.minute != minute) return new Window(minute, 1);
            return new Window(minute, current.count + 1);
        });
        if (window.count > EVENTS_PER_MINUTE) throw new ContentProblem(429, "read_limit_exceeded");
    }

    private record Window(long minute, int count) {}

    private static Frame traced() {
        var f = REQUEST.get();
        if (f == null || f.site == null) throw new ContentProblem(422, "validation_failed");
        return f;
    }

    private String visitor(Frame f, HttpServletRequest request) {
        return mac("visitor:"
                        + LocalDate.now(clock.withZone(ZoneOffset.UTC))
                        + ":"
                        + f.site
                        + ":"
                        + clientAddress(request)
                        + ":"
                        + Objects.toString(request.getHeader("User-Agent"), ""))
                .substring(0, 32);
    }

    /** 来源只保留主机名；显式给出的 referrer 优先于请求头。 */
    private static String referrer(String explicit, HttpServletRequest request) {
        String value = explicit != null ? explicit : request.getHeader("Referer");
        if (value == null) return null;
        try {
            return java.net.URI.create(value).getHost();
        } catch (IllegalArgumentException invalid) {
            return null;
        }
    }

    public String proof(String query, List<String> hitPaths, String error, String previous, boolean initial) {
        var f = REQUEST.get();
        if (f == null || f.site == null || query.isBlank() || error != null) return null;
        UUID sid = UUID.randomUUID();
        if (!initial && previous != null) {
            try {
                var old = decode(previous);
                if (old.site().equals(f.site) && old.queryHash().equals(mac("query:" + query))) sid = old.sid();
            } catch (ContentProblem invalid) {
                /* 过期分页追踪不新开计入的搜索 */
            }
        }
        var paths = hitPaths.stream().map(path -> mac("path:" + path)).collect(java.util.stream.Collectors.toSet());
        var proof = new Proof(
                f.site,
                sid,
                clock.instant().plusSeconds(900).getEpochSecond(),
                mac("query:" + query),
                safeQuery(query),
                paths,
                initial,
                hitPaths.isEmpty());
        f.proof = proof;
        return encode(proof);
    }

    public void observed(String encoded, HttpServletRequest request) {
        var f = REQUEST.get();
        var p = decode(encoded);
        if (f == null || f.site == null || !f.site.equals(p.site())) throw new ContentProblem(422, "validation_failed");
        offer(event(f, "observable", null, p, null, request));
    }

    public void click(String encoded, String path, HttpServletRequest request) {
        var f = REQUEST.get();
        var p = decode(encoded);
        if (f == null
                || f.site == null
                || !p.site().equals(f.site)
                || path == null
                || !p.paths().contains(mac("path:" + path))) throw new ContentProblem(422, "validation_failed");
        if (p.initial()) offer(event(f, "search", null, p, null, request));
        offer(event(f, "click", path, p, null, request));
        f.proof = null;
    }

    private TelemetryEvent event(
            Frame f, String type, String path, Proof proof, String visitor, HttpServletRequest request) {
        return event(f, type, path, proof, visitor, referrer(null, request));
    }

    private TelemetryEvent event(Frame f, String type, String path, Proof proof, String visitor, String ref) {
        UUID eventId = proof == null
                ? UUID.randomUUID()
                : UUID.nameUUIDFromBytes((type + ":" + proof.sid()).getBytes(java.nio.charset.StandardCharsets.UTF_8));
        return new TelemetryEvent(
                eventId,
                source,
                clock.instant(),
                f.tenant,
                f.site,
                f.page,
                type,
                truncate(path, 512),
                proof == null ? null : proof.query(),
                proof == null ? null : proof.sid(),
                visitor,
                truncate(ref, 253),
                proof != null && proof.zero(),
                false,
                dropped.get());
    }

    private void offer(TelemetryEvent event) {
        if (!queue.offer(event)) dropped.incrementAndGet();
    }

    private void flush() {
        var logger = org.slf4j.LoggerFactory.getLogger("edition.analytics");
        try {
            for (int i = 0; i < 1000; i++) {
                var e = queue.poll();
                if (e == null) break;
                logger.atInfo()
                        .addKeyValue("event", "delivery.analytics")
                        .addKeyValue("telemetry", json.writeValueAsString(e))
                        .log("Reader analytics");
            }
            if (clock.instant().getEpochSecond() % 5 == 0)
                logger.atInfo()
                        .addKeyValue("event", "delivery.analytics")
                        .addKeyValue(
                                "telemetry",
                                json.writeValueAsString(new TelemetryEvent(
                                        UUID.randomUUID(),
                                        source,
                                        clock.instant(),
                                        null,
                                        null,
                                        null,
                                        "heartbeat",
                                        null,
                                        null,
                                        null,
                                        null,
                                        null,
                                        false,
                                        false,
                                        dropped.get())))
                        .log("Reader analytics heartbeat");
        } catch (tools.jackson.core.JacksonException unavailable) {
            dropped.incrementAndGet();
        }
    }

    private String clientAddress(HttpServletRequest request) {
        String remote = request.getRemoteAddr(), forwarded = request.getHeader("X-Forwarded-For");
        if (trusted.contains(remote) && forwarded != null && !forwarded.isBlank()) {
            String value = forwarded.split(",", 2)[0].strip();
            if (value.contains(":") ? value.matches("[a-fA-F0-9:]+") : value.matches("[0-9.]+")) return value;
        }
        return remote;
    }

    private String encode(Proof p) {
        String body = Base64.getUrlEncoder().withoutPadding().encodeToString(json.writeValueAsBytes(p));
        return body + "." + mac("proof:" + body);
    }

    private Proof decode(String value) {
        try {
            if (value == null || value.length() > 10000) throw new IllegalArgumentException();
            var parts = value.split("\\.", -1);
            if (parts.length != 2
                    || !java.security.MessageDigest.isEqual(
                            mac("proof:" + parts[0]).getBytes(java.nio.charset.StandardCharsets.US_ASCII),
                            parts[1].getBytes(java.nio.charset.StandardCharsets.US_ASCII)))
                throw new IllegalArgumentException();
            var p = json.readValue(Base64.getUrlDecoder().decode(parts[0]), Proof.class);
            if (p.until() < clock.instant().getEpochSecond()) throw new IllegalArgumentException();
            return p;
        } catch (IllegalArgumentException invalid) {
            throw new ContentProblem(422, "validation_failed");
        }
    }

    private String mac(String value) {
        try {
            var m = Mac.getInstance("HmacSHA256");
            m.init(new SecretKeySpec(key, "HmacSHA256"));
            return HexFormat.of().formatHex(m.doFinal(value.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        } catch (java.security.GeneralSecurityException impossible) {
            throw new IllegalStateException(impossible);
        }
    }

    public static String safeQuery(String q) {
        return TelemetryEvent.sanitizeQuery(q);
    }

    private static String truncate(String value, int size) {
        if (value == null) return null;
        return value.substring(0, value.offsetByCodePoints(0, Math.min(size, value.codePointCount(0, value.length()))));
    }

    public record Proof(
            UUID site,
            UUID sid,
            long until,
            String queryHash,
            String query,
            Set<String> paths,
            boolean initial,
            boolean zero) {}
}
