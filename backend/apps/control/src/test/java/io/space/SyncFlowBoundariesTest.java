package io.space;

import static org.assertj.core.api.Assertions.assertThat;

import com.tngtech.archunit.core.domain.JavaClass;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;

/** The flow packages inside the single Modulith sync module have their own dependency rules. */
class SyncFlowBoundariesTest {
    private static final String PREFIX = "io.space.control.compositions.";
    private static final Path SOURCES = Path.of("src/main/java/io/space/control/compositions");

    private static final Map<String, String> PRODUCT_CONCEPTS = productConcepts();

    // Each flow declares the concepts it may call; the root sync module has a wider integration scope.
    private static final Map<String, Set<String>> CONCEPTS = Map.ofEntries(
            concepts("authoring.attachmentbrowsing", "authoring.page", "authoring.space", "iam.permission"),
            concepts("authoring.collection", "authoring.collection", "authoring.space", "iam.permission"),
            concepts("authoring.deletion", "authoring.page", "authoring.space", "authoring.toc", "iam.permission"),
            concepts(
                    "authoring.pageediting",
                    "authoring.page",
                    "authoring.revision",
                    "authoring.space",
                    "authoring.tag",
                    "iam.apitoken",
                    "iam.permission",
                    "iam.user",
                    "releases.release"),
            concepts(
                    "authoring.permission",
                    "authoring.page",
                    "authoring.space",
                    "hosting.site",
                    "iam.apitoken",
                    "iam.membership",
                    "iam.permission",
                    "iam.team",
                    "iam.user"),
            concepts(
                    "authoring.space",
                    "authoring.collection",
                    "authoring.page",
                    "authoring.space",
                    "hosting.site",
                    "iam.permission",
                    "releases.release"),
            concepts("authoring.tagging", "authoring.page", "authoring.space", "authoring.tag", "iam.permission"),
            concepts(
                    "authoring.termination",
                    "authoring.collection",
                    "authoring.page",
                    "authoring.revision",
                    "authoring.space",
                    "authoring.tag",
                    "authoring.toc",
                    "hosting.customdomain",
                    "hosting.redirect",
                    "hosting.search",
                    "hosting.site",
                    "iam.apitoken",
                    "iam.permission",
                    "releases.release"),
            concepts("authoring.tocediting", "authoring.page", "authoring.space", "authoring.toc", "iam.permission"),
            concepts("hosting.customdomain", "hosting.customdomain", "hosting.site"),
            concepts(
                    "hosting.sitedelivery",
                    "authoring.space",
                    "hosting.customdomain",
                    "hosting.redirect",
                    "hosting.site",
                    "releases.release"),
            concepts(
                    "hosting.readersecurity",
                    "hosting.customdomain",
                    "hosting.site",
                    "iam.password",
                    "iam.session",
                    "iam.user"),
            concepts(
                    "hosting.reorganization",
                    "authoring.page",
                    "authoring.space",
                    "authoring.toc",
                    "hosting.redirect",
                    "hosting.site",
                    "iam.permission"),
            concepts("hosting.site", "authoring.space", "hosting.customdomain", "hosting.site", "iam.permission"),
            concepts("iam.accountsecurity", "iam.password", "iam.session", "iam.user"),
            concepts("iam.accountsession", "iam.membership", "iam.session", "iam.user"),
            concepts("iam.membership", "iam.membership", "iam.permission", "iam.team", "iam.user"),
            concepts("iam.login", "iam.password", "iam.session", "iam.user"),
            concepts("iam.registration", "iam.membership", "iam.password", "iam.user"),
            concepts("iam.team", "iam.membership", "iam.permission", "iam.team", "iam.user"),
            concepts("iam.apitoken", "authoring.space", "iam.apitoken", "iam.permission"),
            concepts("iam.managementtoken", "iam.managementtoken", "iam.permission"),
            concepts(
                    "iam.usererasure",
                    "iam.apitoken",
                    "iam.managementtoken",
                    "iam.membership",
                    "iam.password",
                    "iam.permission",
                    "iam.session",
                    "iam.team",
                    "iam.user"),
            concepts("platform.certificatecheck", "hosting.customdomain"),
            concepts("platform.maildelivery", "iam.membership", "iam.password", "iam.user"),
            concepts("platform.mailadmin", "iam.permission"),
            concepts(
                    "platform.operations",
                    "authoring.space",
                    "hosting.site",
                    "iam.permission",
                    "iam.user",
                    "releases.release"),
            concepts("platform.search", "hosting.search", "hosting.site", "iam.permission", "iam.user"),
            concepts("platform.servicehealth"),
            concepts("platform.pluginmanagement", "releases.release"),
            concepts("platform.contenttype", "releases.release"),
            concepts("platform.statistics", "authoring.page", "authoring.space", "hosting.site", "releases.release"),
            concepts("platform.tenant", "iam.membership", "iam.user"),
            concepts(
                    "platform.webhook",
                    "authoring.page",
                    "authoring.space",
                    "hosting.customdomain",
                    "hosting.site",
                    "iam.permission",
                    "releases.release"),
            concepts("releases.bundleexport", "authoring.space", "iam.permission", "releases.release"),
            concepts(
                    "releases.bundleimport",
                    "authoring.page",
                    "authoring.revision",
                    "authoring.space",
                    "authoring.toc",
                    "releases.release"),
            concepts(
                    "releases.release",
                    "authoring.page",
                    "authoring.space",
                    "authoring.toc",
                    "iam.permission",
                    "releases.release"));

