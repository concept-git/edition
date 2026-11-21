package io.edition.control.compositions.authoring.space;

import io.edition.concepts.space.api.SpaceApi;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import java.util.Locale;
import java.util.UUID;

/** Space 补丁归一、mode/status 翻译与创建/改名的名字校验；真实归属走 {@code ResourceChain}。 */
final class SpacePatch {
    private SpacePatch() {}

    /** gateway 已用 @Pattern 校验 mode；此处非法值属编程错误而非业务拒绝。 */
    static SpaceApi.Mode mode(String mode) {
        try {
            return SpaceApi.Mode.valueOf(mode.strip().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException | NullPointerException invalid) {
            throw new IllegalArgumentException("space mode must be authored or synced");
        }
    }

    static SpaceApi.View create(SpaceApi spaces, SpaceApi.ActorId actor, UUID tenant, String name, SpaceApi.Mode mode) {
        try {
            return spaces.create(actor, tenant, name, mode);
        } catch (IllegalArgumentException invalid) {
            throw new SpaceNameInvalidException();
        }
    }

    static SpaceApi.MutationResult rename(
            SpaceApi spaces, SpaceApi.ActorId actor, SpaceApi.SpaceId space, String name) {
        try {
            return spaces.rename(actor, space, name);
        } catch (IllegalArgumentException invalid) {
            throw new SpaceNameInvalidException();
        }
    }

    static SpaceApi.Mode optionalMode(String value) {
        return value == null || value.isBlank() ? null : mode(value);
    }

    static SpaceApi.Status optionalStatus(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return SpaceApi.Status.valueOf(value.strip().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException invalid) {
            throw new SpacePatchInvalidException();
        }
    }

    static NormalizedPatch normalize(SpaceTypes.UpdatePatch patch) {
        if (patch == null || patch.empty()) throw new SpacePatchInvalidException();
        SpaceApi.Patch<String> name = normalizeName(patch.name());
        SpaceApi.Patch<SpaceApi.IconKey> icon = normalizeIcon(patch.icon());
        SpaceApi.Patch<String> description = normalizeDescription(patch.description());
        java.util.Optional<Boolean> autoRelease = patch.autoRelease();
        return new NormalizedPatch(name, icon, description, autoRelease);
    }

    static NormalizedPatch normalize(SpaceTypes.UpdatePatch patch, SpaceApi.Status status) {
        try {
            return normalize(patch);
        } catch (io.edition.control.compositions.flow.FlowException invalidInput) {
            // Lifecycle refusal has precedence over field errors; valid replays still reach idempotency.
            if (status == SpaceApi.Status.ARCHIVED)
                throw new io.edition.control.compositions.resource.SpaceArchivedException();
            throw invalidInput;
        }
    }

    private static SpaceApi.Patch<String> normalizeName(SpaceApi.Patch<String> patch) {
        return switch (patch) {
            case SpaceApi.Patch.Unchanged<String> ignored -> patch;
            case SpaceApi.Patch.Clear<String> ignored -> throw new SpaceNameInvalidException();
            case SpaceApi.Patch.Set<String> set -> {
                String value = set.value().strip();
                if (value.isEmpty() || value.length() > 120) throw new SpaceNameInvalidException();
                yield SpaceApi.Patch.set(value);
            }
        };
    }

    private static SpaceApi.Patch<SpaceApi.IconKey> normalizeIcon(SpaceApi.Patch<String> patch) {
        try {
            return switch (patch) {
                case SpaceApi.Patch.Unchanged<String> ignored -> SpaceApi.Patch.unchanged();
                case SpaceApi.Patch.Clear<String> ignored -> SpaceApi.Patch.clear();
                case SpaceApi.Patch.Set<String> set -> {
                    String value = set.value().strip();
                    yield value.isEmpty() ? SpaceApi.Patch.clear() : SpaceApi.Patch.set(SpaceApi.IconKey.parse(value));
                }
            };
        } catch (IllegalArgumentException invalid) {
            throw new SpaceIconInvalidException();
        }
    }

    private static SpaceApi.Patch<String> normalizeDescription(SpaceApi.Patch<String> patch) {
        return switch (patch) {
            case SpaceApi.Patch.Unchanged<String> ignored -> patch;
            case SpaceApi.Patch.Clear<String> ignored -> patch;
            case SpaceApi.Patch.Set<String> set -> {
                String value = set.value().strip();
                if (value.length() > 4000) throw new SpacePatchInvalidException();
                yield value.isEmpty() ? SpaceApi.Patch.clear() : SpaceApi.Patch.set(value);
            }
        };
    }

    /** 幂等指纹只看归一后的补丁，omitted / null / 同值三种写法归一为同一请求。 */
    static String canonical(NormalizedPatch patch) {
        return IdempotentFlowExecutor.canonical(
                field(patch.name()),
                field(patch.icon()),
                field(patch.description()),
                patch.autoRelease().map(value -> "set:" + value).orElse("unchanged"));
    }

    private static String field(SpaceApi.Patch<?> patch) {
        return switch (patch) {
            case SpaceApi.Patch.Unchanged<?> ignored -> "unchanged";
            case SpaceApi.Patch.Clear<?> ignored -> "clear";
            case SpaceApi.Patch.Set<?> set -> "set:" + set.value();
        };
    }

    record NormalizedPatch(
            SpaceApi.Patch<String> name,
            SpaceApi.Patch<SpaceApi.IconKey> icon,
            SpaceApi.Patch<String> description,
            java.util.Optional<Boolean> autoRelease) {}
}
