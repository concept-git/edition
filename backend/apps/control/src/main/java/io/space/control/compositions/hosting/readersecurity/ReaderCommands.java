package io.space.control.compositions.hosting.readersecurity;

import io.space.concepts.customdomain.api.CustomDomainApi;
import io.space.concepts.password.api.PasswordApi;
import io.space.concepts.readersecurity.api.ReaderStateApi;
import io.space.concepts.site.api.SiteApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.user.api.UserApi;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ReaderCommands {
    private final CustomDomainApi domains;
    private final SiteApi sites;
    private final TenantScopeApi scope;
    private final UserApi users;
    private final PasswordApi passwords;
    private final ReaderStateApi state;

    ReaderCommands(
            CustomDomainApi domains,
            SiteApi sites,
            TenantScopeApi scope,
            UserApi users,
            PasswordApi passwords,
            ReaderStateApi state) {
        this.domains = domains;
        this.sites = sites;
        this.scope = scope;
        this.users = users;
        this.passwords = passwords;
        this.state = state;
    }

    public record Destination(java.util.UUID siteId, String host, String name) {
        ReaderStateApi.Site site() {
            return new ReaderStateApi.Site(siteId, host);
        }
    }

    public record Credentials(String access, String refresh, java.time.Instant expiresAt) {
        static Credentials from(ReaderStateApi.Credentials credentials) {
            return new Credentials(credentials.access(), credentials.refresh(), credentials.expiresAt());
        }

        @Override
        public String toString() {
            return "ReaderCredentials[redacted]";
        }
    }

    public record History(String spaceSlug, String pagePath, java.time.Instant viewedAt) {}

    @Transactional(readOnly = true)
    public Optional<Destination> destination(String host) {
        return domains.resolve(host)
                .flatMap(domain -> scope.inTenant(new TenantRegistryApi.TenantId(domain.tenantId()), () -> {
                    if (domains.primaryOf(domain.target())
                            .filter(primary -> !primary.equals(host))
                            .isPresent()) return Optional.empty();
                    return sites.view(new SiteApi.SiteId(domain.target()))
                            .map(site -> new Destination(site.id(), host, site.name()));
                }));
    }

    public Optional<Credentials> login(String host, String email, String password) {
        var destination = destination(host);
        if (destination.isEmpty()) return Optional.empty();
        var user = users.byEmail(email.strip()).orElse(null);
        if (user == null || !lockEligible(user)) {
            passwords.fakeAuthenticate(password);
            return Optional.empty();
        }
        var verified = passwords.authenticate(new PasswordApi.AccountId(user.value()), password);
        if (!(verified instanceof PasswordApi.AuthenticateResult.Authenticated)) return Optional.empty();
        return Optional.of(
                Credentials.from(state.open(destination.get().site(), user.value(), users.readerEpoch(user))));
    }

    public Optional<Credentials> refresh(String host, String proof) {
        return authorized(host, ReaderStateApi.Proof.REFRESH, proof)
                .flatMap(session -> state.rotate(session, proof))
                .map(Credentials::from);
    }

    public void logout(String host, String proof) {
        destination(host).ifPresent(destination -> {
            var site = destination.site();
            state.lookup(site, ReaderStateApi.Proof.REFRESH, proof).ifPresent(session -> {
                users.lockAccountProfile(new UserApi.UserId(session.user()));
                state.end(site, proof);
            });
        });
    }

    public Optional<List<History>> history(String host, String proof) {
        return authorized(host, ReaderStateApi.Proof.ACCESS, proof)
                .map(session -> state.history(session.site(), session.user()).stream()
                        .map(row -> new History(row.spaceSlug(), row.pagePath(), row.viewedAt()))
                        .toList());
    }

    public boolean visit(String host, String proof, String slug, String path) {
        var session = authorized(host, ReaderStateApi.Proof.ACCESS, proof);
        session.ifPresent(value -> state.visit(value.site(), value.user(), slug, path));
        return session.isPresent();
    }

    private Optional<ReaderStateApi.Session> authorized(String host, ReaderStateApi.Proof kind, String proof) {
        var destination = destination(host);
        if (destination.isEmpty()) return Optional.empty();
        var site = destination.get().site();
        var initial = state.lookup(site, kind, proof);
        if (initial.isEmpty()) return Optional.empty();
        var user = new UserApi.UserId(initial.get().user());
        if (!lockEligible(user)) return Optional.empty();
        long epoch = users.readerEpoch(user);
        return state.lookup(site, kind, proof)
                .filter(session -> session.user().equals(user.value()) && session.epoch() == epoch);
    }

    private boolean lockEligible(UserApi.UserId user) {
        return users.lockAccountProfile(user)
                .filter(profile -> profile.verified() && profile.status() == UserApi.Status.ACTIVE)
                .isPresent();
    }
}
