package io.edition.control.usecases.auditing;

import io.edition.control.modules.apitoken.api.ApiTokenApi;
import io.edition.control.modules.collection.api.CollectionApi;
import io.edition.control.modules.membership.api.MembershipApi;
import io.edition.control.modules.page.api.PageApi;
import io.edition.control.modules.password.api.PasswordApi;
import io.edition.control.modules.permission.api.PermissionApi;
import io.edition.control.modules.redirect.api.RedirectApi;
import io.edition.control.modules.release.api.ReleaseApi;
import io.edition.control.modules.revision.api.RevisionApi;
import io.edition.control.modules.search.api.SearchApi;
import io.edition.control.modules.session.api.SessionApi;
import io.edition.control.modules.site.api.SiteApi;
import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.modules.tag.api.TagApi;
import io.edition.control.modules.team.api.TeamApi;
import io.edition.control.modules.toc.api.TocApi;
import io.edition.control.modules.user.api.UserApi;
import java.util.Locale;
import java.util.UUID;

/** Explicit public-action identity mapping; input secrets and unrelated UUIDs are never inspected. */
final class AuditTargets {
    private AuditTargets() {}

    record Target(String type, UUID id) {}

    static Target of(String action, Object[] args, Object result) {
        String concept = action.substring(0, action.indexOf('.'));
        String method = action.substring(action.indexOf('.') + 1);
        return switch (concept) {
            case "User" ->
                new Target(
                        "user",
                        method.equals("register")
                                ? result instanceof UserApi.RegisterResult.Registered value
                                        ? value.user().value()
                                        : null
                                : ((UserApi.UserId) args[0]).value());
            case "Password" ->
                new Target(
                        "user",
                        method.equals("reset")
                                ? result instanceof PasswordApi.ResetResult.Ok value
                                        ? value.user().value()
                                        : null
                                : ((PasswordApi.AccountId) args[0]).value());
            case "Session" -> session(method, args, result);
            case "ManagementToken" ->
                new Target(
                        "management_token",
                        method.equals("issue")
                                ? result
                                                instanceof
                                                io.edition.control.modules.managementtoken.api.ManagementTokenApi
                                                                .IssueResult.Issued
                                                        value
                                        ? value.metadata().id()
                                        : null
                                : (UUID) args[0]);
            case "ApiToken" ->
                new Target(
                        "apitoken",
                        method.equals("issue")
                                ? result instanceof ApiTokenApi.IssueResult.Issued value
                                        ? value.metadata().id().value()
                                        : null
                                : ((ApiTokenApi.TokenId) args[0]).value());
            case "Membership" -> membership(method, args, result);
            case "Team" ->
                new Target(
                        "team",
                        method.equals("create")
                                ? result instanceof TeamApi.CreateResult.Created value
                                        ? value.team().id().value()
                                        : null
                                : ((TeamApi.TeamId) args[0]).value());
            case "Permission" -> permission(method, args);
            case "Page" ->
                new Target(
                        "page",
                        method.equals("create") ? createdPage(args, result) : ((PageApi.PageId) args[0]).value());
            case "Revision" -> new Target("revision_item", ((RevisionApi.ItemId) args[0]).value());
            case "Space" -> space(method, args, result);
            case "Collection" -> collection(method, args, result);
            case "Toc" -> toc(method, args, result);
            case "Tag" ->
                method.equals("rename")
                        ? new Target("tag", null)
                        : new Target("tagged_item", ((TagApi.ItemId) args[0]).value());
            case "Release" ->
                switch (method) {
                    case "draft" -> new Target("release", ((ReleaseApi.View) result).id());
                    case "prune", "setRetention", "terminateScope" ->
                        new Target("release_scope", ((ReleaseApi.ScopeId) args[0]).value());
                    default -> new Target("release", ((ReleaseApi.ReleaseId) args[0]).value());
                };
            case "Site" ->
                new Target(
                        "site",
                        method.equals("create") ? ((SiteApi.View) result).id() : ((SiteApi.SiteId) args[1]).value());
            // These identities are a Host and (Scope,Path), not the UUID of their destination.
            case "CustomDomain" -> new Target("customdomain", null);
            case "Redirect" -> new Target("redirect_scope", ((RedirectApi.ScopeId) args[0]).value());
            case "Search" -> new Target("search_scope", ((SearchApi.ScopeId) args[0]).value());
            // A failed request may not have resolved a resource. Never infer one from positional UUIDs.
            case "Requesting" -> new Target("request", null);
            default -> throw new IllegalStateException("missing audit identity contract: " + action);
        };
    }

