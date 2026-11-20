package io.space.control.compositions.authoring.space;

import io.space.concepts.space.api.SpaceApi;
import io.space.control.compositions.resource.SpaceArchivedException;
import io.space.control.compositions.resource.SpaceNotFoundException;

/** 概念有限输出 → flow 异常。 */
final class SpaceResults {
    private SpaceResults() {}

    static SpaceApi.View changed(SpaceApi.MutationResult result) {
        return switch (result) {
            case SpaceApi.MutationResult.Changed ok -> ok.space();
            case SpaceApi.MutationResult.NotFound ignored -> throw new SpaceNotFoundException();
            case SpaceApi.MutationResult.Archived ignored -> throw new SpaceArchivedException();
        };
    }

    static SpaceApi.View found(SpaceApi.LookupResult result) {
        return switch (result) {
            case SpaceApi.LookupResult.Found ok -> ok.space();
            case SpaceApi.LookupResult.NotFound ignored -> throw new SpaceNotFoundException();
        };
    }
}
