package io.edition.concepts.permission.domain;

import io.edition.concepts.permission.api.*;
import io.edition.concepts.permission.api.PermissionApi.Decision;
import io.edition.concepts.permission.api.PermissionApi.DecisionTrace;
import io.edition.concepts.permission.api.PermissionApi.Grant;
import io.edition.concepts.permission.api.PermissionApi.Operation;
import io.edition.concepts.permission.api.PermissionApi.Principal;
import io.edition.concepts.permission.api.PermissionApi.Resource;
import io.edition.concepts.permission.api.PermissionApi.RestrictionView;
import io.edition.concepts.permission.api.PermissionApi.Role;
import io.edition.concepts.permission.api.PermissionApi.Subject;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Permission 操作原理的纯 Java 判定器。
 * 输入 View 是某一时刻的授权事实，因此算法既可接数据库，也可在单测中使用内存视图。
 */
public final class PermissionPolicy {

    public Decision decide(List<Resource> chain, Principal principal, Operation operation, View view) {
        return decide(chain, Subject.of(principal), operation, view);
    }

    /**
     * 多身份判定：从内向外选择首个存在匹配 grant 的资源层；同层 primary 优先，
     * 否则合并全部 affiliation grant 的 operation。restriction 在每一层都与完整身份闭包求交。
     */
    public Decision decide(List<Resource> chain, Subject subject, Operation operation, View view) {
        List<Layer> layers = new ArrayList<>(chain.size());
        boolean restrictionsSatisfied = true;
        Set<Principal> identities = subject.identities();

        for (Resource resource : chain) {
            List<Grant> localGrants = grants(resource, subject, view);
            RestrictionView restriction = view.restriction(resource);
            Set<Principal> matches = restriction.active()
                    ? identities.stream()
                            .filter(restriction.principals()::contains)
                            .collect(java.util.stream.Collectors.toUnmodifiableSet())
                    : Set.of();
            boolean satisfied = !restriction.active() || !matches.isEmpty();
            restrictionsSatisfied &= satisfied;
            layers.add(new Layer(resource, localGrants, restriction, matches, satisfied));
        }

        int decisiveIndex = -1;
        List<Grant> matched = List.of();
        for (int index = layers.size() - 1; index >= 0; index--) {
            List<Grant> local = layers.get(index).grants();
            if (local.isEmpty()) continue;
            decisiveIndex = index;
            // grants 保证直接主体在首位；存在直接授权时只取它，否则合并该层全部群体授权。
            matched = local.getFirst().principal().equals(subject.primary()) ? List.of(local.getFirst()) : local;
            break;
        }

        Set<Operation> effectiveOperations = matched.stream()
                .flatMap(grant -> view.operations(grant.role()).stream())
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
        Optional<Role> effectiveRole =
                matched.size() == 1 ? Optional.of(matched.getFirst().role()) : Optional.empty();
        List<DecisionTrace> trace = new ArrayList<>(layers.size());
        for (int index = 0; index < layers.size(); index++) {
            Layer layer = layers.get(index);
            trace.add(new DecisionTrace(
                    layer.resource(),
                    layer.grants(),
                    layer.restriction(),
                    layer.restrictionMatches(),
                    layer.restrictionSatisfied(),
                    index == decisiveIndex));
        }
        return new Decision(
                restrictionsSatisfied && effectiveOperations.contains(operation),
                effectiveRole,
                effectiveOperations,
                matched,
                trace);
    }

    public Set<List<Resource>> filter(Set<List<Resource>> chains, Principal principal, Operation operation, View view) {
        return filter(chains, Subject.of(principal), operation, view);
    }

    public Set<List<Resource>> filter(Set<List<Resource>> chains, Subject subject, Operation operation, View view) {
        Set<List<Resource>> permitted = new LinkedHashSet<>();
        for (List<Resource> chain : chains) {
            if (decide(chain, subject, operation, view).allowed()) {
                permitted.add(List.copyOf(chain));
            }
        }
        return Set.copyOf(permitted);
    }

    public Optional<Role> effectiveRole(List<Resource> chain, Principal principal, View view) {
        // 最近层已完整决定角色，无须继续查询外层；none 也是一个存在且有效的覆盖值。
        for (Resource resource : chain.reversed()) {
            Optional<Role> local = view.grant(resource, principal);
            if (local.isPresent()) return local;
        }
        return Optional.empty();
    }

    /** 完整授权痕迹：直接主体如有授权排首位，之后是按稳定身份排序的群体授权。 */
    private static List<Grant> grants(Resource resource, Subject subject, View view) {
        var grants = new ArrayList<Grant>();
        view.grant(resource, subject.primary())
                .map(role -> new Grant(resource, subject.primary(), role))
                .ifPresent(grants::add);
        subject.affiliations().stream()
                .sorted(Comparator.comparing(
                                (Principal principal) -> principal.type().name())
                        .thenComparing(principal ->
                                principal.id() == null ? "" : principal.id().toString()))
                .forEach(principal -> view.grant(resource, principal)
                        .map(role -> new Grant(resource, principal, role))
                        .ifPresent(grants::add));
        return List.copyOf(grants);
    }

    private record Layer(
            Resource resource,
            List<Grant> grants,
            RestrictionView restriction,
            Set<Principal> restrictionMatches,
            boolean restrictionSatisfied) {}

    public interface View {
        Set<Operation> operations(Role role);

        Optional<Role> grant(Resource resource, Principal principal);

        RestrictionView restriction(Resource resource);
    }
}