    private static Target session(String method, Object[] args, Object result) {
        return switch (method) {
            case "start" ->
                new Target(
                        "session",
                        ((SessionApi.StartResult.Started) result)
                                .credentials()
                                .session()
                                .value());
            case "renew" ->
                new Target(
                        "session",
                        result instanceof SessionApi.RenewResult.Renewed value
                                ? value.credentials().session().value()
                                : null);
            case "endAll", "eraseAll" -> new Target("principal", ((SessionApi.HolderId) args[0]).value());
            case "endByRefresh" -> new Target("session", null);
            default -> new Target("session", ((SessionApi.SessionId) args[0]).value());
        };
    }

    private static Target membership(String method, Object[] args, Object result) {
        return switch (method) {
            case "invite" ->
                new Target(
                        "invitation",
                        ((MembershipApi.Invited) result).invite().id().value());
            case "revokeInvite" -> new Target("invitation", ((MembershipApi.InviteId) args[1]).value());
            case "revokeInvitesFor" -> new Target("invitation", null);
            case "accept" -> {
                MembershipApi.Group group =
                        switch ((MembershipApi.AcceptResult) result) {
                            case MembershipApi.AcceptResult.Accepted value -> value.group();
                            case MembershipApi.AcceptResult.AlreadyMember value -> value.group();
                            case MembershipApi.AcceptResult.Invalid ignored -> null;
                            case MembershipApi.AcceptResult.Expired ignored -> null;
                        };
                yield group == null ? new Target("membership", null) : group(group);
            }
            default -> group((MembershipApi.Group) args[0]);
        };
    }

    private static Target group(MembershipApi.Group group) {
        return new Target(group.type().name().toLowerCase(Locale.ROOT), group.id());
    }

    private static Target permission(String method, Object[] args) {
        if (method.equals("defineRole")) return new Target("permission_role", null);
        if (method.equals("clearPrincipal")) {
            var principal = (PermissionApi.Principal) args[0];
            return new Target(principal.type().value(), principal.id());
        }
        var resource = (PermissionApi.Resource) args[0];
        return new Target(resource.type().value(), resource.id());
    }

    private static UUID createdPage(Object[] args, Object result) {
        if (args.length >= 4 && args[3] instanceof PageApi.PageId id) return id.value();
        if (result instanceof PageApi.CreateResult.Created value)
            return value.page().id();
        if (result instanceof PageApi.CreateContentResult.Created value)
            return value.page().id();
        return null;
    }

    private static Target space(String method, Object[] args, Object result) {
        return switch (method) {
            case "create" -> new Target("space", ((SpaceApi.View) result).id());
            case "unplace" -> new Target("item", (UUID) args[0]);
            case "place", "reslug", "delete" -> new Target("space", ((SpaceApi.SpaceId) args[0]).value());
            default -> new Target("space", ((SpaceApi.SpaceId) args[1]).value());
        };
    }

    private static Target collection(String method, Object[] args, Object result) {
        return switch (method) {
            case "create" ->
                new Target(
                        "collection",
                        result instanceof CollectionApi.CreateResult.Created value
                                ? value.collection().id()
                                : null);
            case "place" -> new Target("collection", ((CollectionApi.CollectionId) args[1]).value());
            case "unplace" -> new Target("item", (UUID) args[0]);
            default -> new Target("collection", ((CollectionApi.CollectionId) args[0]).value());
        };
    }

    private static Target toc(String method, Object[] args, Object result) {
        return switch (method) {
            case "addEntry" ->
                new Target(
                        "toc_entry",
                        result instanceof TocApi.AddResult.Added value
                                ? value.entry().id()
                                : null);
            case "replace" -> new Target("toc", ((TocApi.TocId) args[0]).spaceId());
            default -> new Target("toc_entry", ((TocApi.EntryId) args[0]).value());
        };
    }
}