    // Existing cross-flow types, including direct sync calls. New ones require an ownership decision.
    private static final Map<String, Set<String>> CROSS_FLOW_TYPES = Map.ofEntries(
            edge("authoring.collection", "authoring.space", "SpaceTypes", "SpaceProjection"),
            edge("authoring.deletion", "authoring.pageediting", "PageAccess", "PageEditingTypes", "PageProjection"),
            edge("authoring.deletion", "releases.release", "AuthoredAutoRelease"),
            edge("authoring.tagging", "authoring.pageediting", "PageEditingTypes", "PageProjection"),
            edge("authoring.termination", "hosting.site", "SiteNotEmptyException"),
            edge("authoring.tocediting", "releases.release", "AuthoredAutoRelease"),
            edge("hosting.customdomain", "hosting.site", "SiteAccess"),
            edge("hosting.reorganization", "authoring.pageediting", "PageAccess", "PageEditingTypes", "PageProjection"),
            edge("hosting.reorganization", "hosting.site", "SiteAccess", "SiteTypes", "SiteProjection"),
            edge("hosting.reorganization", "releases.release", "AuthoredAutoRelease"),
            edge(
                    "iam.team",
                    "iam.membership",
                    "AlreadyMemberException",
                    "LastOwnerException",
                    "MemberNotFoundException",
                    "MemberRoles",
                    "TenantMembershipRequiredException"),
            edge(
                    "platform.operations",
                    "authoring.termination",
                    "ExpiredTrashPurge",
                    "TerminationErrors",
                    "TerminationTypes"),
            edge("releases.bundleexport", "releases.release", "ReleaseAccess", "ReleaseNotFoundException"),
            edge("releases.bundleimport", "authoring.pageediting", "PageRenderer"),
            edge(
                    "releases.bundleimport",
                    "releases.release",
                    "ReleaseAccess",
                    "ReleaseDecisions",
                    "ReleaseNotFoundException",
                    "ReleaseProjection",
                    "ReleaseTypes"),
            edge("releases.release", "authoring.pageediting", "PageAccess", "PageEditingTypes", "PageProjection"),
            edge("releases.release", "authoring.space", "SpaceTypes", "SpaceProjection"));

    @Test
    void flowDependenciesAreAcyclicAndUseOnlyDeclaredCollaborations() {
        var classes = new ClassFileImporter()
                .withImportOption(new ImportOption.DoNotIncludeTests())
                .importPackages("io.space.control.compositions");
        Map<String, Set<String>> graph = new HashMap<>();
        Map<String, Set<String>> usedConcepts = new HashMap<>();
        Map<String, Set<String>> usedCrossFlowTypes = new HashMap<>();
        Set<String> directSyncCalls = new HashSet<>();
        List<String> violations = new ArrayList<>();

        for (JavaClass source : classes) {
            String from = flowOf(source);
            if (from == null) continue;
            graph.computeIfAbsent(from, ignored -> new HashSet<>());
            usedConcepts.computeIfAbsent(from, ignored -> new HashSet<>());
            if (!CONCEPTS.containsKey(from)) {
                violations.add(from + ": 新 flow 缺少概念依赖声明");
            }
            source.getDirectDependenciesFromSelf().forEach(dependency -> {
                JavaClass target = dependency.getTargetClass();
                if (!target.equals(source) && isRule(source) && isRule(target)) {
                    violations.add("direct rule dependency: " + dependency.getDescription());
                }
                String concept = conceptOf(target);
                if (concept != null) usedConcepts.get(from).add(concept);
                if (concept != null && !CONCEPTS.getOrDefault(from, Set.of()).contains(concept)) {
                    violations.add(source.getSimpleName() + " -> " + target.getName() + ": flow 未声明概念依赖");
                }
                String to = flowOf(target);
                if (to == null || to.equals(from)) return;
                graph.get(from).add(to);
                String type = target.getName()
                        .substring(target.getPackageName().length() + 1)
                        .split("\\$")[0];
                String edge = from + " -> " + to;
                usedCrossFlowTypes
                        .computeIfAbsent(edge, ignored -> new HashSet<>())
                        .add(type);
                if (!CROSS_FLOW_TYPES.getOrDefault(edge, Set.of()).contains(type)) {
                    violations.add(source.getSimpleName() + " -> " + target.getName() + ": 跨 flow 使用了未声明的类型");
                }
            });
            source.getMethodCallsFromSelf().forEach(call -> {
                JavaClass target = call.getTarget().getOwner();
                String to = flowOf(target);
                if (to != null && !target.equals(source) && isRule(source) && isRule(target)) {
                    directSyncCalls.add(from + " -> " + to + "." + target.getSimpleName() + "."
                            + call.getTarget().getName());
                }
            });
        }

        assertThat(violations).as("跨 flow 类型依赖必须逐项声明").isEmpty();
        assertThat(usedConcepts).as("概念依赖清单必须与代码一致，删除无用声明").isEqualTo(CONCEPTS);
        assertThat(usedCrossFlowTypes).as("跨 flow 类型清单必须与代码一致，删除无用声明").isEqualTo(CROSS_FLOW_TYPES);
        assertThat(directSyncCalls).as("flow 间不得直接调用其他 sync；通过具名规则或查询协作").isEmpty();
        for (String flow : graph.keySet()) {
            assertThat(hasCycle(flow, graph, new HashSet<>(), new HashSet<>()))
                    .as("flow 依赖不能成环：%s", flow)
                    .isFalse();
        }
    }

