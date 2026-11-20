package io.space.cli.shared;

import java.nio.channels.FileChannel;
import java.nio.file.*;
import java.nio.file.attribute.*;
import java.util.*;

/** 本机私密状态的文件工具：检查归属、收紧权限，并通过临时文件原子替换。 */
public final class PrivateFiles {
    private PrivateFiles() {}

    public static Path home() throws Exception {
        Path home = location();
        secureDirectory(home);
        return home;
    }

    public static Path location() {
        String configured = System.getenv("SPACECTL_HOME");
        return configured != null
                ? Path.of(configured)
                : Path.of(System.getProperty("user.home"), ".config", "spacectl");
    }

    public static void secureDirectory(Path path) throws Exception {
        if (Files.isSymbolicLink(path))
            throw CliFailure.input("State path is a symbolic link.", "Use a private directory owned by this user.");
        Files.createDirectories(path);
        privateMode(path, true);
    }

    public static void privateMode(Path path, boolean directory) throws Exception {
        if (Files.isSymbolicLink(path))
            throw CliFailure.input("Refusing symbolic-link state file.", "Use a private regular file.");
        if (Files.getFileStore(path).supportsFileAttributeView("posix")) {
            if (!Files.getOwner(path).equals(Files.getOwner(Path.of(System.getProperty("user.home")))))
                throw CliFailure.input("State is owned by another user.", "Use a directory owned by this user.");
            Files.setPosixFilePermissions(path, PosixFilePermissions.fromString(directory ? "rwx------" : "rw-------"));
        } else {
            var view = Files.getFileAttributeView(path, AclFileAttributeView.class);
            if (view == null)
                throw CliFailure.input(
                        "Private state permissions are unavailable.",
                        "Use a filesystem with POSIX or Windows ACL support.");
            view.setAcl(List.of(AclEntry.newBuilder()
                    .setType(AclEntryType.ALLOW)
                    .setPrincipal(Files.getOwner(path))
                    .setPermissions(EnumSet.allOf(AclEntryPermission.class))
                    .build()));
        }
    }

    public static void atomic(Path target, byte[] bytes) throws Exception {
        // 先写完并刷入磁盘，再替换目标；中途失败不会留下半份配置或回执。
        if (Files.isSymbolicLink(target))
            throw CliFailure.input("Refusing symbolic-link state file.", "Use a private regular file.");
        Path tmp = Files.createTempFile(target.getParent(), ".write-", ".tmp");
        try {
            privateMode(tmp, false);
            Files.write(tmp, bytes);
            try (var channel = FileChannel.open(tmp, StandardOpenOption.WRITE)) {
                channel.force(true);
            }
            Files.move(tmp, target, StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
        } finally {
            Files.deleteIfExists(tmp);
        }
    }
}
