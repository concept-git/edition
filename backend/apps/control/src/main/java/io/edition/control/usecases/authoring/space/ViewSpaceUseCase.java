package io.edition.control.usecases.authoring.space;

import static io.edition.control.usecases.authoring.space.SpaceTypes.*;

import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ViewSpaceUseCase {

    private final SpaceProjection projection;

    ViewSpaceUseCase(SpaceDependencies dependencies) {
        this.projection = dependencies.projection;
    }

    @Transactional(readOnly = true)
    public SpaceDetail viewSpace(String credential, UUID tenant, UUID space) {
        return projection.view(credential, tenant, space);
    }
}
