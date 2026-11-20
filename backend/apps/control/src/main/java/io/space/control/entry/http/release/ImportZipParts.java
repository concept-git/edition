package io.space.control.entry.http.release;

import io.space.control.compositions.releases.bundleimport.BundleImportTypes;
import io.space.control.compositions.resource.InvalidBundleException;
import jakarta.servlet.http.HttpServletRequest;
import java.io.ByteArrayOutputStream;
import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.util.WebUtils;

/**
 * 导入入站体：{@code application/zip} 或仅本路由的 multipart {@code file}。
 * Spring 全局 multipart 仍是 10 MiB（附件）；本路由不走那个 resolver。
 */
final class ImportZipParts {
    private ImportZipParts() {}

    static BundleImportTypes.ImportSource source(HttpServletRequest request) throws IOException {
        String contentType = request.getContentType();
        if (contentType != null && contentType.toLowerCase(Locale.ROOT).startsWith("multipart/")) {
            return multipart(request);
        }
        long declared = ImportController.declaredSize(request);
        if (declared > ImportController.MAX_ZIP_BYTES) throw new ImportController.ZipTooLargeException();
        return new BundleImportTypes.ImportSource.ZipStream(
                new ImportController.CappedZipInputStream(request.getInputStream()), declared);
    }

    private static BundleImportTypes.ImportSource multipart(HttpServletRequest request) throws IOException {
        MultipartHttpServletRequest parsed = WebUtils.getNativeRequest(request, MultipartHttpServletRequest.class);
        if (parsed != null) {
            MultipartFile file = parsed.getFile("file");
            if (file == null || file.isEmpty()) throw new InvalidBundleException();
            if (file.getSize() > ImportController.MAX_ZIP_BYTES) {
                throw new ImportController.ZipTooLargeException();
            }
            return new BundleImportTypes.ImportSource.ZipStream(file.getInputStream(), file.getSize());
        }
        return streamMultipart(request);
    }

    private static BundleImportTypes.ImportSource streamMultipart(HttpServletRequest request) throws IOException {
        String boundary = boundary(request.getContentType());
        if (boundary == null || boundary.isBlank()) throw new InvalidBundleException();
        Path temp = Files.createTempFile("import-mp-", ".zip");
        boolean committed = false;
        try {
            long copied;
            try (InputStream in = request.getInputStream()) {
                if (!skipToFilePart(in, boundary)) throw new InvalidBundleException();
                byte[] closer = ("\r\n--" + boundary).getBytes(StandardCharsets.ISO_8859_1);
                try (OutputStream out = Files.newOutputStream(temp)) {
                    copied = copyUntil(in, out, closer, ImportController.MAX_ZIP_BYTES);
                }
            }
            InputStream body = new FilterInputStream(Files.newInputStream(temp)) {
                @Override
                public void close() throws IOException {
                    try {
                        super.close();
                    } finally {
                        Files.deleteIfExists(temp);
                    }
                }
            };
            committed = true;
            return new BundleImportTypes.ImportSource.ZipStream(
                    new ImportController.CappedZipInputStream(body), copied);
        } finally {
            if (!committed) {
                try {
                    Files.deleteIfExists(temp);
                } catch (IOException ignored) {
                    // multipart temp is best-effort
                }
            }
        }
    }

    private static String boundary(String contentType) {
        if (contentType == null) return null;
        for (String piece : contentType.split(";")) {
            String trimmed = piece.strip();
            if (trimmed.toLowerCase(Locale.ROOT).startsWith("boundary=")) {
                String value = trimmed.substring("boundary=".length()).strip();
                if (value.length() >= 2 && value.startsWith("\"") && value.endsWith("\"")) {
                    value = value.substring(1, value.length() - 1);
                }
                return value;
            }
        }
        return null;
    }

    private static boolean skipToFilePart(InputStream in, String boundary) throws IOException {
        byte[] delimiter = ("--" + boundary).getBytes(StandardCharsets.ISO_8859_1);
        byte[] closer = ("\r\n--" + boundary).getBytes(StandardCharsets.ISO_8859_1);
        if (!readUntil(in, delimiter)) return false;
        while (true) {
            int first = in.read();
            int second = in.read();
            if (first < 0) return false;
            if (first == '-' && second == '-') return false;
            ByteArrayOutputStream headers = new ByteArrayOutputStream();
            if (!(first == '\r' && second == '\n')) {
                headers.write(first);
                if (second >= 0) headers.write(second);
            }
            if (!readUntil(in, new byte[] {'\r', '\n', '\r', '\n'}, headers)) return false;
            String block = headers.toString(StandardCharsets.ISO_8859_1);
            if (block.toLowerCase(Locale.ROOT).contains("name=\"file\"")) return true;
            copyUntil(in, OutputStream.nullOutputStream(), closer, Long.MAX_VALUE);
        }
    }

    private static boolean readUntil(InputStream in, byte[] token) throws IOException {
        return readUntil(in, token, null);
    }

    private static boolean readUntil(InputStream in, byte[] token, ByteArrayOutputStream capture) throws IOException {
        int matched = 0;
        while (matched < token.length) {
            int value = in.read();
            if (value < 0) return false;
            byte b = (byte) value;
            if (b == token[matched]) {
                matched++;
            } else {
                if (capture != null) {
                    for (int i = 0; i < matched; i++) capture.write(token[i]);
                    capture.write(b);
                }
                matched = b == token[0] ? 1 : 0;
            }
        }
        return true;
    }

    private static long copyUntil(InputStream in, OutputStream out, byte[] token, long max) throws IOException {
        int matched = 0;
        long copied = 0;
        byte[] hold = new byte[token.length];
        while (true) {
            int value = in.read();
            if (value < 0) {
                if (matched > 0) {
                    out.write(hold, 0, matched);
                    copied += matched;
                }
                return copied;
            }
            byte b = (byte) value;
            if (b == token[matched]) {
                hold[matched] = b;
                matched++;
                if (matched == token.length) return copied;
            } else {
                if (matched > 0) {
                    out.write(hold, 0, matched);
                    copied += matched;
                    if (copied > max) throw new ImportController.ZipTooLargeException();
                    matched = 0;
                }
                if (b == token[0]) {
                    hold[0] = b;
                    matched = 1;
                } else {
                    out.write(b);
                    copied++;
                    if (copied > max) throw new ImportController.ZipTooLargeException();
                }
            }
        }
    }
}
