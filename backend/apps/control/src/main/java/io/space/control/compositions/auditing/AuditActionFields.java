package io.space.control.compositions.auditing;

import io.space.concepts.audit.api.AuditApi;
import io.space.control.compositions.RequestAuditContext;
import java.lang.reflect.Method;
import java.util.*;

/** Identity-only extraction. Never serializes method arguments, results or exception messages. */
final class AuditActionFields {
    // Module identity survives physical package moves; platform effects belong to operational flows.
    private static final ClassValue<Boolean> PRODUCT_CONCEPT = new ClassValue<>() {
        @Override
        protected Boolean computeValue(Class<?> type) {
            String prefix = "io.space.concepts.";
            String name = type.getName();
            if (!name.startsWith(prefix)) return false;
            String root = prefix + name.substring(prefix.length()).split("\\.")[0];
            try {
                var module = Class.forName(root + ".package-info", false, type.getClassLoader())
                        .getPackage()
                        .getAnnotation(org.springframework.modulith.ApplicationModule.class);
                if (module == null) throw new IllegalStateException("missing concept module identity: " + root);
                return module.id().startsWith("concepts.");
            } catch (ClassNotFoundException failure) {
                throw new IllegalStateException("missing concept module identity: " + root, failure);
            }
        }
    };
    private static final Set<String> ACTIONS = Set.of(
            "requestVerification",
            "replaceProperties",
            "trash",
            "convert",
            "setAutoRelease",
            "configureBoost",
            "pin",
            "create",
            "edit",
            "rename",
            "describe",
            "archive",
            "restore",
            "purge",
            "terminate",
            "terminateScope",
            "unplace",
            "place",
            "transfer",
            "reslug",
            "publish",
            "unpublish",
            "setSeo",
            "setIcon",
            "setProperty",
            "removeProperty",
            "attach",
            "detach",
            "prune",
            "record",
            "draft",
            "load",
            "validate",
            "approve",
            "promote",
            "discard",
            "setRetention",
            "setLabel",
            "annotate",
            "register",
            "verify",
            "updateProfile",
            "deactivate",
            "reactivate",
            "erase",
            "set",
            "change",
            "reset",
            "requestReset",
            "authenticate",
            "start",
            "renew",
            "end",
            "endAll",
            "endByRefresh",
            "eraseAll",
            "issue",
            "revoke",
            "anonymize",
            "add",
            "remove",
            "setRole",
            "invite",
            "accept",
            "revokeInvite",
            "revokeInvitesFor",
            "clearGroup",
            "grant",
            "restrict",
            "unrestrict",
            "clearResource",
            "clearPrincipal",
            "defineRole",
            "addEntry",
            "move",
            "relabel",
            "replace",
            "tag",
            "untag",
            "setHome",
            "setBranding",
            "setTitleTemplate",
            "setLocale",
            "setAnalytics",
            "setRobots",
            "setRule",
            "mount",
            "remount",
            "unmount",
            "reorder",
            "delete",
            "bind",
            "setPrimary",
            "unbind",
            "retire");

    static boolean action(Method method, Class<?> type) {
        String name = method.getName();
        var transaction = org.springframework.core.annotation.AnnotatedElementUtils.findMergedAnnotation(
                method, org.springframework.transaction.annotation.Transactional.class);
        if (transaction == null)
            transaction = org.springframework.core.annotation.AnnotatedElementUtils.findMergedAnnotation(
                    type, org.springframework.transaction.annotation.Transactional.class);
        // External background work (for example index construction) is not one business
        // transaction.
        // Its request/terminal outcome is captured by the operational flow instead.
        if (transaction == null || transaction.readOnly()) return false;
        return PRODUCT_CONCEPT.get(type)
                && type.getName().contains(".application.")
                && ACTIONS.contains(name)
                && (!name.equals("authenticate") || type.getName().contains(".password."));
    }

    static AuditApi.Event event(String kind, String action, Object[] args, Object result, String outcome) {
        var context = RequestAuditContext.current();
        UUID actor = context.actorId();
        String actorType = context.actorType();
        if (actor == null && actorType.equals("system")) {
            for (Object arg : args) {
                if (arg instanceof io.space.concepts.page.api.PageApi.Actor value) {
                    actor = value.id();
                    actorType = value.type().name().toLowerCase(Locale.ROOT).replace("api_token", "token");
                } else if (arg instanceof io.space.concepts.revision.api.RevisionApi.Actor value) {
                    actor = value.id();
                    actorType = value.type().name().toLowerCase(Locale.ROOT).replace("api_token", "token");
                } else if (arg instanceof io.space.concepts.space.api.SpaceApi.ActorId value) {
                    actor = value.value();
                    actorType = "user";
                } else if (arg instanceof io.space.concepts.site.api.SiteApi.ActorId value) {
                    actor = value.value();
                    actorType = "user";
                }
            }
        }
        var target = AuditTargets.of(action, args, result);
        return new AuditApi.Event(
                context.tenantId(),
                UUID.randomUUID(),
                context.rootId(),
                kind,
                actorType,
                actor,
                action,
                target.type(),
                target.id(),
                outcome,
                context.ip(),
                context.requestId());
    }

    static String outcome(Object result) {
        return AuditOutcomes.of("", result);
    }

    static String outcome(String action, Object result) {
        return AuditOutcomes.of(action, result);
    }
}
