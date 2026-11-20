package io.space.contentapp.compositions.shared;

import io.space.delivery.contract.SiteSnapshot;
import java.util.List;

/** 阅读流程导出的、与 HTTP 无关的投影。 */
public final class ContentView {
    private ContentView() {}

    public static List<NavNode> navigation(List<SiteSnapshot.Node> nodes) {
        return nodes.stream()
                .map(node -> new NavNode(node.label(), node.kind(), node.href(), navigation(node.children())))
                .toList();
    }

    public static Brand brand(SiteSnapshot.Brand brand) {
        return new Brand(
                brand.siteName(),
                brand.logo(),
                brand.favicon(),
                brand.primaryColor(),
                brand.locale(),
                brand.titleTemplate(),
                brand.analyticsId(),
                brand.robotsPolicy());
    }

    public record Brand(
            String siteName,
            String logo,
            String favicon,
            String primaryColor,
            String locale,
            String titleTemplate,
            String analyticsId,
            String robotsPolicy) {}

    public record NavNode(String label, String kind, String href, List<NavNode> children) {}
}
