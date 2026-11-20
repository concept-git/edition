package io.space.concepts.importformat;

import io.space.concepts.importformat.api.*;
import io.space.concepts.importformat.attachments.AttachmentTypes;
import io.space.concepts.importformat.contract.AdaptSink;
import io.space.concepts.importformat.contract.AdaptedPack;
import io.space.concepts.importformat.contract.ImportLimits;
import io.space.shared.Sha256;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public final class ImportPacks {
    private ImportPacks() {}

    static Path tree(String id) {
        Path configured = Path.of(System.getProperty(
                "space.import.fixtures",
                System.getProperty("space.backend.root", "backend")
                        + "/libraries/import-format/src/testFixtures/resources/import-packs"));
        if (Files.isDirectory(configured.resolve(id))) return configured.resolve(id);
        Path cwd = Path.of("").toAbsolutePath();
        Path nested = cwd.resolve("src/test/resources/import-packs").resolve(id);
        if (Files.isDirectory(nested)) return nested;
        Path fromRepo = cwd.resolve("backend/apps/control/src/test/resources/import-packs")
                .resolve(id);
        if (Files.isDirectory(fromRepo)) return fromRepo;
        throw new IllegalStateException("missing import-pack fixture " + id + " from " + cwd);
    }

    public static Path zipFixture(String id) throws IOException {
        Path zip = Files.createTempFile("import-pack-" + id + "-", ".zip");
        zip.toFile().deleteOnExit();
        zipTree(tree(id), zip);
        return zip;
    }

    /** GitHub zipball 形态：全部条目落在单一包装目录下。 */
    public static Path wrappedZip(String id, String folder) throws IOException {
        Path zip = Files.createTempFile("import-pack-wrap-" + id + "-", ".zip");
        zip.toFile().deleteOnExit();
        Path src = tree(id);
        String prefix = folder.endsWith("/") ? folder : folder + "/";
        try (ZipOutputStream out = new ZipOutputStream(Files.newOutputStream(zip));
                var walk = Files.walk(src)) {
            for (Path file : walk.filter(Files::isRegularFile).sorted().toList()) {
                String name = prefix + src.relativize(file).toString().replace('\\', '/');
                ZipEntry entry = new ZipEntry(name);
                entry.setTime(0);
                out.putNextEntry(entry);
                Files.copy(file, out);
                out.closeEntry();
            }
        }
        return zip;
    }

    static void zipTree(Path src, Path dest) throws IOException {
        try (ZipOutputStream out = new ZipOutputStream(Files.newOutputStream(dest));
                var walk = Files.walk(src)) {
            for (Path file : walk.filter(Files::isRegularFile).sorted().toList()) {
                String name = src.relativize(file).toString().replace('\\', '/');
                ZipEntry entry = new ZipEntry(name);
                entry.setTime(0);
                out.putNextEntry(entry);
                Files.copy(file, out);
                out.closeEntry();
            }
        }
    }

    static Path zipEntries(Map<String, byte[]> files) throws IOException {
        Path zip = Files.createTempFile("import-pack-synthetic-", ".zip");
        zip.toFile().deleteOnExit();
        try (ZipOutputStream out = new ZipOutputStream(Files.newOutputStream(zip))) {
            for (var entry : files.entrySet()) {
                ZipEntry zipEntry = new ZipEntry(entry.getKey());
                zipEntry.setTime(0);
                out.putNextEntry(zipEntry);
                out.write(entry.getValue());
                out.closeEntry();
            }
        }
        return zip;
    }

    static Path zipSlip(String slipName, byte[] payload) throws IOException {
        ByteArrayOutputStream raw = new ByteArrayOutputStream();
        try (ZipOutputStream out = new ZipOutputStream(raw)) {
            ZipEntry entry = new ZipEntry(slipName);
            entry.setTime(0);
            out.putNextEntry(entry);
            out.write(payload);
            out.closeEntry();
        }
        Path zip = Files.createTempFile("import-pack-slip-", ".zip");
        zip.toFile().deleteOnExit();
        Files.write(zip, raw.toByteArray());
        return zip;
    }

    /** Reproducible IPD acceptance variants; optionally use the generated deliverable ZIPs directly. */
    public static Path ipdToleranceZip(String variant) throws IOException {
        String generated = System.getenv("IPD_TEST_PACK_DIR");
        if (generated != null && !generated.isBlank()) {
            Path zip = Path.of(generated).resolve("ipd-" + variant + ".zip");
            if (!Files.isRegularFile(zip)) throw new IOException("missing generated IPD pack: " + zip);
            return zip;
        }
        Path root = tree("F-ipd-tolerant");
        Map<String, byte[]> files = new LinkedHashMap<>();
        try (var walk = Files.walk(root)) {
            for (Path file : walk.filter(Files::isRegularFile).sorted().toList()) {
                files.put(root.relativize(file).toString().replace('\\', '/'), Files.readAllBytes(file));
            }
        }
        String klass = new String(files.get("CLASS.TXT.json"), java.nio.charset.StandardCharsets.UTF_8);
        if (variant.equals("renumbered")) klass = klass.replace("100", "900").replace("110", "910");
        else if (variant.equals("missing-parent"))
            klass = klass.replace("\"p_code\": \"100\"", "\"p_code\": \"missing\"");
        else if (variant.equals("empty")) {
            klass = "[]";
            files.put("ALL_META.TXT.json", "[{\"dockw\":\"产品介绍\"}]".getBytes(java.nio.charset.StandardCharsets.UTF_8));
        } else if (variant.equals("missing-link")) {
            files.put(
                    "intro.html",
                    "<a href='missing.html'>broken</a>".getBytes(java.nio.charset.StandardCharsets.UTF_8));
        } else if (!variant.equals("valid")) throw new IllegalArgumentException("unknown IPD variant: " + variant);
        files.put("CLASS.TXT.json", klass.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        return zipEntries(files);
    }

    private static Path referencePack(String name) {
        return Path.of(System.getProperty("space.backend.root", "backend"))
                .resolve("../docs/reference/docs")
                .resolve(name)
                .toAbsolutePath()
                .normalize();
    }

    public static Path hwFullZip() {
        Path fromRepo = Path.of("docs/reference/docs/api-ecs.zip");
        if (Files.isRegularFile(fromRepo)) return fromRepo.toAbsolutePath();
        Path fromBackend = referencePack("api-ecs.zip");
        if (Files.isRegularFile(fromBackend)) return fromBackend.toAbsolutePath();
        return null;
    }

    public static Path oversizePageZip() throws IOException {
        byte[] huge = "x".repeat(ImportLimits.MAX_CONTENT_BYTES + 1).getBytes(java.nio.charset.StandardCharsets.UTF_8);
        String manifest = """
                {
                  "bundleVersion": "1.0",
                  "generator": "bundle-v1",
                  "pages": [{
                    "externalId": "huge",
                    "slug": "huge",
                    "title": "Huge",
                    "format": "markdown",
                    "content": "content/huge.md"
                  }],
                  "toc": [],
                  "checksums": {"content/huge.md": "sha256:deadbeef"}
                }
                """;
        Map<String, byte[]> files = new LinkedHashMap<>();
        files.put("manifest.json", manifest.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        files.put("content/huge.md", huge);
        return zipEntries(files);
    }

    public static Path welcomeAsHtmlOverV1() throws IOException {
        Path src = tree("F-v1-ok");
        byte[] png = Files.readAllBytes(src.resolve("attachments/pixel.png"));
        byte[] guide = Files.readAllBytes(src.resolve("content/guide.md"));
        byte[] welcome = """
                <h1>Welcome</h1>
                <p>Hello from F-v1-ok.</p>
                """.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        String welcomeSha = Sha256.hex(welcome);
        String guideSha = Sha256.hex(guide);
        String pngSha = Sha256.hex(png);
        String manifest = """
                {
                  "bundleVersion": "1.0",
                  "generator": "bundle-v1",
                  "pages": [
                    {
                      "externalId": "welcome",
                      "slug": "welcome",
                      "title": "Welcome",
                      "format": "html",
                      "content": "content/welcome.html",
                      "seo": {"description": "Hello pack"},
                      "attachments": ["attachments/pixel.png"]
                    },
                    {
                      "externalId": "guide",
                      "slug": "guide",
                      "title": "Guide",
                      "format": "markdown",
                      "content": "content/guide.md",
                      "seo": {"description": "Second page"}
                    }
                  ],
                  "toc": [
                    {"label": "Welcome", "kind": "target", "ref": "welcome", "url": null, "children": []},
                    {"label": "Guide", "kind": "target", "ref": "guide", "url": null, "children": []}
                  ],
                  "checksums": {
                    "content/welcome.html": "sha256:%s",
                    "content/guide.md": "sha256:%s",
                    "attachments/pixel.png": "sha256:%s"
                  }
                }
                """.formatted(welcomeSha, guideSha, pngSha);
        Map<String, byte[]> files = new LinkedHashMap<>();
        files.put("manifest.json", manifest.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        files.put("content/welcome.html", welcome);
        files.put("content/guide.md", guide);
        files.put("attachments/pixel.png", png);
        return zipEntries(files);
    }

    public static Path okfGithubZip() {
        String env = System.getenv("TOURISM_OKF_ZIP");
        if (env != null && !env.isBlank()) {
            Path path = Path.of(env);
            if (Files.isRegularFile(path)) return path.toAbsolutePath();
        }
        for (Path candidate : List.of(
                Path.of("docs/reference/docs/tourism-okf.zip"),
                referencePack("tourism-okf.zip"),
                Path.of("/tmp/tourism-okf.zip"))) {
            if (Files.isRegularFile(candidate)) return candidate.toAbsolutePath();
        }
        return null;
    }
}

final class InMemoryAdaptSink implements AdaptSink {
    private final Map<String, StoredAttachment> stored = new LinkedHashMap<>();
    private final List<AdaptedPack.Issue> issues = new ArrayList<>();

    @Override
    public StoredAttachment putAttachment(String logicalPath, InputStream in, long size) {
        if (size > ImportLimits.MAX_ATTACHMENT_BYTES) throw new TooLarge(logicalPath);
        byte[] bytes;
        try {
            bytes = in.readAllBytes();
        } catch (IOException failure) {
            throw new IllegalStateException("attachment stream failed", failure);
        }
        if (bytes.length > ImportLimits.MAX_ATTACHMENT_BYTES) throw new TooLarge(logicalPath);
        StoredAttachment attachment = AttachmentTypes.inspect(logicalPath, bytes);
        stored.put(logicalPath, attachment);
        return attachment;
    }

    @Override
    public void info(String code, String path, String detail) {
        issues.add(new AdaptedPack.Issue(code, path, detail));
    }

    @Override
    public List<AdaptedPack.Issue> issues() {
        return List.copyOf(issues);
    }

    Map<String, StoredAttachment> stored() {
        return Map.copyOf(stored);
    }
}
