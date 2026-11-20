package io.space.concepts.team.adapters.persistence;

import io.space.concepts.team.api.*;
import io.space.concepts.team.api.TeamApi;
import io.space.concepts.team.domain.TeamName;
import io.space.concepts.team.domain.TeamRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

/** 仅拥有群体身份的持久化；作用域内重名由数据库唯一约束裁决，冲突不污染共享事务。 */
@Repository
class MyBatisTeamRepository implements TeamRepository {
    private final TeamMapper mapper;
    private final TransactionTemplate uniqueWrites;

    MyBatisTeamRepository(TeamMapper mapper, PlatformTransactionManager transactions) {
        this.mapper = mapper;
        uniqueWrites = new TransactionTemplate(transactions);
        uniqueWrites.setPropagationBehavior(TransactionDefinition.PROPAGATION_NESTED);
    }

    public Optional<TeamApi.View> insert(UUID scope, TeamName name) {
        return Optional.ofNullable(mapper.insert(scope, name.display(), name.normalized()))
                .map(MyBatisTeamRepository::view);
    }

    public Optional<TeamApi.View> update(TeamApi.TeamId team, TeamName name) {
        try {
            // 唯一冲突先回滚到保存点，再翻译为有限结果，避免留下 aborted 外层事务。
            return Optional.ofNullable(uniqueWrites.execute(
                            status -> mapper.update(team.value(), name.display(), name.normalized())))
                    .map(MyBatisTeamRepository::view);
        } catch (DuplicateKeyException conflict) {
            return Optional.empty();
        }
    }

    public Optional<TeamApi.View> find(TeamApi.TeamId team) {
        return Optional.ofNullable(mapper.find(team.value())).map(MyBatisTeamRepository::view);
    }

    public Optional<TeamApi.View> lock(TeamApi.TeamId team) {
        return Optional.ofNullable(mapper.lock(team.value())).map(MyBatisTeamRepository::view);
    }

    public boolean delete(TeamApi.TeamId team) {
        return mapper.delete(team.value()) == 1;
    }

    public List<TeamApi.View> page(UUID scope, Instant beforeCreatedAt, UUID beforeId, int limit) {
        return mapper.page(scope, beforeCreatedAt, beforeId, limit).stream()
                .map(MyBatisTeamRepository::view)
                .toList();
    }

    private static TeamApi.View view(TeamMapper.TeamRow row) {
        return new TeamApi.View(
                new TeamApi.TeamId(row.id()), row.tenantId(), row.name(), row.createdAt(), row.updatedAt());
    }
}
