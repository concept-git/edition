package io.edition.control.usecases.platform.contenttype;

import io.edition.content.ContentTypeDefinition;
import io.edition.control.modules.contenttype.api.ContentTypeApi;
import io.edition.control.usecases.access.*;
import io.edition.control.usecases.flow.*;
import io.edition.control.usecases.flow.ProblemCode;
import io.edition.control.usecases.platform.contenttype.ContentTypeTypes.*;
import io.edition.shared.*;
import java.util.*;
import java.util.function.Supplier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

@Service
@Transactional
class ContentTypeOperations {
    private final io.edition.control.modules.release.api.ReleaseApi releases;
    private final ContentTypeApi types;
    private final TenantAccess tenants;
    private final IdempotentFlowExecutor idempotency;
    private final JsonMapper json;

    ContentTypeOperations(
            ContentTypeApi types,
            TenantAccess tenants,
            IdempotentFlowExecutor idempotency,
            JsonMapper json,
            io.edition.control.modules.release.api.ReleaseApi releases) {
        this.releases = releases;
        this.types = types;
        this.tenants = tenants;
        this.idempotency = idempotency;
        this.json = json;
    }

    public TypeList listContentTypes(String credential, UUID tenant) {
        var who = tenants.admitUser(credential, tenant);
        return tenants.inTenant(
                tenant,
                () -> new TypeList(
                        types.list().stream()
                                .map(v -> json.convertValue(v, State.class))
                                .toList(),
                        tenants.allows(who, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN)));
    }

    public VersionList listContentTypeVersions(String credential, UUID tenant, String type) {
        return read(
                credential,
                tenant,
                () -> new VersionList(types.versions(type).stream()
                        .map(v -> json.convertValue(v, VersionSummary.class))
                        .toList()));
    }

    public Version viewContentTypeVersion(String credential, UUID tenant, String ref) {
        return read(
                credential,
                tenant,
                () -> json.convertValue(types.version(ref).orElseThrow(ContentTypeApi.Missing::new), Version.class));
    }

    public FlowResponse<Version> registerContentTypeVersion(
            String credential, UUID tenant, String type, int base, ContentTypeDefinition definition, String key) {
        return write(
                credential,
                tenant,
                key,
                "contenttype.register",
                json.writeValueAsString(Arrays.asList(type, base, definition)),
                201,
                Version.class,
                () -> {
                    var errors = releases.inspectDefinition(definition);
                    if (!errors.isEmpty())
                        throw new Invalid(
                                "definition.validation", errors.getFirst().detail());
                    return json.convertValue(types.registerVersion(type, base, definition), Version.class);
                });
    }

    public FlowResponse<State> activateContentType(
            String credential, UUID tenant, String type, int base, String reference, String key) {
        return write(
                credential,
                tenant,
                key,
                "contenttype.activate",
                IdempotentFlowExecutor.canonical(type, base, reference),
                200,
                State.class,
                () -> json.convertValue(types.activate(type, base, reference), State.class));
    }

    public FlowResponse<State> deactivateContentType(
            String credential, UUID tenant, String type, int base, String key) {
        return write(
                credential,
                tenant,
                key,
                "contenttype.deactivate",
                IdempotentFlowExecutor.canonical(type, base),
                200,
                State.class,
                () -> json.convertValue(types.deactivate(type, base), State.class));
    }

    private <T> T read(String credential, UUID tenant, Supplier<T> work) {
        tenants.admitUser(credential, tenant);
        return tenants.inTenant(tenant, () -> translate(work));
    }

    private <T> FlowResponse<T> write(
            String credential,
            UUID tenant,
            String key,
            String operation,
            String fingerprint,
            int status,
            Class<T> result,
            Supplier<T> work) {
        var who = tenants.requireUser(credential, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN);
        return idempotency.execute(
                who.principal(),
                key,
                operation,
                tenant + "|" + fingerprint,
                status,
                result,
                () -> tenants.inTenant(tenant, () -> translate(work)));
    }

    private <T> T translate(Supplier<T> work) {
        try {
            return work.get();
        } catch (ContentTypeApi.Invalid e) {
            throw new Invalid(e.field, e.reason);
        } catch (ContentTypeApi.Conflict e) {
            throw new InvalidConflict(e.revision);
        } catch (ContentTypeApi.Missing e) {
            throw new OperationNotFoundException();
        }
    }

    public static final class Invalid extends FlowException {
        public Invalid(String field, String reason) {
            super(ProblemCode.VALIDATION_FAILED, List.of(new ValidationViolation(field, reason)));
        }
    }

    public static final class InvalidConflict extends FlowException {
        public InvalidConflict(int current) {
            super(
                    ProblemCode.EDIT_CONFLICT,
                    List.of(new ValidationViolation("baseRevision", "current_revision_" + current)));
        }
    }
}
