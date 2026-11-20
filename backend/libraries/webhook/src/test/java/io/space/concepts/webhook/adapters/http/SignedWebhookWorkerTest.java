package io.space.concepts.webhook.adapters.http;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import io.space.concepts.webhook.api.*;
import io.space.concepts.webhook.api.WebhookApi;
import java.net.*;
import java.time.*;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import okhttp3.OkHttpClient;
import org.junit.jupiter.api.Test;

class SignedWebhookWorkerTest {
    @Test
    void signatureMatchesTheStandardWebhooksReferenceVector() {
        assertThat(SignedWebhookWorker.signature(
                        "whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw",
                        "msg_p5jXN8AQM9LWM0D4loKWxJek",
                        "1614265330",
                        "{\"test\": 2432232314}"))
                .isEqualTo("v1,g0hM9SsE+OTPJTGt/tmIKtSyZlE3uFJELVlNIOLJ1OE=");
    }

    @Test
    void sendsTheExactSignedBodyToARealReceiver() throws Exception {
        var receiver =
                com.sun.net.httpserver.HttpServer.create(new InetSocketAddress(InetAddress.getLoopbackAddress(), 0), 0);
        var body = new AtomicReference<String>();
        var id = new AtomicReference<String>();
        var signature = new AtomicReference<String>();
        var timestamp = new AtomicReference<String>();
        receiver.createContext("/hook", exchange -> {
            body.set(new String(exchange.getRequestBody().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8));
            id.set(exchange.getRequestHeaders().getFirst("webhook-id"));
            signature.set(exchange.getRequestHeaders().getFirst("webhook-signature"));
            timestamp.set(exchange.getRequestHeaders().getFirst("webhook-timestamp"));
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
        });
        receiver.start();
        try {
            var hooks = mock(WebhookApi.class);
            String secret = "whsec_a2V5";
            when(hooks.secret("ciphertext")).thenReturn(secret);
            var clock = Clock.fixed(Instant.parse("2026-09-07T00:00:00Z"), ZoneOffset.UTC);
            var worker = new SignedWebhookWorker(hooks, clock, new SimpleMeterRegistry(), new OkHttpClient());
            var claim = new WebhookApi.Claim(
                    UUID.randomUUID(),
                    UUID.randomUUID(),
                    UUID.randomUUID(),
                    UUID.randomUUID(),
                    "http://localhost:" + receiver.getAddress().getPort() + "/hook",
                    "ciphertext",
                    "{\"type\":\"release.promoted\"}",
                    1);
            worker.send(claim);
            assertThat(body.get()).isEqualTo(claim.payload());
            assertThat(id.get()).isEqualTo(claim.eventId().toString());
            assertThat(timestamp.get()).isEqualTo("1788739200");
            assertThat(signature.get())
                    .isEqualTo(SignedWebhookWorker.signature(secret, id.get(), timestamp.get(), body.get()));
            verify(hooks).finish(eq(claim), eq(204), isNull(), anyLong());
        } finally {
            receiver.stop(0);
        }
    }

    @Test
    void productionTransportRejectsLoopbackAndPrivateNetworks() throws Exception {
        for (String ip : new String[] {
            "127.0.0.1",
            "10.0.0.1",
            "172.16.0.1",
            "192.168.1.1",
            "169.254.169.254",
            "100.64.0.1",
            "::1",
            "fc00::1",
            "::ffff:127.0.0.1"
        })
            assertThat(SignedWebhookWorker.publicAddress(InetAddress.getByName(ip)))
                    .as(ip)
                    .isFalse();
        assertThat(SignedWebhookWorker.publicAddress(InetAddress.getByName("8.8.8.8")))
                .isTrue();
        for (String url : new String[] {"https://127.0.0.1/hook", "https://localhost/hook"}) {
            var hooks = mock(WebhookApi.class);
            when(hooks.secret("ciphertext")).thenReturn("whsec_a2V5");
            var worker = new SignedWebhookWorker(hooks, Clock.systemUTC(), new SimpleMeterRegistry(), List.of());
            var claim = claim(url);
            worker.send(claim);
            verify(hooks).finish(eq(claim), isNull(), eq("destination_rejected"), anyLong());
        }
    }

    @Test
    void allowedHostsOnlyWaiveTheAddressCheckAndStillRequireHttps() throws Exception {
        var hooks = mock(WebhookApi.class);
        when(hooks.secret("ciphertext")).thenReturn("whsec_a2V5");
        var worker =
                new SignedWebhookWorker(hooks, Clock.systemUTC(), new SimpleMeterRegistry(), List.of(" LocalHost "));
        try (var closed = new ServerSocket(0, 1, InetAddress.getLoopbackAddress())) {
            int port = closed.getLocalPort();
            closed.close();
            var trusted = claim("https://localhost:" + port + "/hook");
            worker.send(trusted);
            verify(hooks).finish(eq(trusted), isNull(), eq("delivery_unavailable"), anyLong());
        }
        var plain = claim("http://localhost/hook");
        worker.send(plain);
        verify(hooks).finish(eq(plain), isNull(), eq("destination_rejected"), anyLong());
        var literal = claim("https://127.0.0.1/hook");
        worker.send(literal);
        verify(hooks).finish(eq(literal), isNull(), eq("destination_rejected"), anyLong());
    }

    @Test
    void aSecretOutsideTheStandardFormatFailsWithoutSending() {
        var hooks = mock(WebhookApi.class);
        when(hooks.secret("ciphertext")).thenReturn("legacy-plain-secret");
        var worker = new SignedWebhookWorker(hooks, Clock.systemUTC(), new SimpleMeterRegistry(), new OkHttpClient());
        var claim = claim("http://localhost:9/hook");
        worker.send(claim);
        verify(hooks).finish(eq(claim), isNull(), eq("unexpected_error"), anyLong());
    }

    @Test
    void aRealReceiverTimeoutIsReportedAsRetryableDeliveryFailure() throws Exception {
        var receiver =
                com.sun.net.httpserver.HttpServer.create(new InetSocketAddress(InetAddress.getLoopbackAddress(), 0), 0);
        var release = new java.util.concurrent.CountDownLatch(1);
        receiver.createContext("/slow", exchange -> {
            try {
                release.await(2, java.util.concurrent.TimeUnit.SECONDS);
            } catch (InterruptedException interrupted) {
                Thread.currentThread().interrupt();
            }
            exchange.close();
        });
        receiver.start();
        try {
            var hooks = mock(WebhookApi.class);
            when(hooks.secret("ciphertext")).thenReturn("whsec_a2V5");
            var client = new OkHttpClient.Builder()
                    .callTimeout(Duration.ofMillis(100))
                    .build();
            var worker = new SignedWebhookWorker(hooks, Clock.systemUTC(), new SimpleMeterRegistry(), client);
            var claim = claim("http://localhost:" + receiver.getAddress().getPort() + "/slow");
            worker.send(claim);
            verify(hooks).finish(eq(claim), isNull(), eq("delivery_unavailable"), anyLong());
        } finally {
            release.countDown();
            receiver.stop(0);
        }
    }

    private static WebhookApi.Claim claim(String url) {
        return new WebhookApi.Claim(
                UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), url, "ciphertext", "{}", 1);
    }
}
