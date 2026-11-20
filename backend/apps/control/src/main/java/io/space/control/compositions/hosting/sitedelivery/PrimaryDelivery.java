package io.space.control.compositions.hosting.sitedelivery;

import static io.space.control.compositions.hosting.sitedelivery.SiteDeliveryTypes.*;

import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

@Component
final class PrimaryDelivery {
    private final JdbcTemplate jdbc;
    private final JsonMapper json;
    private final ReaderAddress addresses;

    PrimaryDelivery(JdbcTemplate jdbc, JsonMapper json, ReaderAddress addresses) {
        this.jdbc = jdbc;
        this.json = json;
        this.addresses = addresses;
    }

    Status status(UUID site, boolean canRetry) {
        var state = json.readValue(
                jdbc.queryForObject("select publication_v1.delivery_status(?)::text", String.class, site),
                StateRow.class);
        var spaces = state.spaces().stream()
                .map(space -> new OnlineSpace(
                        space.spaceId(), space.slug(), space.releaseId(), addresses.href(state.host(), space.slug())))
                .toList();
        var current = new Current(
                state.revision(),
                state.host(),
                addresses.href(state.host(), null),
                spaces,
                state.host() != null,
                state.search());
        return new Status(
                true,
                State.completed,
                state.revision(),
                state.revision(),
                state.host(),
                spaces,
                null,
                canRetry && "failed".equals(state.search()),
                state.search(),
                new Desired(state.revision(), spaces),
                current,
                true,
                true,
                0);
    }

    void retry(UUID site) {
        jdbc.queryForObject("select publication_v1.retry_search(?)", Object.class, site);
    }

    private record StateRow(long revision, String host, String search, List<OnlineSpace> spaces) {}
}
