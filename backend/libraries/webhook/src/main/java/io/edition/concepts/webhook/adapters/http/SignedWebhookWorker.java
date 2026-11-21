package io.edition.concepts.webhook.adapters.http;

import io.edition.concepts.webhook.api.*;
import io.edition.concepts.webhook.api.WebhookApi;
import io.micrometer.core.instrument.MeterRegistry;
import java.io.IOException;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "io.edition.operations.scheduling-enabled", havingValue = "true", matchIfMissing = true)
public class SignedWebhookWorker {
    public static final String SECRET_PREFIX = "whsec_";

    private final WebhookApi hooks;
    private final Clock clock;
    private final MeterRegistry metrics;
    private final OkHttpClient client;
    private final boolean validateDestination;
    private final Set<String> allowedHosts;

    @org.springframework.beans.factory.annotation.Autowired
    public SignedWebhookWorker(
            WebhookApi hooks,
            Clock clock,
            MeterRegistry metrics,
            @Value("${io.edition.webhooks.allowed-hosts:}") List<String> allowedHosts) {
        this.hooks = hooks;
        this.clock = clock;
        this.metrics = metrics;
        this.validateDestination = true;
        this.allowedHosts = allowedHosts.stream()
                .map(String::strip)
                .filter(host -> !host.isEmpty())
                .map(host -> host.toLowerCase(Locale.ROOT))
                .collect(Collectors.toUnmodifiableSet());
        client = new OkHttpClient.Builder()
                .followRedirects(false)
                .followSslRedirects(false)
                .proxy(Proxy.NO_PROXY)
                .connectTimeout(Duration.ofSeconds(5))
                .readTimeout(Duration.ofSeconds(10))
                .callTimeout(Duration.ofSeconds(15))
                .dns(host -> {
                    var addresses = Arrays.asList(InetAddress.getAllByName(host));
                    if (trusted(host)) return addresses;
                    for (var a : addresses) if (!publicAddress(a)) throw new RejectedDestination();
                    return addresses;
                })
                .build();
    }

    SignedWebhookWorker(WebhookApi hooks, Clock clock, MeterRegistry metrics, OkHttpClient client) {
        this.hooks = hooks;
        this.clock = clock;
        this.metrics = metrics;
        this.client = client;
        this.validateDestination = false;
        this.allowedHosts = Set.of();
    }

    @Scheduled(initialDelay = 5000, fixedDelay = 2000)
    public void deliver() {
        for (var claim : hooks.claim(1)) send(claim);
    }

    public void send(WebhookApi.Claim claim) {
        long start = System.nanoTime();
        Integer code = null;
        String error = null;
        try {
            if (validateDestination) {
                var uri = URI.create(claim.url());
                if (!"https".equals(uri.getScheme())
                        || uri.getHost() == null
                        || uri.getUserInfo() != null
                        || uri.getFragment() != null) throw new RejectedDestination();
                String host = uri.getHost().replace("[", "").replace("]", "");
                if (!trusted(host) && host.matches("[0-9a-fA-F:.]+") && !publicAddress(InetAddress.getByName(host)))
                    throw new RejectedDestination();
            }
            String id = claim.eventId().toString();
            String timestamp = Long.toString(clock.instant().getEpochSecond());
            String signature = signature(hooks.secret(claim.encryptedSecret()), id, timestamp, claim.payload());
            var request = new Request.Builder()
                    .url(claim.url())
                    .header("webhook-id", id)
                    .header("webhook-timestamp", timestamp)
                    .header("webhook-signature", signature)
                    .post(RequestBody.create(claim.payload(), MediaType.get("application/json; charset=utf-8")))
                    .build();
            try (var response = client.newCall(request).execute()) {
                code = response.code();
            }
        } catch (RejectedDestination rejected) {
            error = "destination_rejected";
        } catch (IOException unavailable) {
            error = "delivery_unavailable";
        } catch (IllegalArgumentException invalid) {
            error = "destination_rejected";
        } catch (IllegalStateException invalid) {
            error = "unexpected_error";
        }
        hooks.finish(
                claim, code, error, Duration.ofNanos(System.nanoTime() - start).toMillis());
        metrics.counter(
                        "edition.webhook.deliveries",
                        "outcome",
                        code != null && code >= 200 && code < 300 ? "ok" : "failed")
                .increment();
    }

    /** Standard Webhooks v1：{@code v1,base64(HMAC-SHA256(key, id.timestamp.body))}。 */
    public static String signature(String secret, String id, String timestamp, String body) {
        try {
            var mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key(secret), "HmacSHA256"));
            return "v1,"
                    + Base64.getEncoder()
                            .encodeToString(
                                    mac.doFinal((id + "." + timestamp + "." + body).getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException impossible) {
            throw new IllegalStateException("signature unavailable", impossible);
        }
    }

    private static byte[] key(String secret) {
        if (secret == null || !secret.startsWith(SECRET_PREFIX))
            throw new IllegalStateException("webhook secret format unsupported");
        try {
            return Base64.getDecoder().decode(secret.substring(SECRET_PREFIX.length()));
        } catch (IllegalArgumentException malformed) {
            throw new IllegalStateException("webhook secret format unsupported", malformed);
        }
    }

    private boolean trusted(String host) {
        return allowedHosts.contains(host.toLowerCase(Locale.ROOT));
    }

    public static boolean publicAddress(InetAddress address) {
        byte[] b = address.getAddress();
        if (address.isAnyLocalAddress()
                || address.isLoopbackAddress()
                || address.isLinkLocalAddress()
                || address.isSiteLocalAddress()
                || address.isMulticastAddress()) return false;
        if (b.length == 16) return (b[0] & 0xfe) != 0xfc && (b[0] & 0xff) != 0 && (b[0] & 0xff) != 0xff;
        int a = b[0] & 255, c = b[1] & 255;
        return a != 0
                && a != 127
                && a < 224
                && !(a == 100 && c >= 64 && c <= 127)
                && !(a == 169 && c == 254)
                && !(a == 192 && c == 0)
                && !(a == 198 && (c == 18 || c == 19));
    }

    static final class RejectedDestination extends UnknownHostException {
        RejectedDestination() {
            super("destination rejected");
        }
    }
}
