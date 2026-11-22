package io.edition.index.usecases;

import io.edition.delivery.contract.SearchSegment;
import io.edition.delivery.contract.SiteSnapshot;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Supplier;

/** Index use cases own this port. The read model implements it. */
public interface SearchQueue {
    record SearchTask(UUID site, UUID tenant, long epoch, UUID token, int attempts) {}

    record SearchInput(SiteSnapshot.SearchSettings settings, long pageCount) {}

    List<SearchTask> claimSearch(UUID token);

    Optional<SearchInput> searchInput(SearchTask work);

    List<SiteSnapshot.Page> searchPages(SearchTask work, int offset, int limit);

    String searchIndex(SearchTask work);

    boolean renewSearch(SearchTask work);

    boolean completeSearch(SearchTask work, List<SearchSegment> complete);

    <T> T inTenant(UUID tenant, Supplier<T> work);

    void rememberGarbage(String index);

    void postponeGarbage(String index);

    void failSearch(SearchTask work, String code);

    List<String> collectableIndexes();

    void deleteGarbage(String index);

    void recordHeartbeat(String service, String instance, String version);
}
