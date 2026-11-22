package io.edition.contentapp.usecases.navigation;

import io.edition.contentapp.usecases.access.ContentIdentity.PublicationCredential;
import io.edition.contentapp.usecases.ports.PublicationRead;
import io.edition.contentapp.usecases.shared.ContentProblem;
import io.edition.contentapp.usecases.shared.ContentView;
import io.edition.contentapp.usecases.shared.ServeResult;
import io.edition.delivery.contract.SiteSnapshot;
import java.util.List;
import java.util.function.Function;
import org.springframework.stereotype.Service;

/** 当前快照的可见 Toc、sitemap 与 robots。sitemap 始终是匿名可见集。 */
@Service
public final class ContentNavigation {
    private final PublicationRead publication;

    public ContentNavigation(PublicationRead publication) {
        this.publication = publication;
    }

    public ServeResult serveToc(String host, String slug, PublicationCredential proof) {
        return published(
                host,
                "toc",
                slug,
                proof,
                SiteSnapshot.Node[].class,
                nodes -> new ServeResult.Toc(ContentView.navigation(List.of(nodes))));
    }

    public ServeResult serveSitemap(String host) {
        return published(
                host,
                "sitemap",
                null,
                PublicationCredential.ANONYMOUS,
                String[].class,
                paths -> new ServeResult.Sitemap(List.of(paths)));
    }

    public ServeResult serveRobots(String host) {
        return published(host, "robots", null, PublicationCredential.ANONYMOUS, String.class, ServeResult.Robots::new);
    }

    private <T> ServeResult published(
            String host,
            String kind,
            String slug,
            PublicationCredential credential,
            Class<T> type,
            Function<T, ServeResult> success) {
        var result = publication.navigation(host, kind, slug, credential, type);
        return switch (result.outcome()) {
            case "ok" -> success.apply(result.document());
            case "redirect" -> new ServeResult.Redirect(301, result.primaryHost(), null);
            case "forbidden" -> throw ContentProblem.publication("forbidden");
            default -> throw ContentProblem.publication(result.outcome());
        };
    }
}
