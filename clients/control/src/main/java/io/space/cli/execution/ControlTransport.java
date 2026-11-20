package io.space.cli.execution;

import static io.space.cli.shared.JsonSupport.*;

import com.fasterxml.jackson.databind.*;
import io.space.cli.shared.CliFailure;
import io.space.cli.state.ProfileStore;
import java.io.*;
import java.net.*;
import java.net.http.*;
import java.nio.file.*;
import java.time.*;
import java.util.*;

/** 只负责 HTTP 传输：固定服务源，不带 Cookie、不跟随重定向，保持证书和主机名校验。 */
final class ControlTransport {
    final HttpClient client;
    final URI origin;
    final String token;
    final String authOrigin;
    final Duration timeout;

    ControlTransport(ControlTransport source, Duration timeout) {
        client = source.client;
        origin = source.origin;
        token = source.token;
        authOrigin = source.authOrigin;
        this.timeout = timeout;
    }

    ControlTransport(JsonNode profile, String token, int timeoutSeconds) throws Exception {
        origin = ProfileStore.origin(
                profile.path("baseUrl").asText(),
                profile.path("allowHttpLoopback").asBoolean());
        this.token = token;
        authOrigin = profile.path("authOrigin").asText("");
        timeout = Duration.ofSeconds(timeoutSeconds);
        client = io.space.cli.shared.HttpClients.create(
                profile.has("caFile") ? Path.of(profile.path("caFile").asText()) : null);
    }

    HttpResponse<InputStream> send(JsonNode request, String key) throws Exception {
        URI url = origin.resolve(request.path("path").asText());
        if (!Objects.equals(url.getAuthority(), origin.getAuthority())
                || !url.getScheme().equals(origin.getScheme()))
            throw CliFailure.input(
                    "Request escaped the configured origin.", "Use the generated command and configured profile.");
        var builder = HttpRequest.newBuilder(url)
                .timeout(timeout)
                // 下载还可能返回 ZIP、CSV 等类型；保留 JSON 优先级，但不截断服务端的媒体契约。
                .header("Accept", "application/json, application/problem+json, */*;q=0.8");
        if (!token.isBlank()) builder.header("Authorization", "Bearer " + token);
        if (!authOrigin.isEmpty() && url.getPath().startsWith("/auth/")) builder.header("Origin", authOrigin);
        request.path("headers")
                .properties()
                .iterator()
                .forEachRemaining(e -> builder.header(e.getKey(), e.getValue().asText()));
        if (key != null) builder.header("Idempotency-Key", key);
        HttpRequest.BodyPublisher body = HttpRequest.BodyPublishers.noBody();
        if (request.has("file")) {
            // 保存回执后文件可能被改动；再次核对哈希，防止用同一个键发送不同内容。
            Path file = Path.of(request.path("file").asText());
            if (!Files.isRegularFile(file)
                    || !hashFile(file).equals(request.path("fileSha256").asText()))
                throw CliFailure.refused(
                        "replay_material_changed",
                        "Input file changed or is missing.",
                        "Restore the original immutable file before resuming.");
            body = HttpRequest.BodyPublishers.ofFile(file);
            if (request.path("contentType").asText().startsWith("multipart/form-data")) {
                String boundary = request.path("boundary").asText();
                String filename = request.path("filename")
                        .asText(file.getFileName().toString())
                        .replace("\\", "\\\\")
                        .replace("\"", "\\\"");
                body = HttpRequest.BodyPublishers.concat(
                        HttpRequest.BodyPublishers.ofString(
                                "--" + boundary + "\r\nContent-Disposition: form-data; name=\"file\"; filename=\""
                                        + filename + "\"\r\nContent-Type: application/octet-stream\r\n\r\n"),
                        body,
                        HttpRequest.BodyPublishers.ofString("\r\n--" + boundary + "--\r\n"));
            }
        } else if (request.has("body"))
            body = HttpRequest.BodyPublishers.ofString(request.path("body").asText());
        if (request.has("contentType"))
            builder.header("Content-Type", request.path("contentType").asText());
        var response = client.send(
                builder.method(request.path("method").asText(), body).build(),
                HttpResponse.BodyHandlers.ofInputStream());
        if (response.statusCode() >= 300 && response.statusCode() < 400) {
            response.body().close();
            throw CliFailure.error(
                    "redirect_refused",
                    "Control returned a redirect; credentials were not forwarded.",
                    "Configure the final HTTPS Control origin explicitly.");
        }
        return response;
    }
}
