package io.space;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.analytics.api.AnalyticsApi;
import io.space.concepts.audit.api.AuditApi;
import io.space.concepts.audit.api.AuditExportsApi;
import io.space.concepts.bundleexport.api.BundleExportJobs;
import io.space.concepts.bundleexport.api.BundleZipWriter;
import io.space.concepts.certificateinspection.api.CertificateInspectionApi;
import io.space.concepts.deletionrecovery.api.DeletionRecoveryApi;
import io.space.concepts.dnslookup.api.DnsLookupApi;
import io.space.concepts.idempotency.api.IdempotencyApi;
import io.space.concepts.importformat.api.ImportFormatApi;
import io.space.concepts.importjob.api.ImportJobApi;
import io.space.concepts.mailoutbox.api.MailDeliveryApi;
import io.space.concepts.mailoutbox.api.MailOutboxApi;
import io.space.concepts.mailoutbox.api.MailTransport;
import io.space.concepts.objectstore.api.ObjectReservationsApi;
import io.space.concepts.objectstore.api.ObjectStoreApi;
import io.space.concepts.readersecurity.api.ReaderStateApi;
import io.space.concepts.servicehealth.api.ServiceHealthApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.webhook.api.WebhookApi;
import java.io.IOException;
import java.lang.reflect.Modifier;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;

/** Public platform concept operations must remain represented in their colocated specifications. */
class PlatformConceptSpecParityTest {
    private static final Map<String, Set<String>> IMPLEMENTATION_ONLY = Map.of(
            "deletionrecovery", Set.of("boundLockWait", "lockSpace"),
            "readersecurity", Set.of("bind"));
    static final Map<String, Class<?>[]> APIS = Map.ofEntries(
            Map.entry("analytics", new Class<?>[] {AnalyticsApi.class}),
            Map.entry("audit", new Class<?>[] {AuditApi.class, AuditExportsApi.class}),
            Map.entry("bundleexport", new Class<?>[] {BundleExportJobs.class, BundleZipWriter.class}),
            Map.entry("certificateinspection", new Class<?>[] {CertificateInspectionApi.class}),
            Map.entry("dnslookup", new Class<?>[] {DnsLookupApi.class}),
            Map.entry("idempotency", new Class<?>[] {IdempotencyApi.class}),
            Map.entry("importformat", new Class<?>[] {ImportFormatApi.class}),
            Map.entry("importjob", new Class<?>[] {ImportJobApi.class}),
            Map.entry("mailoutbox", new Class<?>[] {MailOutboxApi.class, MailDeliveryApi.class, MailTransport.class}),
            Map.entry("objectstore", new Class<?>[] {ObjectStoreApi.class, ObjectReservationsApi.class}),
            Map.entry("deletionrecovery", new Class<?>[] {DeletionRecoveryApi.class}),
            Map.entry("readersecurity", new Class<?>[] {ReaderStateApi.class}),
            Map.entry("servicehealth", new Class<?>[] {ServiceHealthApi.class}),
            Map.entry("tenantregistry", new Class<?>[] {TenantRegistryApi.class}),
            Map.entry("webhook", new Class<?>[] {WebhookApi.class}),
            Map.entry("contenttype", new Class<?>[] {io.space.concepts.contenttype.api.ContentTypeApi.class}),
            Map.entry(
                    "plugindevelopment",
                    new Class<?>[] {io.space.concepts.plugindevelopment.api.PluginDevelopmentApi.class}),
            Map.entry(
                    "pluginverification",
                    new Class<?>[] {io.space.concepts.pluginverification.api.PluginVerificationApi.class}));

    @Test
    void everyPlatformModuleAndPublicOperationHasASpecification() throws IOException {
        var missing = new ArrayList<String>();
        var modules = new HashMap<String, SourceLayout.Concept>();
        for (var concept : SourceLayout.concepts()) modules.put(concept.concept(), concept);
        for (var entry : APIS.entrySet()) {
            var module = modules.get(entry.getKey());
            if (module == null) {
                missing.add(entry.getKey() + ": not registered");
                continue;
            }
            var path = module.spec();
            if (!Files.isRegularFile(path)) {
                missing.add(path + ": missing");
                continue;
            }
            var spec = Files.readString(path);
            if (!spec.startsWith("# concept ")) missing.add(path + ": missing concept title");
            int purpose = spec.indexOf("\n## purpose\n");
            int state = spec.indexOf("\n## state\n");
            int actions = spec.indexOf("\n## actions\n");
            int principle = spec.indexOf("\n## operational principle\n");
            int notes = spec.indexOf("\n## notes\n");
            if (!(purpose >= 0 && purpose < state && state < actions && actions < principle && principle < notes)) {
                missing.add(path + ": required sections missing or out of order");
                continue;
            }
            String contract = spec.substring(actions, notes);
            var required = new HashMap<String, Integer>();
            for (var api : entry.getValue()) {
                for (var method : api.getDeclaredMethods()) {
                    if (!Modifier.isPublic(method.getModifiers()) || method.isSynthetic()) continue;
                    if (api == BundleZipWriter.class && !method.getName().equals("write")) continue;
                    if (IMPLEMENTATION_ONLY
                            .getOrDefault(entry.getKey(), Set.of())
                            .contains(method.getName())) continue;
                    required.merge(method.getName(), 1, Integer::sum);
                }
            }
            required.forEach((name, count) -> {
                var pattern = Pattern.compile("(?m)^" + Pattern.quote(name) + " \\[.*?\\] => \\[.*?\\]");
                long declared = pattern.matcher(contract).results().count();
                if (declared < count) missing.add(entry.getKey() + ": " + name + " needs " + count + " declarations");
            });
        }
        assertThat(missing)
                .as("platform concept API operations must appear in CONCEPT.md")
                .isEmpty();
    }
}
