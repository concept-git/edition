package io.edition.control.compositions.releases.bundleimport;

import static io.edition.control.compositions.releases.bundleimport.BundleImportTypes.*;

import io.edition.concepts.objectstore.api.ObjectStoreApi;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.releases.release.ReleaseAccess;
import io.edition.control.compositions.resource.SpaceArchivedException;
import io.edition.control.compositions.resource.SpaceModeRestrictedException;
import java.time.Duration;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class StartImportUploadUseCase {

    private static final Duration UPLOAD_TTL = BundleImportDependencies.UPLOAD_TTL;

    private final ReleaseAccess access;

    private final ObjectStoreApi objectStore;

    StartImportUploadUseCase(BundleImportDependencies dependencies) {
        this.access = dependencies.access;
        this.objectStore = dependencies.objectStore;
    }

    @Transactional
    public ImportUpload startImportUpload(String credential, UUID tenant, UUID space) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            SpaceApi.View owner = access.space(tenant, space);
            access.require(credential, tenant, space, TenantAccess.PUBLISH);
            if (owner.status() == SpaceApi.Status.ARCHIVED) throw new SpaceArchivedException();
            if (owner.mode() != SpaceApi.Mode.SYNCED) throw new SpaceModeRestrictedException();
            String uploadKey = "import-uploads/" + tenant + "/" + space + "/" + UUID.randomUUID();
            ObjectStoreApi.PresignedPut put;
            try {
                put = objectStore.presignPut(uploadKey, UPLOAD_TTL, "application/zip");
            } catch (ObjectStoreApi.Unavailable failure) {
                throw new ImportObjectStoreUnavailableException(failure);
            }
            return new ImportUpload(put.url(), put.expiresAt(), uploadKey);
        }
    }
}
