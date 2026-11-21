package io.edition.control.compositions.hosting.readersecurity;

import io.edition.concepts.customdomain.api.CustomDomainApi;
import io.edition.concepts.password.api.PasswordApi;
import io.edition.concepts.readersecurity.api.ReaderStateApi;
import io.edition.concepts.site.api.SiteApi;
import io.edition.concepts.tenantregistry.api.TenantRegistryApi;
import io.edition.concepts.tenantregistry.api.TenantScopeApi;
import io.edition.concepts.user.api.UserApi;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
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
    private final ReaderHistoryPages historyPages;

    ReaderCommands(
            CustomDomainApi domains,
            SiteApi sites,
            TenantScopeApi scope,
            UserApi users,
            PasswordApi passwords,
            ReaderStateApi state,
            ReaderHistoryPages historyPages) {
        this.domains = domains;
        this.sites = sites;
        this.scope = scope;
        this.users = users;
        this.passwords = passwords;
        this.state = state;
        this.historyPages = historyPages;
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

    public boolean authenticated(String host, String proof) {
        return authorized(host, ReaderStateApi.Proof.ACCESS, proof).isPresent();
    }

    public Optional<List<History>> history(String host, String proof) {
        return authorized(host, ReaderStateApi.Proof.ACCESS, proof).map(session -> {
            var recent = state.history(session.site(), session.user());
            if (recent.isEmpty()) return List.of();
            var pages = historyPages
                    .lookup(
                            session.site(),
                            proof,
                            null,
                            recent.stream().map(ReaderStateApi.History::pageId).toList())
                    .stream()
                    .collect(Collectors.toMap(ReaderHistoryPages.Page::pageId, Function.identity()));
            var visible = new java.util.ArrayList<History>();
            for (var row : recent) {
                var current = pages.get(row.pageId());
                if (current != null && current.spaceId().equals(row.spaceId())) {
                    visible.add(new History(current.slug(), current.path(), row.viewedAt()));
                }
            }
            return List.copyOf(visible);
        });
    }

    public boolean visit(String host, String proof, String path) {
        var session = authorized(host, ReaderStateApi.Proof.ACCESS, proof);
        session.ifPresent(value -> historyPages.lookup(value.site(), proof, path, List.of()).stream()
                .findFirst()
                .ifPresent(page -> state.visit(value.site(), value.user(), page.spaceId(), page.pageId())));
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
