package io.edition.control.modules.team.api;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/** Team [Scope] 概念唯一出口。 */
public interface TeamApi {

    CreateResult create(UUID scope, String name);

    /** 保持身份与作用域不变；重名或非法名称不改原状态。 */
    RenameResult rename(TeamId team, String name);

    /** 只终结群体身份；调用方在同一事务先完成成员与授权级联。 */
    DeleteResult delete(TeamId team);

    Optional<View> view(TeamId team);

    /** 供组合动作串行化生命周期，调用方须保持同一事务。 */
    Optional<View> lock(TeamId team);

    Page list(UUID scope, String cursor, int limit);

    record TeamId(UUID value) {
        public TeamId {
            Objects.requireNonNull(value, "team id");
        }
    }

    record View(TeamId id, UUID scope, String name, Instant createdAt, Instant updatedAt) {}

    record Page(List<View> teams, String nextCursor) {
        public Page {
            teams = List.copyOf(teams);
        }
    }

    sealed interface CreateResult {
        record Created(View team) implements CreateResult {}

        record InvalidName() implements CreateResult {}

        record NameTaken() implements CreateResult {}
    }

    sealed interface RenameResult {
        record Renamed(View team) implements RenameResult {}

        record NotFound() implements RenameResult {}

        record InvalidName() implements RenameResult {}

        record NameTaken() implements RenameResult {}
    }

    sealed interface DeleteResult {
        record Deleted(TeamId team) implements DeleteResult {}

        record NotFound() implements DeleteResult {}
    }
}
