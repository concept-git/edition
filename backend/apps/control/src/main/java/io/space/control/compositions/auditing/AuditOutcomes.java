package io.space.control.compositions.auditing;

import io.space.concepts.apitoken.api.ApiTokenApi;
import io.space.concepts.collection.api.CollectionApi;
import io.space.concepts.customdomain.api.CustomDomainApi;
import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.page.api.PageApi;
import io.space.concepts.password.api.PasswordApi;
import io.space.concepts.permission.api.PermissionApi;
import io.space.concepts.redirect.api.RedirectApi;
import io.space.concepts.release.api.ReleaseApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.site.api.SiteApi;
import io.space.concepts.space.api.SpaceApi;
import io.space.concepts.tag.api.TagApi;
import io.space.concepts.team.api.TeamApi;
import io.space.concepts.toc.api.TocApi;
import io.space.concepts.user.api.UserApi;

/** Finite outcomes follow typed concept cases. Adding a sealed case requires an explicit mapping. */
final class AuditOutcomes {
    private AuditOutcomes() {}

    static String of(String action, Object result) {
        return switch (result) {
            case null -> "ok";
            case io.space.concepts.managementtoken.api.ManagementTokenApi.IssueResult outcome ->
                switch (outcome) {
                    case io.space.concepts.managementtoken.api.ManagementTokenApi.IssueResult.Issued ignored -> "ok";
                    case io.space.concepts.managementtoken.api.ManagementTokenApi.IssueResult.InvalidScope ignored ->
                        "invalid_token_scope";
                    case io.space.concepts.managementtoken.api.ManagementTokenApi.IssueResult.InvalidExpiry ignored ->
                        "invalid_token_expiry";
                };
            case CollectionApi.CreateResult outcome ->
                switch (outcome) {
                    case CollectionApi.CreateResult.Created value -> "ok";
                    case CollectionApi.CreateResult.DepthExceeded value -> "depth_exceeded";
                    case CollectionApi.CreateResult.PositionInvalid value -> "position_invalid";
                    case CollectionApi.CreateResult.NameTaken value -> "name_taken";
                    case CollectionApi.CreateResult.ParentNotFound value -> "parent_not_found";
                    case CollectionApi.CreateResult.Invalid value -> "invalid";
                };
            case CollectionApi.RenameResult outcome ->
                switch (outcome) {
                    case CollectionApi.RenameResult.Renamed value -> "ok";
                    case CollectionApi.RenameResult.NameTaken value -> "name_taken";
                    case CollectionApi.RenameResult.NotFound value -> "not_found";
                    case CollectionApi.RenameResult.Invalid value -> "invalid";
                };
            case CollectionApi.SetIconResult outcome ->
                switch (outcome) {
                    case CollectionApi.SetIconResult.Changed value -> "ok";
                    case CollectionApi.SetIconResult.NotFound value -> "not_found";
                    case CollectionApi.SetIconResult.Invalid value -> "invalid";
                };
            case CollectionApi.MoveResult outcome ->
                switch (outcome) {
                    case CollectionApi.MoveResult.Moved value -> "ok";
                    case CollectionApi.MoveResult.DepthExceeded value -> "depth_exceeded";
                    case CollectionApi.MoveResult.CycleDetected value -> "cycle_detected";
                    case CollectionApi.MoveResult.PositionInvalid value -> "position_invalid";
                    case CollectionApi.MoveResult.NameTaken value -> "name_taken";
                    case CollectionApi.MoveResult.NotFound value -> "not_found";
                };
            case CollectionApi.PlaceResult outcome ->
                switch (outcome) {
                    case CollectionApi.PlaceResult.Placed value -> "ok";
                    case CollectionApi.PlaceResult.PositionInvalid value -> "position_invalid";
                    case CollectionApi.PlaceResult.NotFound value -> "not_found";
                };
            case CollectionApi.UnplaceResult outcome ->
                switch (outcome) {
                    case CollectionApi.UnplaceResult.Unplaced value -> "ok";
                };
            case CollectionApi.RemoveResult outcome ->
                switch (outcome) {
                    case CollectionApi.RemoveResult.Removed value -> "ok";
                    case CollectionApi.RemoveResult.NotEmpty value -> "collection_not_empty";
                    case CollectionApi.RemoveResult.NotFound value -> "not_found";
                };
            case PageApi.CreateContentResult outcome ->
                switch (outcome) {
                    case PageApi.CreateContentResult.Created value -> "ok";
                    case PageApi.CreateContentResult.InvalidTitle value -> "page_title_invalid";
                    case PageApi.CreateContentResult.IdTaken value -> "id_taken";
                    case PageApi.CreateContentResult.ContentTooLarge value -> "page_content_too_large";
                    case PageApi.CreateContentResult.Invalid value -> "invalid";
                };
            case PageApi.CreateResult outcome ->
                switch (outcome) {
                    case PageApi.CreateResult.Created value -> "ok";
                    case PageApi.CreateResult.InvalidTitle value -> "page_title_invalid";
                    case PageApi.CreateResult.IdTaken value -> "id_taken";
                };
            case PageApi.EditResult outcome ->
                switch (outcome) {
                    case PageApi.EditResult.Edited value -> "ok";
                    case PageApi.EditResult.Conflict value -> "conflict";
                    case PageApi.EditResult.NotFound value -> "page_not_found";
                    case PageApi.EditResult.ContentTooLarge value -> "page_content_too_large";
                };
            case PageApi.MutationResult outcome ->
                switch (outcome) {
                    case PageApi.MutationResult.Changed value -> "ok";
                    case PageApi.MutationResult.NotFound value -> "page_not_found";
                    case PageApi.MutationResult.InvalidTitle value -> "page_title_invalid";
                };
            case PageApi.MetadataResult outcome ->
                switch (outcome) {
                    case PageApi.MetadataResult.Changed value -> "ok";
                    case PageApi.MetadataResult.NotFound value -> "page_not_found";
                    case PageApi.MetadataResult.Invalid value -> "invalid";
                };
            case PageApi.AttachResult outcome ->
                switch (outcome) {
                    case PageApi.AttachResult.Attached value -> "ok";
                    case PageApi.AttachResult.NotFound value -> "page_not_found";
                    case PageApi.AttachResult.FileTooLarge value -> "file_too_large";
                    case PageApi.AttachResult.FileTypeUnsupported value -> "file_type_unsupported";
                    case PageApi.AttachResult.TooManyAttachments value -> "too_many_attachments";
                    case PageApi.AttachResult.Invalid value -> "invalid";
                };
            case SpaceApi.LookupResult outcome ->
                switch (outcome) {
                    case SpaceApi.LookupResult.Found value -> "ok";
                    case SpaceApi.LookupResult.NotFound value -> "space_not_found";
                };
            case SpaceApi.MutationResult outcome ->
                switch (outcome) {
                    case SpaceApi.MutationResult.Changed value -> "ok";
                    case SpaceApi.MutationResult.NotFound value -> "space_not_found";
                    case SpaceApi.MutationResult.Archived value -> "space_archived";
                };
            case SpaceApi.PlacementResult outcome ->
                switch (outcome) {
                    case SpaceApi.PlacementResult.Placed value -> "ok";
                    case SpaceApi.PlacementResult.SpaceNotFound value -> "space_not_found";
                    case SpaceApi.PlacementResult.SpaceArchived value -> "space_archived";
                    case SpaceApi.PlacementResult.SlugInvalid value -> "slug_invalid";
                    case SpaceApi.PlacementResult.SlugTaken value -> "slug_taken";
                    case SpaceApi.PlacementResult.ItemAlreadyPlaced value -> "item_already_placed";
                    case SpaceApi.PlacementResult.ItemNotInSpace value -> "item_not_in_space";
                };
            case SpaceApi.TransferResult outcome ->
                switch (outcome) {
                    case SpaceApi.TransferResult.Transferred value -> "ok";
                    case SpaceApi.TransferResult.SpaceNotFound value -> "space_not_found";
                    case SpaceApi.TransferResult.SpaceArchived value -> "space_archived";
                    case SpaceApi.TransferResult.SlugInvalid value -> "slug_invalid";
                    case SpaceApi.TransferResult.SlugTaken value -> "slug_taken";
                    case SpaceApi.TransferResult.ItemNotPlaced value -> "item_not_placed";
                    case SpaceApi.TransferResult.SameSpace value -> "same_space";
                };
            case TagApi.TagResult outcome ->
                switch (outcome) {
                    case TagApi.TagResult.Tagged value -> "ok";
                    case TagApi.TagResult.TooMany value -> "too_many";
                    case TagApi.TagResult.Invalid value -> "invalid";
                };
            case TagApi.UntagResult outcome ->
                switch (outcome) {
                    case TagApi.UntagResult.Untagged value -> "ok";
                    case TagApi.UntagResult.Invalid value -> "invalid";
                };
            case TagApi.RenameResult outcome ->
                switch (outcome) {
                    case TagApi.RenameResult.Renamed value -> "ok";
                    case TagApi.RenameResult.NotFound value -> "not_found";
                    case TagApi.RenameResult.Invalid value -> "invalid";
                };
            case TocApi.AddResult outcome ->
                switch (outcome) {
                    case TocApi.AddResult.Added value -> "ok";
                    case TocApi.AddResult.DepthExceeded value -> "depth_exceeded";
                    case TocApi.AddResult.PositionInvalid value -> "position_invalid";
                    case TocApi.AddResult.ParentNotFound value -> "parent_not_found";
                    case TocApi.AddResult.Invalid value -> "invalid";
                };
            case TocApi.MoveResult outcome ->
                switch (outcome) {
                    case TocApi.MoveResult.Moved value -> "ok";
                    case TocApi.MoveResult.DepthExceeded value -> "depth_exceeded";
                    case TocApi.MoveResult.CycleDetected value -> "cycle_detected";
                    case TocApi.MoveResult.PositionInvalid value -> "position_invalid";
                    case TocApi.MoveResult.NotFound value -> "not_found";
                };
            case TocApi.RelabelResult outcome ->
                switch (outcome) {
                    case TocApi.RelabelResult.Relabeled value -> "ok";
                    case TocApi.RelabelResult.NotFound value -> "not_found";
                    case TocApi.RelabelResult.Invalid value -> "invalid";
                };
            case TocApi.RemoveResult outcome ->
                switch (outcome) {
                    case TocApi.RemoveResult.Removed value -> "ok";
                    case TocApi.RemoveResult.NotFound value -> "not_found";
                };
            case TocApi.ReplaceResult outcome ->
                switch (outcome) {
                    case TocApi.ReplaceResult.Replaced value -> "ok";
                    case TocApi.ReplaceResult.DepthExceeded value -> "depth_exceeded";
                    case TocApi.ReplaceResult.Invalid value -> "invalid";
                };
            case CustomDomainApi.BindResult outcome ->
                switch (outcome) {
                    case CustomDomainApi.BindResult.Bound value -> "ok";
                    case CustomDomainApi.BindResult.Taken value -> "domain_taken";
                    case CustomDomainApi.BindResult.HostInvalid value -> "host_invalid";
                };
            case CustomDomainApi.VerifyResult outcome ->
                switch (outcome) {
                    case CustomDomainApi.VerifyResult.Verified value -> "ok";
                    case CustomDomainApi.VerifyResult.NotFound value -> "not_found";
                    case CustomDomainApi.VerifyResult.NotProven value -> "not_proven";
                    case CustomDomainApi.VerifyResult.HostInvalid value -> "host_invalid";
                };
            case CustomDomainApi.SetPrimaryResult outcome ->
                switch (outcome) {
                    case CustomDomainApi.SetPrimaryResult.Changed value -> "ok";
                    case CustomDomainApi.SetPrimaryResult.NotFound value -> "not_found";
                    case CustomDomainApi.SetPrimaryResult.NotVerified value -> "not_verified";
                    case CustomDomainApi.SetPrimaryResult.HostInvalid value -> "host_invalid";
                };
            case CustomDomainApi.UnbindResult outcome ->
                switch (outcome) {
                    case CustomDomainApi.UnbindResult.Unbound value -> "ok";
                    case CustomDomainApi.UnbindResult.HostInvalid value -> "host_invalid";
                };
            case RedirectApi.RegisterResult outcome ->
                switch (outcome) {
                    case RedirectApi.RegisterResult.Registered value -> "ok";
                    case RedirectApi.RegisterResult.PathInvalid value -> "path_invalid";
                };
            case SiteApi.MutationResult outcome ->
                switch (outcome) {
                    case SiteApi.MutationResult.Changed value -> "ok";
                    case SiteApi.MutationResult.NotFound value -> "site_not_found";
                    case SiteApi.MutationResult.HomeNotMounted value -> "home_not_mounted";
                    case SiteApi.MutationResult.OrderInvalid value -> "order_invalid";
                    case SiteApi.MutationResult.InvalidRule value -> "invalid_rule";
                    case SiteApi.MutationResult.InvalidTitleTemplate value -> "title_template_invalid";
                };
            case SiteApi.MountResult outcome ->
                switch (outcome) {
                    case SiteApi.MountResult.Mounted value -> "ok";
                    case SiteApi.MountResult.NotFound value -> "site_not_found";
                    case SiteApi.MountResult.SlugTaken value -> "slug_taken";
                    case SiteApi.MountResult.SlugInvalid value -> "slug_invalid";
                    case SiteApi.MountResult.TargetAlreadyMounted value -> "target_already_mounted";
                    case SiteApi.MountResult.MountMissing value -> "mount_not_found";
                };
            case SiteApi.DeleteResult outcome ->
                switch (outcome) {
                    case SiteApi.DeleteResult.Deleted value -> "ok";
                    case SiteApi.DeleteResult.NotFound value -> "site_not_found";
                    case SiteApi.DeleteResult.NotEmpty value -> "site_not_empty";
                };
            case ApiTokenApi.IssueResult outcome ->
                switch (outcome) {
                    case ApiTokenApi.IssueResult.Issued value -> "ok";
                    case ApiTokenApi.IssueResult.InvalidScope value -> "invalid_scope";
                    case ApiTokenApi.IssueResult.InvalidExpiry value -> "invalid_expiry";
                };
            case MembershipApi.AddResult outcome ->
                switch (outcome) {
                    case MembershipApi.AddResult.Added value -> "ok";
                    case MembershipApi.AddResult.AlreadyMember value -> "already_member";
                };
            case MembershipApi.RemoveResult outcome ->
                switch (outcome) {
                    case MembershipApi.RemoveResult.Removed value -> "ok";
                    case MembershipApi.RemoveResult.LastOwner value -> "last_owner";
                };
            case MembershipApi.SetRoleResult outcome ->
                switch (outcome) {
                    case MembershipApi.SetRoleResult.RoleSet value -> "ok";
                    case MembershipApi.SetRoleResult.NotMember value -> "not_member";
                    case MembershipApi.SetRoleResult.LastOwner value -> "last_owner";
                };
            case MembershipApi.AcceptResult outcome ->
                switch (outcome) {
                    case MembershipApi.AcceptResult.Accepted value -> "ok";
                    case MembershipApi.AcceptResult.Invalid value -> "invalid";
                    case MembershipApi.AcceptResult.Expired value -> "expired";
                    case MembershipApi.AcceptResult.AlreadyMember value -> "already_member";
                };
            case PasswordApi.SetResult outcome ->
                switch (outcome) {
                    case PasswordApi.SetResult.Ok value -> "ok";
                    case PasswordApi.SetResult.TooWeak value -> "too_weak";
                };
            case PasswordApi.AuthenticateResult outcome ->
                switch (outcome) {
                    case PasswordApi.AuthenticateResult.Authenticated value -> "ok";
                    case PasswordApi.AuthenticateResult.Rejected value ->
                        switch (value.reason()) {
                            case BAD_PASSWORD -> "bad_password";
                            case LOCKED -> "locked";
                        };
                };
            case PasswordApi.ChangeResult outcome ->
                switch (outcome) {
                    case PasswordApi.ChangeResult.Ok value -> "ok";
                    case PasswordApi.ChangeResult.BadPassword value -> "bad_password";
                    case PasswordApi.ChangeResult.Locked value -> "locked";
                    case PasswordApi.ChangeResult.TooWeak value -> "too_weak";
                };
            case PasswordApi.ResetResult outcome ->
                switch (outcome) {
                    case PasswordApi.ResetResult.Ok value -> "ok";
                    case PasswordApi.ResetResult.TokenInvalid value -> "token_invalid";
                    case PasswordApi.ResetResult.TooWeak value -> "too_weak";
                };
            case PermissionApi.RestrictResult outcome ->
                switch (outcome) {
                    case PermissionApi.RestrictResult.Restricted value -> "ok";
                    case PermissionApi.RestrictResult.Conflict value -> "conflict";
                };
            case PermissionApi.UnrestrictResult outcome ->
                switch (outcome) {
                    case PermissionApi.UnrestrictResult.Unrestricted value -> "ok";
                    case PermissionApi.UnrestrictResult.Conflict value -> "conflict";
                };
            case SessionApi.StartResult outcome ->
                switch (outcome) {
                    case SessionApi.StartResult.Started value -> "ok";
                };
            case SessionApi.RenewResult outcome ->
                switch (outcome) {
                    case SessionApi.RenewResult.Renewed value -> "ok";
                    case SessionApi.RenewResult.Rejected value ->
                        switch (value.reason()) {
                            case INVALID -> "invalid";
                            case EXPIRED -> "expired";
                            case CONCURRENT_REUSE -> "concurrent_reuse";
                            case REPLAYED -> "replayed";
                        };
                };
            case TeamApi.CreateResult outcome ->
                switch (outcome) {
                    case TeamApi.CreateResult.Created value -> "ok";
                    case TeamApi.CreateResult.InvalidName value -> "team_name_invalid";
                    case TeamApi.CreateResult.NameTaken value -> "team_name_taken";
                };
            case TeamApi.RenameResult outcome ->
                switch (outcome) {
                    case TeamApi.RenameResult.Renamed value -> "ok";
                    case TeamApi.RenameResult.NotFound value -> "team_not_found";
                    case TeamApi.RenameResult.InvalidName value -> "team_name_invalid";
                    case TeamApi.RenameResult.NameTaken value -> "team_name_taken";
                };
            case TeamApi.DeleteResult outcome ->
                switch (outcome) {
                    case TeamApi.DeleteResult.Deleted value -> "ok";
                    case TeamApi.DeleteResult.NotFound value -> "team_not_found";
                };
            case UserApi.RegisterResult outcome ->
                switch (outcome) {
                    case UserApi.RegisterResult.Registered value -> "ok";
                    case UserApi.RegisterResult.EmailTaken value -> "email_taken";
                };
            case UserApi.VerifyResult outcome ->
                switch (outcome) {
                    case UserApi.VerifyResult.Verified value -> "ok";
                    case UserApi.VerifyResult.Rejected value -> "token_invalid";
                };
            case UserApi.LifecycleResult outcome ->
                switch (outcome) {
                    case UserApi.LifecycleResult.Ok value -> "ok";
                    case UserApi.LifecycleResult.NotFound value -> "user_not_found";
                    case UserApi.LifecycleResult.Erased value -> "user_erased";
                };
            case UserApi.EraseResult outcome ->
                switch (outcome) {
                    case UserApi.EraseResult.Ok value -> "ok";
                    case UserApi.EraseResult.NotFound value -> "user_not_found";
                    case UserApi.EraseResult.MustBeDeactivated value -> "user_must_be_deactivated";
                };
            case UserApi.UpdateProfileResult outcome ->
                switch (outcome) {
                    case UserApi.UpdateProfileResult.Updated value -> "ok";
                    case UserApi.UpdateProfileResult.Rejected value -> "invalid_profile";
                };
            case ReleaseApi.LoadResult outcome ->
                switch (outcome) {
                    case ReleaseApi.LoadResult.Loaded value -> "ok";
                    case ReleaseApi.LoadResult.InvalidBundle value -> "invalid_bundle";
                    case ReleaseApi.LoadResult.NotFound value -> "not_found";
                };
            case ReleaseApi.ValidateResult outcome ->
                switch (outcome) {
                    case ReleaseApi.ValidateResult.Ok value -> "ok";
                    case ReleaseApi.ValidateResult.Warnings value -> "warnings";
                    case ReleaseApi.ValidateResult.Errors value -> "errors";
                    case ReleaseApi.ValidateResult.NotFound value -> "not_found";
                };
            case ReleaseApi.MutationResult outcome ->
                switch (outcome) {
                    case ReleaseApi.MutationResult.Changed value -> "ok";
                    case ReleaseApi.MutationResult.NotFound value -> "not_found";
                };
            case java.util.Optional<?> value ->
                value.isPresent()
                        ? "ok"
                        : action.equals("User.requestVerification")
                                ? "unchanged"
                                : action.startsWith("Page.") ? "page_not_found" : "unchanged";
            case Boolean value ->
                value
                        ? "ok"
                        : action.equals("Page.purge")
                                ? "not_purged"
                                : action.equals("Space.delete")
                                        ? "space_not_archived"
                                        : action.equals("Release.pin") ? "not_pinned" : "unchanged";
            default -> "ok"; // Non-sealed successful value objects and collection results.
        };
    }
}
