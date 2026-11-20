package io.space.control.support;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

/** 测试用"远程地址"：本机 http 静态服务，按路径提供 zip / 文本 / 超大流；不出外网。 */
public final class FixtureHttpServer {
    private final HttpServer server;
    private final Map<String, Route> routes = new ConcurrentHashMap<>();
    private final Map<String, AtomicInteger> hits = new ConcurrentHashMap<>();

    private FixtureHttpServer(HttpServer server) {
        this.server = server;
    }

    public static FixtureHttpServer start() throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        FixtureHttpServer fixture = new FixtureHttpServer(server);
        server.createContext("/", fixture::handle);
        server.setExecutor(Executors.newCachedThreadPool());
        server.start();
        return fixture;
    }

    public void stop() {
        server.stop(0);
    }

    public String baseUrl() {
        return "http://localhost:" + server.getAddress().getPort();
    }

    public String serveZip(String name, Path zip) throws IOException {
        byte[] bytes = Files.readAllBytes(zip);
        return route(name, new Route("application/zip", bytes, -1, 0));
    }

    /** 响应头先到、正文延迟 {@code delayMillis} 才开始写：模拟慢速远端，供并发受理测试。 */
    public String serveSlowZip(String name, Path zip, long delayMillis) throws IOException {
        byte[] bytes = Files.readAllBytes(zip);
        return route(name, new Route("application/zip", bytes, -1, delayMillis));
    }

    public String serveText(String name, String text) {
        return route(name, new Route("text/plain", text.getBytes(StandardCharsets.UTF_8), -1, 0));
    }

    /** 以 {@code PK} 开头、随后全零的分块流，总长 {@code size}；不声明 Content-Length。 */
    public String serveOversize(String name, long size) {
        return route(name, new Route("application/zip", null, size, 0));
    }

    public int hits(String path) {
        AtomicInteger count = hits.get(path);
        return count == null ? 0 : count.get();
    }

    private String route(String name, Route route) {
        routes.put("/" + name, route);
        return baseUrl() + "/" + name;
    }

    private void handle(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();
        hits.computeIfAbsent(path, key -> new AtomicInteger()).incrementAndGet();
        Route route = routes.get(path);
        if (route == null) {
            exchange.sendResponseHeaders(404, -1);
            exchange.close();
            return;
        }
        exchange.getResponseHeaders().add("Content-Type", route.contentType());
        if (route.bytes() != null) {
            exchange.sendResponseHeaders(200, route.bytes().length);
            try (OutputStream out = exchange.getResponseBody()) {
                if (route.delayMillis() > 0) Thread.sleep(route.delayMillis());
                out.write(route.bytes());
            } catch (InterruptedException interrupted) {
                Thread.currentThread().interrupt();
            }
            return;
        }
        exchange.sendResponseHeaders(200, 0);
        try (OutputStream out = exchange.getResponseBody()) {
            out.write('P');
            out.write('K');
            byte[] zeros = new byte[64 * 1024];
            long remaining = route.streamSize() - 2;
            while (remaining > 0) {
                int chunk = (int) Math.min(zeros.length, remaining);
                out.write(zeros, 0, chunk);
                remaining -= chunk;
            }
        } catch (IOException clientGaveUp) {
            // 客户端超限后主动断开，属预期
        }
    }

    private record Route(String contentType, byte[] bytes, long streamSize, long delayMillis) {}
}
