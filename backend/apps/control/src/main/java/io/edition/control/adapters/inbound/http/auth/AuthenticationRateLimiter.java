package io.edition.control.adapters.inbound.http.auth;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.edition.shared.Sha256;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * 认证端点的固定窗口限流。桶键由请求方决定（任意邮箱、任意来源地址），故必须有界：
 * Caffeine 按窗口时长过期并设上限，杜绝以海量键把进程撑爆。多副本部署时额度按副本翻倍，
 * 换共享存储前这是已知取舍（STACK.md 限流行）。
 */
@Component
public class AuthenticationRateLimiter {

    private static final Duration LOGIN_IP_WINDOW = Duration.ofMinutes(1);
    private static final Duration LOGIN_EMAIL_WINDOW = Duration.ofMinutes(15);
    private static final Duration REFRESH_WINDOW = Duration.ofMinutes(1);
    private static final Duration FORGOT_IP_WINDOW = Duration.ofMinutes(1);
    private static final Duration FORGOT_EMAIL_WINDOW = Duration.ofMinutes(15);

    private final Cache<String, Window> previews;
    private final int previewIpCapacity, previewTokenCapacity;
    private final Clock clock;
    private final Cache<String, Window> windows;
    private final int loginIpCapacity;
    private final int loginEmailCapacity;
    private final int refreshCapacity;
    private final int forgotIpCapacity;
    private final int forgotEmailCapacity;

    @org.springframework.beans.factory.annotation.Autowired
    AuthenticationRateLimiter(
            Clock clock,
            @Value("${io.edition.auth.login-ip-capacity:10}") int loginIpCapacity,
            // 必须高于 Password 的 5 次锁定阈值：两者相等时第 6 次请求恒为 429，
            // 概念层的「锁定」永远无法被触达，等于把已裁决的行为悄悄废掉。
            @Value("${io.edition.auth.login-email-capacity:20}") int loginEmailCapacity,
            @Value("${io.edition.auth.refresh-capacity:30}") int refreshCapacity,
            @Value("${io.edition.auth.forgot-ip-capacity:5}") int forgotIpCapacity,
            @Value("${io.edition.auth.forgot-email-capacity:3}") int forgotEmailCapacity,
            @Value("${io.edition.auth.bucket-limit:100000}") long bucketLimit,
            @Value("${io.edition.auth.preview-ip-capacity:60}") int previewIpCapacity,
            @Value("${io.edition.auth.preview-token-capacity:20}") int previewTokenCapacity) {
        if (previewIpCapacity < 1 || previewTokenCapacity < 1)
            throw new IllegalArgumentException("invalid preview capacity");
        this.previewIpCapacity = previewIpCapacity;
        this.previewTokenCapacity = previewTokenCapacity;
        this.previews = Caffeine.newBuilder()
                .maximumSize(bucketLimit)
                .expireAfterWrite(Duration.ofMinutes(1))
                .build();
        this.clock = clock;
        this.loginIpCapacity = loginIpCapacity;
        this.loginEmailCapacity = loginEmailCapacity;
        this.refreshCapacity = refreshCapacity;
        this.forgotIpCapacity = forgotIpCapacity;
        this.forgotEmailCapacity = forgotEmailCapacity;
        this.windows = Caffeine.newBuilder()
                .maximumSize(bucketLimit)
                .expireAfterWrite(LOGIN_EMAIL_WINDOW)
                .build();
    }

    AuthenticationRateLimiter(
            Clock clock, int ip, int email, int refresh, int forgotIp, int forgotEmail, long buckets) {
        this(clock, ip, email, refresh, forgotIp, forgotEmail, buckets, 60, 20);
    }

    public void preview(String ip, String token) {
        consume(previews, "ip:" + ip, previewIpCapacity, Duration.ofMinutes(1));
        consume(previews, "token:" + Sha256.hex(token), previewTokenCapacity, Duration.ofMinutes(1));
    }

    void login(String ip, String normalizedEmail) {
        consume("login-ip:" + ip, loginIpCapacity, LOGIN_IP_WINDOW);
        consume("login-email:" + normalizedEmail, loginEmailCapacity, LOGIN_EMAIL_WINDOW);
    }

    void refresh(String credentialKey) {
        consume("refresh:" + credentialKey, refreshCapacity, REFRESH_WINDOW);
    }

    void forgot(String ip, String normalizedEmail) {
        consume("forgot-ip:" + ip, forgotIpCapacity, FORGOT_IP_WINDOW);
        consume("forgot-email:" + normalizedEmail, forgotEmailCapacity, FORGOT_EMAIL_WINDOW);
    }

    void verification(String ip, String normalizedEmail) {
        consume("verification-ip:" + ip, forgotIpCapacity, FORGOT_IP_WINDOW);
        consume("verification-email:" + normalizedEmail, forgotEmailCapacity, FORGOT_EMAIL_WINDOW);
    }

    private void consume(String key, int capacity, Duration duration) {
        consume(windows, key, capacity, duration);
    }

    private void consume(Cache<String, Window> windows, String key, int capacity, Duration duration) {
        var now = clock.instant();
        var accepted = new boolean[1];
        var retry = new long[1];
        windows.asMap().compute(key, (ignored, previous) -> {
            boolean reset = previous == null || !previous.endsAt().isAfter(now);
            var window = reset ? new Window(0, now.plus(duration)) : previous;
            if (window.count() < capacity) {
                accepted[0] = true;
                return new Window(window.count() + 1, window.endsAt());
            }
            retry[0] = Math.max(1, Duration.between(now, window.endsAt()).toSeconds());
            return window;
        });
        if (!accepted[0]) throw new RateLimitedException(retry[0]);
    }

    private record Window(int count, Instant endsAt) {}
}
