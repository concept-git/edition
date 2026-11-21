package io.edition.control.compositions.access;

import java.util.Map;
import java.util.Set;

/** Explicit handler inventory: new HTTP actions must register their management capability. */
public final class ManagementCapabilities {
    private static final Map<String, Set<String>> HANDLERS = Map.ofEntries(
            handlers("AccountController", "me,update,sessions,end"),
            handlers("InvitationController", "preview,accept"),
            handlers("CollectionController", "view,create,patch,remove,move,place,unplace"),
            handlers(
                    "TeamController",
                    "create,list,view,rename,delete,members,setRole,removeMember,invitations,invite,revoke"),
            handlers("TenantMemberController", "members,setRole,remove,invites,invite,revoke"),
            handlers("AttachmentBrowsingController", "list"),
            handlers(
                    "PageController",
                    "list,listTrash,create,preview,view,content,batchGet,publishBatch,unpublishBatch,rename,edit,revisions,revision,diff,revert,trash,restore,reslug,transfer,publish,unpublish,setSeo,setIcon,setProperty,removeProperty,attach,viewAttachment,detach,tag,untag,downloadAttachment"),
            handlers("PagePermissionController", "view,putRestriction,deleteRestriction,effective"),
            handlers("SitePermissionController", "list,users,teams,putGrant,deleteGrant,effective"),
            handlers("SpacePermissionController", "list,users,teams,pages,putGrant,deleteGrant"),
            handlers("AdminTenantController", "provision,list,suspend,resume"),
            handlers("AdminUserController", "search,detail,deactivate,reactivate,erase"),
            handlers("CertificateController", "certificate"),
            handlers("MailJobsController", "list,retry"),
            handlers(
                    "OperationsController",
                    "capabilities,retryStorage,storage,audit,jobs,retry,purge,export,exportStatus,exportContent"),
            handlers("SearchOperationsController", "configuration,configure,reindex"),
            handlers("ServiceHealthController", "platformHealth"),
            handlers("StatsController", "tenant,space,traffic,search"),
            handlers("WebhookController", "list,create,update,rotate,deliveries,redeliver"),
            handlers("BundleExportController", "create,list,view,retry,download"),
            handlers(
                    "ImportController",
                    "importZip,importStored,startImportUpload,viewImportJob,approveRelease,viewDrift,listPreviewPages,previewRelease"),
            handlers("ReleaseController", "build,list,diff,view,discard,rollback,promote,patch,retention"),
            handlers("TenantReleaseController", "list"),
            handlers("DeliveryStatusController", "status,retry"),
            handlers("DomainController", "bind,view,verify,setPrimary,unbind"),
            handlers("RedirectController", "list,create,delete"),
            handlers("SiteController", "create,list,view,update,mount,remount,unmount,reorder"),
            handlers("TenantDomainController", "list"),
            handlers("SpaceController", "create,list,view,mounts,update,archive,restore,convert"),
            handlers("TerminationController", "space,site,list,retry,planSpace,planSite"),
            handlers("AvailabilityController", "health,readiness"),
            handlers("TagController", "list,pages,rename"),
            handlers("TocController", "view,add,relabel,move,remove"),
            handlers("ApiTokenController", "list,revoke"),
            handlers("ManagementTokenController", "context"),
            handlers("ContentTypeController", "list,versions,view,register,activate,deactivate"),
            handlers(
                    "ContentPluginController",
                    "catalog,list,view,create,save,delete,compile,candidates,candidate,verify,verifications,verification"));

    private static Map.Entry<String, Set<String>> handlers(String type, String methods) {
        return Map.entry(type, Set.of(methods.split(",")));
    }

    private ManagementCapabilities() {}

    public static boolean permits(
            io.edition.control.compositions.principal.PrincipalResolver.Resolution resolution, String scope) {
        return resolution
                .managementCredential()
                .map(c -> c.scopes().contains(scope))
                .orElse(true);
    }

    public static <E extends Enum<E>> Set<E> effective(
            io.edition.control.compositions.principal.PrincipalResolver.Resolution resolution,
            Set<E> actions,
            String family) {
        return actions.stream()
                .filter(action -> {
                    String name = action.name();
                    String scope = name.equals("MANAGE_PERMISSIONS")
                            ? "permissions:write"
                            : family + ":"
                                    + (name.equals("READ")
                                            ? "read"
                                            : Set.of(
                                                                    "PUBLISH",
                                                                    "UNPUBLISH",
                                                                    "BUILD",
                                                                    "IMPORT",
                                                                    "APPROVE",
                                                                    "DISCARD",
                                                                    "PROMOTE",
                                                                    "ROLLBACK",
                                                                    "EXPORT")
                                                            .contains(name)
                                                    ? "publish"
                                                    : "write");
                    return permits(resolution, scope);
                })
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
    }

    public static boolean registered(String type, String method) {
        return HANDLERS.getOrDefault(type, Set.of()).contains(method);
    }

    public static boolean readOnly(String type, String method, String httpMethod) {
        return httpMethod.equals("GET")
                || httpMethod.equals("HEAD")
                || type.equals("PageController")
                        && Set.of("preview", "batchGet").contains(method);
    }

    public static String requiredScope(String type, String method, String httpMethod) {
        if (!registered(type, method)) return null;
        if (type.equals("ManagementTokenController") || type.equals("AvailabilityController")) return "";
        String action = readOnly(type, method, httpMethod) ? "read" : "write";
        if (type.equals("PageController")
                && Set.of("publish", "unpublish", "publishBatch", "unpublishBatch")
                        .contains(method)) action = "publish";
        if (type.equals("ReleaseController")
                && Set.of("build", "discard", "rollback", "promote").contains(method)) action = "publish";
        if (type.equals("ImportController")
                && Set.of("importZip", "importStored", "startImportUpload", "approveRelease")
                        .contains(method)) action = "publish";
        if (type.equals("BundleExportController") && Set.of("create", "retry").contains(method)) action = "publish";
        if (type.equals("OperationsController")
                && Set.of("audit", "export", "exportStatus", "exportContent").contains(method)) return "audit:read";
        if (type.equals("TerminationController"))
            return Set.of("site", "planSite").contains(method)
                    ? "hosting:write"
                    : Set.of("space", "planSpace").contains(method) ? "content:write" : "operations:" + action;
        if (type.equals("StatsController"))
            return Set.of("traffic", "search").contains(method) ? "hosting:read" : "content:read";
        if (type.equals("AdminUserController") && method.equals("erase")) return "platform:erase";
        String family =
                switch (type) {
                    case "AccountController" -> "account";
                    case "InvitationController", "TeamController", "TenantMemberController" -> "members";
                    case "PagePermissionController",
                            "SitePermissionController",
                            "SpacePermissionController",
                            "ApiTokenController" -> "permissions";
                    case "AdminTenantController", "AdminUserController", "ServiceHealthController" -> "platform";
                    case "OperationsController", "MailJobsController" -> "operations";
                    case "SearchOperationsController" -> method.equals("reindex") ? "operations" : "hosting";
                    case "CertificateController",
                            "WebhookController",
                            "DeliveryStatusController",
                            "DomainController",
                            "RedirectController",
                            "SiteController",
                            "TenantDomainController" -> "hosting";
                    default -> "content";
                };
        return family + ":" + action;
    }
}
