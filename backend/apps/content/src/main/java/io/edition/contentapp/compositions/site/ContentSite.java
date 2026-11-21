package io.edition.contentapp.compositions.site;

import io.edition.content.ContentProfile;
import io.edition.content.ContentTypeSnapshot;
import io.edition.contentapp.compositions.access.ContentIdentity.PublicationCredential;
import io.edition.contentapp.compositions.shared.ContentProblem;
import io.edition.contentapp.entry.persistence.PublicationPages;
import io.edition.delivery.contract.SiteSnapshot;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;

/**
 * 站点与页面的数据读取：把 {@code read_document} 的结果翻译成阅读前端可渲染的资源。
 * 不渲染正文，不产生 HTML；重定向与附件以描述返回，由入口翻译为 HTTP。
 */
@Service
public final class ContentSite {
    private static final int MAX_PATH = 512;
    private static final Set<String> DESCRIBED = Set.of(
            "ok",
            "redirect",
            "forbidden",
            "page_not_found",
            "space_not_found",
            "path_redirect",
            "home_redirect",
            "attachment");

    private final PublicationPages publication;

    public ContentSite(PublicationPages publication) {
        this.publication = publication;
    }

    public SiteView site(String host, PublicationCredential credential) {
        var read = publication.document(host, "/", credential);
        var context = read.context();
        if (context == null || !DESCRIBED.contains(read.outcome())) throw ContentProblem.publication(read.outcome());
        var spaces = context.spaces().stream()
                .map(space -> new SpaceView(space.slug(), space.name(), space.navigation()))
                .toList();
        String home = context.spaces().stream()
                .filter(space -> space.id().equals(context.home()))
                .map(space -> "/" + space.slug())
                .findFirst()
                .orElse(null);
        var brand = context.brand();
        return new SiteView(
                brand.siteName(),
                brand.logo(),
                brand.favicon(),
                brand.primaryColor(),
                brand.locale(),
                brand.titleTemplate(),
                brand.analyticsId(),
                brand.robotsPolicy(),
                read.primaryHost(),
                home,
                spaces);
    }

    public PageResolution page(String host, String requested, PublicationCredential credential) {
        String path = normalize(requested);
        var read = publication.document(host, path, credential);
        return switch (read.outcome()) {
            case "ok" -> found(read);
            case "redirect" -> new PageResolution.Redirect(301, read.primaryHost(), null);
            case "path_redirect" -> new PageResolution.Redirect(301, null, read.redirectPath());
            case "home_redirect" -> new PageResolution.Redirect(302, null, read.redirectPath());
            case "attachment" -> attachment(host, path, read, credential);
            default -> throw ContentProblem.publication(read.outcome());
        };
    }

    private static String normalize(String requested) {
        String path = requested == null || requested.isEmpty() ? "/" : requested;
        if (!path.startsWith("/") || path.length() > MAX_PATH || path.chars().anyMatch(Character::isISOControl))
            throw new ContentProblem(422, "validation_failed");
        return path;
    }

    private static PageResolution found(PublicationPages.DocumentRead read) {
        var page = read.page();
        var context = read.context();
        if (page == null || context == null) throw ContentProblem.unavailable();
        var space = context.spaces().stream()
                .filter(candidate -> candidate.id().equals(page.spaceId()))
                .findFirst()
                .orElseThrow(ContentProblem::unavailable);
        return new PageResolution.Found(new PageView(
                page.id(),
                page.path(),
                page.title(),
                page.format(),
                page.content(),
                page.contentHash(),
                space.slug(),
                space.name(),
                read.siteId() + ":" + space.id() + ":" + context.revision(),
                page.seo(),
                page.properties(),
                page.attachments(),
                page.promotedAt(),
                page.contentProfile(),
                page.contentTypeDefinition()));
    }

    private PageResolution attachment(
            String host, String path, PublicationPages.DocumentRead read, PublicationCredential credential) {
        var file = read.attachment();
        if (file == null) throw ContentProblem.unavailable();
        String space = path.split("/", 3)[1];
        var mount = publication.mount(host, space, credential);
        if (!"ok".equals(mount.outcome())) throw ContentProblem.publication(mount.outcome());
        return new PageResolution.File(space, mount.snapshot(), "/" + file.path());
    }

    public record SiteView(
            String name,
            String logo,
            String favicon,
            String primaryColor,
            String locale,
            String titleTemplate,
            String analyticsId,
            String robotsPolicy,
            String primaryHost,
            String home,
            List<SpaceView> spaces) {}

    public record SpaceView(String slug, String name, List<SiteSnapshot.Node> navigation) {}

    public record PageView(
            UUID id,
            String path,
            String title,
            String format,
            String content,
            String contentHash,
            String space,
            String spaceName,
            String snapshot,
            Map<String, String> seo,
            Map<String, String> properties,
            List<SiteSnapshot.Attachment> attachments,
            Instant promotedAt,
            ContentProfile contentProfile,
            ContentTypeSnapshot contentTypeDefinition) {}

    public sealed interface PageResolution {
        record Found(PageView page) implements PageResolution {}

        /** {@code host} 为空表示当前主机；{@code path} 为空表示沿用请求路径。 */
        record Redirect(int status, String host, String path) implements PageResolution {}

        record File(String space, String snapshot, String path) implements PageResolution {}
    }
}