    @Test
    void completionHandlersPreserveSynchronousTransactionAndRefusalPropagation() {
        var classes = new ClassFileImporter()
                .withImportOption(new ImportOption.DoNotIncludeTests())
                .importPackages("io.space.control");
        int handlers = 0;
        for (JavaClass type : classes) {
            for (var method : type.getMethods()) {
                if (!method.isAnnotatedWith(org.springframework.context.event.EventListener.class)
                        || method.getRawParameterTypes().stream()
                                .noneMatch(p -> p.getName().contains("Signals$"))) continue;
                handlers++;
                assertThat(method.isAnnotatedWith(org.springframework.scheduling.annotation.Async.class)
                                || type.isAnnotatedWith(org.springframework.scheduling.annotation.Async.class))
                        .as(method.getFullName())
                        .isFalse();
                assertThat(method.isAnnotatedWith(
                                org.springframework.transaction.event.TransactionalEventListener.class))
                        .isFalse();
                if (method.isAnnotatedWith(org.springframework.transaction.annotation.Transactional.class)) {
                    assertThat(method.getAnnotationOfType(
                                            org.springframework.transaction.annotation.Transactional.class)
                                    .propagation())
                            .as(method.getFullName())
                            .isEqualTo(org.springframework.transaction.annotation.Propagation.REQUIRED);
                }
            }
        }
        assertThat(handlers).as("native completion handlers must be included").isEqualTo(13);
        try (var files = Files.walk(Path.of("src/main/java"))) {
            for (Path source : files.filter(p -> p.toString().endsWith(".java")).toList()) {
                String text = Files.readString(source);
                assertThat(text)
                        .as("synchronous completion dispatch must retain errors and the caller thread: %s", source)
                        .doesNotContain("applicationEventMulticaster", ".setTaskExecutor(", ".setErrorHandler(");
            }
        } catch (java.io.IOException failure) {
            throw new IllegalStateException(failure);
        }
    }

    private static boolean isRule(JavaClass type) {
        if (!type.getPackageName().startsWith(PREFIX) || type.getName().contains("$")) return false;
        String name = type.getSimpleName();
        return name.endsWith("UseCase")
                || name.endsWith("OnCompletion")
                || name.endsWith("OnSchedule")
                || name.matches(".*On[A-Z].*");
    }

    private static String flowOf(JavaClass type) {
        String name = type.getPackageName();
        if (!name.startsWith(PREFIX)) return null;
        String[] parts = name.substring(PREFIX.length()).split("\\.");
        if (parts.length < 2) return null;
        Path flow = SOURCES.resolve(parts[0]).resolve(parts[1]);
        return Files.exists(flow.resolve("SYNCS.md")) ? parts[0] + "." + parts[1] : null;
    }

    private static Map<String, String> productConcepts() {
        try {
            return SourceLayout.concepts().stream()
                    .filter(concept -> !concept.context().equals("platform"))
                    .collect(java.util.stream.Collectors.toUnmodifiableMap(
                            SourceLayout.Concept::concept, concept -> concept.context() + "." + concept.concept()));
        } catch (java.io.IOException failure) {
            throw new IllegalStateException("cannot read concept inventory", failure);
        }
    }

    private static String conceptOf(JavaClass type) {
        String prefix = "io.space.concepts.";
        String name = type.getPackageName();
        if (!name.startsWith(prefix)) return null;
        return PRODUCT_CONCEPTS.get(name.substring(prefix.length()).split("\\.")[0]);
    }

    private static boolean hasCycle(
            String flow, Map<String, Set<String>> graph, Set<String> visiting, Set<String> visited) {
        if (visiting.contains(flow)) return true;
        if (!visited.add(flow)) return false;
        visiting.add(flow);
        for (String next : graph.getOrDefault(flow, Set.of())) {
            if (hasCycle(next, graph, visiting, visited)) return true;
        }
        visiting.remove(flow);
        return false;
    }

    private static Map.Entry<String, Set<String>> edge(String from, String to, String... types) {
        return Map.entry(from + " -> " + to, Set.of(types));
    }

    private static Map.Entry<String, Set<String>> concepts(String flow, String... modules) {
        return Map.entry(flow, Set.of(modules));
    }
}
