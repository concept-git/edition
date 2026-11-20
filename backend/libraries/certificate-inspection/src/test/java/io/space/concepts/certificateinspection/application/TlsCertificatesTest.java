package io.space.concepts.certificateinspection.application;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.InetAddress;
import java.time.Clock;
import org.junit.jupiter.api.Test;

class TlsCertificatesTest {
    @Test
    void disabledDeploymentDoesNotAttemptDns() {
        var probe = new TlsCertificates(false, Clock.systemUTC());
        try {
            assertThat(probe.inspect("invalid host which must not be resolved").status())
                    .isEqualTo("tls_disabled");
        } finally {
            probe.close();
        }
    }

    @Test
    void loopbackIsRejectedBeforeAnyTlsConnection() {
        var probe = new TlsCertificates(true, Clock.systemUTC());
        try {
            var result = probe.inspect("127.0.0.1");
            assertThat(result.status()).isEqualTo("unavailable");
            assertThat(result.error()).isEqualTo("destination_rejected");
        } finally {
            probe.close();
        }
    }

    @Test
    void privateReservedAndDocumentationAddressesAreNotProbeTargets() throws Exception {
        for (String address : new String[] {
            "127.0.0.1",
            "10.0.0.1",
            "172.16.0.1",
            "192.168.0.1",
            "169.254.169.254",
            "100.64.0.1",
            "198.18.0.1",
            "192.0.2.1",
            "198.51.100.1",
            "203.0.113.1",
            "::1",
            "fc00::1",
            "2001:db8::1"
        })
            assertThat(TlsCertificates.publicAddress(InetAddress.getByName(address)))
                    .as(address)
                    .isFalse();
        assertThat(TlsCertificates.publicAddress(InetAddress.getByName("8.8.8.8")))
                .isTrue();
    }

    @org.junit.jupiter.api.io.TempDir
    java.nio.file.Path temporary;

    @Test
    void realTlsHandshakeDistinguishesTrustedExpiredAndWrongHostWithoutSendingApplicationData() throws Exception {
        var storePath = temporary.resolve("edge.p12");
        var keytool = java.nio.file.Path.of(System.getProperty("java.home"), "bin", "keytool")
                .toString();
        var generated = new ProcessBuilder(
                        keytool,
                        "-genkeypair",
                        "-alias",
                        "edge",
                        "-keyalg",
                        "RSA",
                        "-dname",
                        "CN=docs.example",
                        "-ext",
                        "SAN=dns:docs.example",
                        "-validity",
                        "365",
                        "-storetype",
                        "PKCS12",
                        "-keystore",
                        storePath.toString(),
                        "-storepass",
                        "test-only-password",
                        "-keypass",
                        "test-only-password",
                        "-noprompt")
                .redirectErrorStream(true)
                .redirectOutput(ProcessBuilder.Redirect.DISCARD)
                .start();
        assertThat(generated.waitFor()).isZero();
        var store = java.security.KeyStore.getInstance("PKCS12");
        try (var input = java.nio.file.Files.newInputStream(storePath)) {
            store.load(input, "test-only-password".toCharArray());
        }
        var keys = javax.net.ssl.KeyManagerFactory.getInstance(javax.net.ssl.KeyManagerFactory.getDefaultAlgorithm());
        keys.init(store, "test-only-password".toCharArray());
        var context = javax.net.ssl.SSLContext.getInstance("TLS");
        context.init(keys.getKeyManagers(), null, null);
        var trustFactory =
                javax.net.ssl.TrustManagerFactory.getInstance(javax.net.ssl.TrustManagerFactory.getDefaultAlgorithm());
        trustFactory.init(store);
        var trust = java.util.Arrays.stream(trustFactory.getTrustManagers())
                .filter(javax.net.ssl.X509TrustManager.class::isInstance)
                .map(javax.net.ssl.X509TrustManager.class::cast)
                .findFirst()
                .orElseThrow();
        var certificate = (java.security.cert.X509Certificate) store.getCertificate("edge");
        try (var server = (javax.net.ssl.SSLServerSocket)
                        context.getServerSocketFactory().createServerSocket(0, 10, InetAddress.getLoopbackAddress());
                var executor = java.util.concurrent.Executors.newSingleThreadExecutor()) {
            var accepted = executor.submit(() -> {
                try {
                    for (int i = 0; i < 3; i++)
                        try (var socket = (javax.net.ssl.SSLSocket) server.accept()) {
                            socket.startHandshake();
                            assertThat(socket.getInputStream().read()).isEqualTo(-1);
                        }
                } catch (java.io.IOException failure) {
                    throw new java.io.UncheckedIOException(failure);
                }
            });
            for (var scenario : java.util.List.of("valid", "expired", "hostname_mismatch")) {
                var clock = scenario.equals("expired")
                        ? Clock.fixed(certificate.getNotAfter().toInstant().plusSeconds(1), java.time.ZoneOffset.UTC)
                        : Clock.systemUTC();
                var probe = new TlsCertificates(
                        true,
                        clock,
                        host -> new java.net.Socket(InetAddress.getLoopbackAddress(), server.getLocalPort()),
                        trust);
                try {
                    var result = probe.inspect(scenario.equals("hostname_mismatch") ? "wrong.example" : "docs.example");
                    assertThat(result.status()).isEqualTo(scenario);
                    assertThat(result.notAfter())
                            .isEqualTo(certificate.getNotAfter().toInstant());
                } finally {
                    probe.close();
                }
            }
            accepted.get(3, java.util.concurrent.TimeUnit.SECONDS);
        }
    }
}
