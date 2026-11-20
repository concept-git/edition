package io.space.control.compositions.releases.bundleimport;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** 下载流与临时 ZIP 的单一生命周期；清理失败不能覆盖业务或依赖故障。 */
final class ImportZipFile implements AutoCloseable {
    private static final Logger LOG = LoggerFactory.getLogger(ImportZipFile.class);
    private final Path path;

    private ImportZipFile(Path path) {
        this.path = path;
    }

    static ImportZipFile copy(InputStream source) throws IOException {
        // 文件创建失败也必须关闭已经打开的对象存储流。
        ImportZipFile file = null;
        boolean retained = false;
        try {
            try (source) {
                file = new ImportZipFile(Files.createTempFile("import-run-", ".zip"));
                Files.copy(source, file.path, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            }
            retained = true;
            return file;
        } finally {
            if (!retained && file != null) file.close();
        }
    }

    Path path() {
        return path;
    }

    @Override
    public void close() {
        remove(path);
    }

    static void remove(Path path) {
        try {
            Files.deleteIfExists(path);
        } catch (IOException failure) {
            LOG.warn("Cannot remove temporary import ZIP {}", path, failure);
        }
    }
}
