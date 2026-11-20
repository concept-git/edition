package io.space.control.compositions.authoring.space;

import static io.space.control.compositions.authoring.space.SpaceTypes.*;

import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListSpacesUseCase {

    private final SpaceCollectionListing listing;

    ListSpacesUseCase(SpaceDependencies dependencies) {
        this.listing = dependencies.listing;
    }

    @Transactional(readOnly = true)
    public SpacePage listSpaces(
            String credential, UUID tenant, String cursor, int limit, String status, String mode, String collectionId) {
        return listing.list(credential, tenant, cursor, limit, status, mode, collectionId);
    }
}
