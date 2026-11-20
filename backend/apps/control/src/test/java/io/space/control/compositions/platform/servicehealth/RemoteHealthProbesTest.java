package io.space.control.compositions.platform.servicehealth;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import tools.jackson.databind.json.JsonMapper;

class RemoteHealthProbesTest {
    @Test
    void theTwoSecondBudgetCoversHeadersAndBodyTogether() throws Exception {
        var server =
                com.sun.net.httpserver.HttpServer.create(new InetSocketAddress(InetAddress.getLoopbackAddress(), 0), 0);
        server.createContext("/healthz", exchange -> {
            try {
                Thread.sleep(1250);
                exchange.sendResponseHeaders(200, 2);
                exchange.getResponseBody().flush();
                Thread.sleep(1250);
                exchange.getResponseBody().write(new byte[] {'U', 'P'});
            } catch (InterruptedException interrupted) {
                Thread.currentThread().interrupt();
            } finally {
                exchange.close();
            }
        });
        server.start();
        try {
            var probe = new RemoteHealthProbes(
                    "http://localhost:" + server.getAddress().getPort(),
                    JsonMapper.builder().build());
            assertThat(probe.reader(Instant.now()).status()).isEqualTo("lost");
        } finally {
            server.stop(0);
        }
    }

    @ParameterizedTest
    @CsvSource(
            delimiter = '|',
            value = {
                "200|{\"status\":\"UP\"}|normal",
                "200|{\"status\":\"NOT_UP\"}|lost",
                "200|{\"message\":\"UP\"}|lost",
                "200|UP|lost",
                "200|null|lost",
                "503|{\"status\":\"UP\"}|lost"
            })
    void requiresSuccessfulResponseWithExactTopLevelStatus(int status, String body, String expected) throws Exception {
        var server =
                com.sun.net.httpserver.HttpServer.create(new InetSocketAddress(InetAddress.getLoopbackAddress(), 0), 0);
        server.createContext("/healthz", exchange -> {
            try (exchange) {
                byte[] bytes = body.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                exchange.sendResponseHeaders(status, bytes.length);
                exchange.getResponseBody().write(bytes);
            }
        });
        server.start();
        try {
            var probe = new RemoteHealthProbes(
                    "http://localhost:" + server.getAddress().getPort(),
                    JsonMapper.builder().build());
            assertThat(probe.reader(Instant.now()).status()).isEqualTo(expected);
        } finally {
            server.stop(0);
        }
    }
}
