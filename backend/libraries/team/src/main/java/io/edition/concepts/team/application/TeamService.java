package io.edition.concepts.team.application;

import io.edition.concepts.team.api.*;
import io.edition.concepts.team.api.TeamApi;
import io.edition.concepts.team.domain.TeamName;
import io.edition.concepts.team.domain.TeamRepository;
import io.edition.shared.KeysetCursor;
import io.edition.shared.PageWindow;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 群体身份的事务入口；仅守护名称及生命周期，成员和授权级联由组合层完成。 */
@Service
@Transactional
class TeamService implements TeamApi {
    private final TeamRepository repository;

    TeamService(TeamRepository repository) {
        this.repository = repository;
    }

    public CreateResult create(java.util.UUID scope, String name) {
        var parsed = TeamName.parse(name);
        if (parsed.isEmpty()) return new CreateResult.InvalidName();
        return repository
                .insert(scope, parsed.orElseThrow())
                .<CreateResult>map(CreateResult.Created::new)
                .orElseGet(CreateResult.NameTaken::new);
    }

    public RenameResult rename(TeamId team, String name) {
        if (repository.lock(team).isEmpty()) return new RenameResult.NotFound();
        var parsed = TeamName.parse(name);
        if (parsed.isEmpty()) return new RenameResult.InvalidName();
        return repository
                .update(team, parsed.orElseThrow())
                .<RenameResult>map(RenameResult.Renamed::new)
                .orElseGet(RenameResult.NameTaken::new);
    }

    public DeleteResult delete(TeamId team) {
        if (repository.lock(team).isEmpty()) return new DeleteResult.NotFound();
        repository.delete(team);
        return new DeleteResult.Deleted(team);
    }

    @Transactional(readOnly = true)
    public Optional<View> view(TeamId team) {
        return repository.find(team);
    }

    public Optional<View> lock(TeamId team) {
        return repository.lock(team);
    }

    @Transactional(readOnly = true)
    public Page list(java.util.UUID scope, String cursor, int limit) {
        if (limit < 1 || limit > 100) throw new IllegalArgumentException("limit must be between 1 and 100");
        Optional<KeysetCursor> decoded = KeysetCursor.decode(cursor);
        var rows = repository.page(
                scope,
                decoded.map(KeysetCursor::at).orElse(null),
                decoded.map(KeysetCursor::id).orElse(null),
                limit + 1);
        var window = PageWindow.of(
                rows,
                limit,
                row -> KeysetCursor.encode(row.createdAt(), row.id().value()));
        return new Page(window.items(), window.nextCursor());
    }
}
