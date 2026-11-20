package io.space.control.support;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/** Actual SMTP protocol fixture, including acknowledgement loss after accepting DATA. */
public final class SmtpReceiver implements AutoCloseable {
    private final ServerSocket server;
    private final List<String> messages = new CopyOnWriteArrayList<>();
    private volatile boolean rejectNext;
    private volatile boolean loseNextAcknowledgement;

    public SmtpReceiver() throws IOException {
        server = new ServerSocket(0, 16, java.net.InetAddress.getLoopbackAddress());
        Thread.ofPlatform().daemon().start(() -> {
            while (!server.isClosed()) {
                try {
                    Socket client = server.accept();
                    Thread.ofVirtual().start(() -> handle(client));
                } catch (IOException stopped) {
                    if (!server.isClosed()) throw new UncheckedIOException(stopped);
                }
            }
        });
    }

    public int port() {
        return server.getLocalPort();
    }

    public List<String> messages() {
        return List.copyOf(messages);
    }

    public void rejectNext() {
        rejectNext = true;
    }

    public void loseNextAcknowledgement() {
        loseNextAcknowledgement = true;
    }

    public void clear() {
        messages.clear();
        rejectNext = false;
        loseNextAcknowledgement = false;
    }

    private void handle(Socket client) {
        try (client;
                var input = new BufferedReader(new InputStreamReader(client.getInputStream(), StandardCharsets.UTF_8));
                var output = new PrintWriter(
                        new OutputStreamWriter(client.getOutputStream(), StandardCharsets.UTF_8), true)) {
            output.print("220 local-test ESMTP\r\n");
            output.flush();
            String line;
            while ((line = input.readLine()) != null) {
                if (line.startsWith("EHLO") || line.startsWith("HELO")) output.print("250 local-test\r\n");
                else if (line.equals("DATA")) {
                    if (rejectNext) {
                        rejectNext = false;
                        output.print("451 temporary failure\r\n");
                        output.flush();
                        continue;
                    }
                    output.print("354 send message\r\n");
                    output.flush();
                    var data = new StringBuilder();
                    while ((line = input.readLine()) != null && !line.equals("."))
                        data.append(line.startsWith("..") ? line.substring(1) : line)
                                .append("\r\n");
                    messages.add(data.toString());
                    if (loseNextAcknowledgement) {
                        loseNextAcknowledgement = false;
                        return;
                    }
                    output.print("250 accepted\r\n");
                } else if (line.equals("QUIT")) {
                    output.print("221 bye\r\n");
                    output.flush();
                    return;
                } else output.print("250 ok\r\n");
                output.flush();
            }
        } catch (IOException disconnected) {
            /* A deliberately dropped connection is a fixture outcome. */
        }
    }

    @Override
    public void close() throws IOException {
        server.close();
    }
}
