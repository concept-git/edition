package io.space.contentapp.compositions.shared;

import java.util.List;

/** 以 Host 为根的提供结果，导航与机器索引共用。 */
public sealed interface ServeResult {
    public record Redirect(int status, String host, String path) implements ServeResult {}

    public record Toc(List<ContentView.NavNode> nodes) implements ServeResult {}

    public record Sitemap(List<String> paths) implements ServeResult {}

    public record Robots(String policy) implements ServeResult {}
}
