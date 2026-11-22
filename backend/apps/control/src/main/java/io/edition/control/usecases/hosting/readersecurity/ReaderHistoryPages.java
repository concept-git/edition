package io.edition.control.usecases.hosting.readersecurity;

import io.edition.control.modules.readersecurity.api.ReaderStateApi;
import io.edition.shared.Sha256;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
final class ReaderHistoryPages {
    private final JdbcTemplate jdbc;

    ReaderHistoryPages(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    List<Page> lookup(ReaderStateApi.Site site, String proof, String path, List<UUID> pages) {
        String ids = pages.stream().map(UUID::toString).collect(Collectors.joining(","));
        return jdbc.query(
                "select * from publication_v1.reader_history_pages(?,?,?,?,string_to_array(?, ',')::uuid[])",
                (row, ignored) -> new Page(
                        row.getObject(1, UUID.class), row.getObject(2, UUID.class), row.getString(3), row.getString(4)),
                site.host(),
                site.id(),
                Sha256.hex(proof),
                path,
                ids);
    }

    record Page(UUID spaceId, UUID pageId, String slug, String path) {}
}
