package io.edition.control.modules.user.application;

import io.edition.control.modules.user.api.*;
import io.edition.control.modules.user.api.UserApi;
import io.edition.control.modules.user.api.UserEvents;
import io.edition.control.modules.user.domain.EmailVerification;
import io.edition.control.modules.user.domain.UserRepository;
import io.edition.shared.PageWindow;
import io.edition.shared.ValidationViolation;
import java.net.URI;
import java.time.Clock;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 管理全局身份与验证挑战；账户锁串行化终结动作，跨概念撤权由完成事件驱动。 */
@Service
@Transactional
class UserService implements UserApi {
    private final UserRepository repository;
    private final ApplicationEventPublisher events;
    private final Clock clock;

    UserService(UserRepository repository, ApplicationEventPublisher events, Clock clock) {
        this.repository = repository;
        this.events = events;
        this.clock = clock;
    }

    @Override
    @Transactional(readOnly = true)
    public long readerEpoch(UserId user) {
        return repository.readerEpoch(user);
    }

    @Override
    public long revokeReaderSessions(UserId user) {
        return repository.revokeReaderSessions(user);
    }

    @Override
    public RegisterResult register(String email, String name) {
        var issued = EmailVerification.issue(clock.instant());
        var inserted = repository.insert(email, name, issued.tokenHash(), issued.expiresAt());
        if (inserted.isEmpty()) {
            return new RegisterResult.EmailTaken(email);
        }
        var user = inserted.get();
        events.publishEvent(new UserEvents.Registered(user, email, name));
        return new RegisterResult.Registered(user, issued.token());
    }

    @Override
    public VerifyResult verify(UserId user, String token) {
        repository.lockAccountProfile(user);
        var challenge = repository.verification(user);
        if (challenge.isEmpty() || !EmailVerification.redeems(challenge.get(), token, clock.instant())) {
            return new VerifyResult.Rejected();
        }
        repository.markVerified(user);
        events.publishEvent(new UserEvents.Verified(user));
        return new VerifyResult.Verified(user);
    }

    @Override
    public Optional<Verification> requestVerification(UserId user) {
        var profile = repository.lockAccountProfile(user).orElse(null);
        if (profile == null || profile.status() != Status.ACTIVE || profile.verified()) return Optional.empty();
        var issued = EmailVerification.issue(clock.instant());
        repository.replaceVerification(user, issued.tokenHash(), issued.expiresAt());
        return Optional.of(new Verification(issued.token(), issued.expiresAt()));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean verificationPending(UserId user, String token) {
        return repository
                .verification(user)
                .map(value -> EmailVerification.redeems(value, token, clock.instant()))
                .orElse(false);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserId> byEmail(String email) {
        return repository.findByEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Profile> profile(UserId user) {
        return repository.findProfile(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AccountProfile> accountProfile(UserId user) {
        return repository.findAccountProfile(user);
    }

    @Override
    public Optional<AccountProfile> lockAccountProfile(UserId user) {
        return repository.lockAccountProfile(user);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isActive(UserId user) {
        return repository
                .findAccountProfile(user)
                .map(profile -> profile.status() == Status.ACTIVE)
                .orElse(false);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isPlatformOperator(UserId user) {
        return repository.isPlatformOperator(user);
    }

    @Override
    public UpdateProfileResult updateProfile(UserId user, String name, String locale, String avatar) {
        if (name == null || name.isBlank()) {
            return new UpdateProfileResult.Rejected(java.util.List.of(new ValidationViolation("name", "required")));
        }
        if (avatar != null) {
            try {
                var uri = URI.create(avatar);
                if (!"https".equalsIgnoreCase(uri.getScheme()) || uri.getHost() == null) {
                    return new UpdateProfileResult.Rejected(
                            java.util.List.of(new ValidationViolation("avatar", "https_required")));
                }
            } catch (IllegalArgumentException invalid) {
                return new UpdateProfileResult.Rejected(
                        java.util.List.of(new ValidationViolation("avatar", "invalid_url")));
            }
        }
        repository.updateProfile(user, name, locale, avatar);
        return repository
                .findAccountProfile(user)
                .<UpdateProfileResult>map(UpdateProfileResult.Updated::new)
                .orElseThrow(() -> new IllegalStateException("profile disappeared during update"));
    }

    @Override
    public LifecycleResult deactivate(UserId user) {
        return changeStatus(user, Status.DEACTIVATED);
    }

    @Override
    public LifecycleResult reactivate(UserId user) {
        return changeStatus(user, Status.ACTIVE);
    }

    /** 同一账户锁内判断墓碑和幂等状态；仅实际停用发布撤权事件。 */
    private LifecycleResult changeStatus(UserId user, Status target) {
        var profile = repository.lockAccountProfile(user).orElse(null);
        if (profile == null) return new LifecycleResult.NotFound();
        if (profile.status() == Status.ERASED) return new LifecycleResult.Erased();
        boolean changed = profile.status() != target;
        if (changed) {
            repository.setStatus(user, target.name().toLowerCase(Locale.ROOT));
            if (target == Status.DEACTIVATED) events.publishEvent(new UserEvents.Deactivated(user));
        }
        return new LifecycleResult.Ok(target, changed);
    }

    @Override
    public EraseResult erase(UserId user) {
        var profile = repository.lockAccountProfile(user).orElse(null);
        if (profile == null) return new EraseResult.NotFound();
        if (profile.status() == Status.ACTIVE) return new EraseResult.MustBeDeactivated();
        if (profile.status() == Status.DEACTIVATED) {
            repository.erase(user);
            events.publishEvent(new UserEvents.Erased(user));
            return new EraseResult.Ok(true);
        }
        return new EraseResult.Ok(false);
    }

    @Override
    @Transactional(readOnly = true)
    public SearchPage search(String query, String cursor, int limit) {
        String normalized = query == null ? "" : query.strip().toLowerCase(Locale.ROOT);
        if (normalized.length() < MIN_SEARCH_PREFIX_LENGTH) {
            throw new IllegalArgumentException("query must contain at least 2 characters");
        }
        int pageSize = Math.min(Math.max(limit, 1), 100);
        UserId before = cursor == null || cursor.isBlank() ? null : new UserId(UUID.fromString(cursor));
        var rows = repository.search(normalized, before, pageSize + 1);
        var window = PageWindow.of(rows, pageSize, row -> row.id().value().toString());
        return new SearchPage(window.items(), window.nextCursor());
    }
}
