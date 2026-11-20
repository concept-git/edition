package io.space.control.compositions.authoring.tocediting;

import io.space.concepts.space.api.SpaceApi;
import io.space.concepts.toc.api.TocApi;
import io.space.control.compositions.principal.PrincipalResolver.Resolution;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

/** 概念嵌套树 → flow TocView；kind 以线值小写暴露，depth 是派生字段原样带出。 */
final class TocProjection {
    private TocProjection() {}

    static TocEditingTypes.TocView view(
            List<TocApi.View> tree, Resolution resolution, UUID tenant, SpaceApi.View space, TocAccess access) {
        return new TocEditingTypes.TocView(entries(tree), access.allowedActions(resolution, tenant, space));
    }

    private static List<TocEditingTypes.EntryView> entries(List<TocApi.View> tree) {
        return tree.stream().map(TocProjection::entry).toList();
    }

    private static TocEditingTypes.EntryView entry(TocApi.View value) {
        return new TocEditingTypes.EntryView(
                value.id(),
                value.parentId(),
                value.position(),
                value.label(),
                value.kind().name().toLowerCase(Locale.ROOT),
                value.targetId(),
                value.url(),
                value.depth(),
                entries(value.children()));
    }
}
