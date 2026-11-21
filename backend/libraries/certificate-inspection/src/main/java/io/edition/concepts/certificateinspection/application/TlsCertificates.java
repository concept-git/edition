package io.edition.concepts.certificateinspection.application;

import io.edition.concepts.certificateinspection.api.*;
import java.net.*;
import java.security.*;
import java.security.cert.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import javax.net.ssl.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
final class TlsCertificates implements CertificateInspectionApi {
    private final boolean enabled;
    private final Clock clock;
    private final SSLContext inspection;
    private final X509TrustManager systemTrust;
    private final ThreadPoolExecutor executor;
    private final Connections connections;

    @FunctionalInterface
    interface Connections {
        Socket connect(String host) throws java.io.IOException;
    }

    private static final class DestinationRejected extends java.io.IOException {}

    @org.springframework.beans.factory.annotation.Autowired
    TlsCertificates(@Value("${io.edition.certificates.tls-enabled:true}") boolean enabled, Clock clock) {
        this(enabled, clock, TlsCertificates::connectPublic, null);
    }

    TlsCertificates(boolean enabled, Clock clock, Connections connections, X509TrustManager trust) {
        this.enabled = enabled;
        this.clock = clock;
        this.connections = connections;
        this.executor = new ThreadPoolExecutor(
                0,
                4,
                30,
                TimeUnit.SECONDS,
                new SynchronousQueue<>(),
                r -> {
                    var thread = new Thread(r, "certificate-inspection");
                    thread.setDaemon(true);
                    return thread;
                },
                new ThreadPoolExecutor.AbortPolicy());
        try {
            var factory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
            factory.init((KeyStore) null);
            systemTrust = trust != null
                    ? trust
                    : Arrays.stream(factory.getTrustManagers())
                            .filter(X509TrustManager.class::isInstance)
                            .map(X509TrustManager.class::cast)
                            .findFirst()
                            .orElseThrow();
            inspection = SSLContext.getInstance("TLS");
            // This context is isolated to metadata inspection; no HTTP or user data is sent.
            inspection.init(
                    null,
                    new TrustManager[] {
                        new X509TrustManager() {
                            public X509Certificate[] getAcceptedIssuers() {
                                return new X509Certificate[0];
                            }

                            public void checkClientTrusted(X509Certificate[] chain, String authType)
                                    throws CertificateException {
                                throw new CertificateException("client authentication is unsupported");
                            }

                            public void checkServerTrusted(X509Certificate[] chain, String authType) {}
                        }
                    },
                    new SecureRandom());
        } catch (GeneralSecurityException failure) {
            throw new IllegalStateException("TLS inspection configuration unavailable", failure);
        }
    }

    @jakarta.annotation.PreDestroy
    void close() {
        executor.shutdownNow();
    }

    public View inspect(String host) {
        if (!enabled) return new View("tls_disabled", null, null, null, clock.instant(), null);
        Future<View> result;
        try {
            result = executor.submit(() -> probe(host));
        } catch (RejectedExecutionException busy) {
            return unavailable("probe_busy");
        }
        try {
            return result.get(5, TimeUnit.SECONDS);
        } catch (TimeoutException timeout) {
            result.cancel(true);
            return unavailable("probe_timeout");
        } catch (InterruptedException interrupted) {
            result.cancel(true);
            Thread.currentThread().interrupt();
            return unavailable("probe_interrupted");
        } catch (ExecutionException failure) {
            throw new IllegalStateException("certificate inspection invariant failed", failure.getCause());
        }
    }

    private View probe(String host) {
        try {
            try (var transport = connections.connect(host)) {
                transport.setSoTimeout(2000);
                try (var socket = (SSLSocket) inspection.getSocketFactory().createSocket(transport, host, 443, true)) {
                    socket.setSoTimeout(2000);
                    var parameters = socket.getSSLParameters();
                    parameters.setServerNames(List.of(new SNIHostName(host)));
                    socket.setSSLParameters(parameters);
                    socket.startHandshake();
                    var chain = Arrays.stream(socket.getSession().getPeerCertificates())
                            .map(X509Certificate.class::cast)
                            .toArray(X509Certificate[]::new);
                    var leaf = chain[0];
                    String status = "valid";
                    try {
                        leaf.checkValidity(Date.from(clock.instant()));
                    } catch (CertificateExpiredException expired) {
                        status = "expired";
                    } catch (CertificateNotYetValidException early) {
                        status = "not_yet_valid";
                    }
                    if (status.equals("valid") && !matchesHost(leaf, host)) status = "hostname_mismatch";
                    if (status.equals("valid"))
                        try {
                            systemTrust.checkServerTrusted(
                                    chain, leaf.getPublicKey().getAlgorithm());
                        } catch (CertificateException untrusted) {
                            status = "untrusted";
                        }
                    return new View(
                            status,
                            leaf.getIssuerX500Principal().getName(),
                            leaf.getNotBefore().toInstant(),
                            leaf.getNotAfter().toInstant(),
                            clock.instant(),
                            null);
                }
            }
        } catch (DestinationRejected rejected) {
            return unavailable("destination_rejected");
        } catch (java.io.IOException unavailable) {
            return unavailable("connection_unavailable");
        } catch (CertificateParsingException malformed) {
            return unavailable("invalid_certificate");
        }
    }

    private static Socket connectPublic(String host) throws java.io.IOException {
        var addresses = InetAddress.getAllByName(host);
        if (addresses.length == 0 || Arrays.stream(addresses).anyMatch(address -> !publicAddress(address)))
            throw new DestinationRejected();
        var socket = new Socket();
        try {
            socket.connect(new InetSocketAddress(addresses[0], 443), 1500);
            return socket;
        } catch (java.io.IOException failed) {
            try {
                socket.close();
            } catch (java.io.IOException cleanup) {
                failed.addSuppressed(cleanup);
            }
            throw failed;
        }
    }

    private View unavailable(String code) {
        return new View("unavailable", null, null, null, clock.instant(), code);
    }

    static boolean publicAddress(InetAddress address) {
        if (address.isAnyLocalAddress()
                || address.isLoopbackAddress()
                || address.isLinkLocalAddress()
                || address.isSiteLocalAddress()
                || address.isMulticastAddress()) return false;
        byte[] bytes = address.getAddress();
        if (bytes.length == 4) {
            int a = bytes[0] & 255, b = bytes[1] & 255;
            return a != 0
                    && a < 224
                    && !(a == 100 && b >= 64 && b <= 127)
                    && !(a == 198 && (b == 18 || b == 19))
                    && !(a == 192 && (b == 0 || b == 168))
                    && !(a == 198 && b == 51)
                    && !(a == 203 && b == 0);
        }
        return bytes.length == 16
                && (bytes[0] & 0xe0) == 0x20
                && !(bytes[0] == 0x20 && bytes[1] == 0x01 && bytes[2] == 0x0d && bytes[3] == (byte) 0xb8);
    }

    static boolean matchesHost(X509Certificate certificate, String host) throws CertificateParsingException {
        var names = certificate.getSubjectAlternativeNames();
        if (names == null) return false;
        String actual = host.toLowerCase(Locale.ROOT);
        for (var name : names)
            if (Integer.valueOf(2).equals(name.get(0)) && name.get(1) instanceof String dns) {
                String candidate = dns.toLowerCase(Locale.ROOT);
                if (actual.equals(candidate)) return true;
                if (candidate.startsWith("*.")
                        && actual.contains(".")
                        && actual.substring(actual.indexOf('.')).equals(candidate.substring(1))) return true;
            }
        return false;
    }
}
