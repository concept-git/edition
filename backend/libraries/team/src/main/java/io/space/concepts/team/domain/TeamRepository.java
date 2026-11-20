package io.space.concepts.team.domain;

import io.space.concepts.team.api.*;
import io.space.concepts.team.api.TeamApi;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** 本概念的持久化端口；insert/update 的空结果只表示作用域内名称占用，不代表依赖故障。 */
public interface TeamRepository {
    Optional<TeamApi.View> insert(UUID scope, TeamName name);

    Optional<TeamApi.View> update(TeamApi.TeamId team, TeamName name);

    Optional<TeamApi.View> find(TeamApi.TeamId team);

    Optional<TeamApi.View> lock(TeamApi.TeamId team);

    boolean delete(TeamApi.TeamId team);

    List<TeamApi.View> page(UUID scope, Instant beforeCreatedAt, UUID beforeId, int limit);
}
