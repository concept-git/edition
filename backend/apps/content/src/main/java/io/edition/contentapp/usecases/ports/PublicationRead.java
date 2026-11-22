package io.edition.contentapp.usecases.ports;

import io.edition.contentapp.usecases.access.ContentIdentity.PublicationCredential;
import io.edition.delivery.contract.SiteSnapshot;
import java.util.List;
import java.util.UUID;

/** Read port for the publication contract. The JDBC read model implements it. */
public interface PublicationRead {
    void verifyReader();

    MountRead mount(String host, String slug, PublicationCredential credential);

    NavigationRead<MachineDocument> machine(String host, String slug, PublicationCredential credential);

    NavigationRead<SearchDocument> searchContext(
            String host, String slug, String snapshot, PublicationCredential credential);

    List<SiteSnapshot.Page> searchPages(String host, List<UUID> ids, long revision, PublicationCredential credential);

    List<FileEntry> files(
            String host,
            String slug,
            String snapshot,
            PublicationCredential credential,
            String after,
            int limit,
            String exact);

    PageRead read(String host, String path, UUID token, String proof, String sessionProof);

    DocumentRead document(String host, String path, PublicationCredential credential);

    <T> NavigationRead<T> navigation(
            String host, String kind, String slug, PublicationCredential credentials, Class<T> documentType);

    interface SiteTrace {
        void site(UUID tenant, UUID site);
    }

    record PageAccess(UUID id, UUID spaceId, String path, boolean noIndex, String description) {}

    record FileEntry(String path, String kind, List<SiteSnapshot.Page> owners, Long size, String sha256) {
        public SiteSnapshot.Page page() {
            return owners.getFirst();
        }
    }

    record PageRead(String outcome, String primaryHost, SiteSnapshot.Page page) {}

    record MachineDocument(List<SiteSnapshot.Space> spaces, List<PageAccess> pages) {}

    record SearchDocument(
            UUID siteId,
            long revision,
            String binding,
            String searchKey,
            String indexedKey,
            String index,
            List<SiteSnapshot.Space> spaces,
            boolean hasRelease) {
        public String snapshot(UUID space) {
            return siteId + ":" + space + ":" + revision;
        }

        public boolean ready() {
            return index != null && searchKey.equals(indexedKey);
        }
    }

    record MountRead(String outcome, String snapshot, String binding, SiteSnapshot.Space space) {}

    record NavigationRead<T>(String outcome, String primaryHost, SiteSnapshot.Brand brand, T document) {}

    record SiteDocument(SiteSnapshot.Brand brand, UUID home, long revision, List<SiteSnapshot.Space> spaces) {}

    record DocumentRead(
            String outcome,
            String primaryHost,
            String redirectPath,
            UUID siteId,
            SiteSnapshot.Page page,
            SiteSnapshot.Attachment attachment,
            SiteDocument context) {}
}
