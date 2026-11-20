package io.space.cli.shared;

import java.io.*;
import java.net.http.HttpClient;
import java.net.http.HttpTimeoutException;
import java.nio.file.*;
import java.security.*;
import java.security.cert.CertificateFactory;
import java.time.Duration;
import javax.net.ssl.*;

/** 共用 TLS 和响应期限规则；是否附带业务凭据由调用者决定，更新请求不附带它。 */
public final class HttpClients {
    private HttpClients() {}

    public static String encode(String value) {
        return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8)
                .replace("+", "%20");
    }

    public static HttpClient create(Path caFile) throws Exception {
        var builder = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .followRedirects(HttpClient.Redirect.NEVER);
        if (caFile != null) {
            KeyStore trust = KeyStore.getInstance(KeyStore.getDefaultType());
            trust.load(null);
            try (var input = Files.newInputStream(caFile)) {
                int i = 0;
                for (var certificate : CertificateFactory.getInstance("X.509").generateCertificates(input))
                    trust.setCertificateEntry("ca-" + i++, certificate);
            }
            var tm = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
            tm.init(trust);
            var ssl = SSLContext.getInstance("TLS");
            ssl.init(null, tm.getTrustManagers(), null);
            builder.sslContext(ssl);
        }
        return builder.build();
    }
    /** HTTP 已收到响应头也可能卡在正文；到期关闭输入流，把阻塞读取转为超时失败。 */
    @FunctionalInterface
    public interface BodyRead<T> {
        T read(InputStream body) throws Exception;
    }

    public static <T> T readBody(InputStream body, Duration timeout, BodyRead<T> read) throws Exception {
        var expired = new java.util.concurrent.atomic.AtomicBoolean();
        Thread deadline = Thread.ofVirtual().start(() -> {
            try {
                Thread.sleep(timeout);
                expired.set(true);
                body.close();
            } catch (InterruptedException ignored) {
                Thread.currentThread().interrupt();
            } catch (IOException ignored) {
            }
        });
        try (body) {
            T result = read.read(body);
            if (expired.get()) throw new HttpTimeoutException("HTTP body deadline expired.");
            return result;
        } catch (IOException e) {
            if (expired.get()) throw new HttpTimeoutException("HTTP body deadline expired.");
            throw e;
        } finally {
            deadline.interrupt();
        }
    }
}
