package io.space.concepts.space.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import io.space.concepts.space.api.*;
import io.space.concepts.space.api.SpaceApi;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class SpaceTest {
    private final SpaceApi.ActorId actor = new SpaceApi.ActorId(UUID.randomUUID());

    @Test
    void metadataPatchPreservesOmittedFieldsAndNormalizesClears() {
        Space space = active();
        assertThat(space.describe(SpaceApi.Patch.set(SpaceApi.IconKey.BOOK), SpaceApi.Patch.set(" 说明 "), actor))
                .isTrue();
        assertThat(space.describe(SpaceApi.Patch.set(SpaceApi.IconKey.CODE), SpaceApi.Patch.unchanged(), actor))
                .isTrue();

        assertThat(space.view().icon()).isEqualTo(SpaceApi.IconKey.CODE);
        assertThat(space.view().description()).isEqualTo("说明");
        assertThat(space.describe(SpaceApi.Patch.unchanged(), SpaceApi.Patch.clear(), actor))
                .isTrue();
        assertThat(space.view().description()).isNull();
    }

    @Test
    void archiveIsIdempotentAndBlocksMetadataUntilRestore() {
        Space space = active();
        assertThat(space.archive(actor)).isTrue();
        assertThat(space.archive(actor)).isFalse();
        assertThatExceptionOfType(Space.ArchivedMutation.class)
                .isThrownBy(() -> space.rename(new SpaceName("Blocked"), actor));

        assertThat(space.restore(actor)).isTrue();
        assertThat(space.rename(new SpaceName("Restored"), actor)).isTrue();
        assertThat(space.view().name()).isEqualTo("Restored");
    }

    @Test
    void setAutoReleaseIsIdempotentAndBlockedWhileArchived() {
        Space space = active();
        assertThat(space.setAutoRelease(true, actor)).isFalse();
        assertThat(space.setAutoRelease(false, actor)).isTrue();
        assertThat(space.view().autoRelease()).isFalse();
        assertThat(space.setAutoRelease(false, actor)).isFalse();
        space.archive(actor);
        assertThatExceptionOfType(Space.ArchivedMutation.class).isThrownBy(() -> space.setAutoRelease(true, actor));
    }

    @Test
    void convertSwitchesModeAndForcesAutoReleaseWhenReturningToAuthored() {
        Space space = active();
        assertThat(space.convert(SpaceApi.Mode.AUTHORED, actor)).isFalse();
        assertThat(space.convert(SpaceApi.Mode.SYNCED, actor)).isTrue();
        assertThat(space.view().mode()).isEqualTo(SpaceApi.Mode.SYNCED);
        assertThat(space.convert(SpaceApi.Mode.AUTHORED, actor)).isTrue();
        assertThat(space.view().mode()).isEqualTo(SpaceApi.Mode.AUTHORED);
        assertThat(space.view().autoRelease()).isTrue();
        space.archive(actor);
        assertThatExceptionOfType(Space.ArchivedMutation.class)
                .isThrownBy(() -> space.convert(SpaceApi.Mode.SYNCED, actor));
    }

    @Test
    void nameRejectsBlankAndOverlongValues() {
        assertThatExceptionOfType(IllegalArgumentException.class).isThrownBy(() -> new SpaceName("   "));
        assertThatExceptionOfType(IllegalArgumentException.class).isThrownBy(() -> new SpaceName("x".repeat(121)));
    }

    private Space active() {
        Instant now = Instant.parse("2026-09-02T00:00:00Z");
        return new Space(
                UUID.randomUUID(),
                UUID.randomUUID(),
                new SpaceName("Space"),
                null,
                "Description",
                SpaceApi.Mode.AUTHORED,
                SpaceApi.Status.ACTIVE,
                true,
                now,
                actor.value(),
                now,
                actor.value());
    }
}
