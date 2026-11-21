package io.edition.contentapp.compositions.search;

import com.meilisearch.sdk.Client;
import com.meilisearch.sdk.IndexSearchRequest;
import com.meilisearch.sdk.MultiSearchFederation;
import com.meilisearch.sdk.MultiSearchRequest;
import com.meilisearch.sdk.exceptions.MeilisearchException;
import io.edition.contentapp.compositions.access.ContentIdentity.PublicationCredential;
import io.edition.contentapp.compositions.shared.ContentProblem;
import io.edition.contentapp.compositions.shared.ContentView;
import io.edition.contentapp.entry.persistence.PublicationPages;
import io.edition.delivery.contract.SearchSegment;
import io.edition.delivery.contract.SiteSnapshot;
import io.micrometer.core.instrument.MeterRegistry;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/** 用当前快照与主体过滤引擎候选。缓存从不存允许/拒绝。 */
@Service
public final class ContentSearch {
    // 只缓存不可变引擎命中；页身份、哈希与权限在每次取出后重验。
    private final com.github.benmanes.caffeine.cache.Cache<String, List<HashMap<String, Object>>> candidates =
            com.github.benmanes.caffeine.cache.Caffeine.newBuilder()
                    .maximumWeight(32L * 1024 * 1024)
                    .expireAfterWrite(java.time.Duration.ofSeconds(60))
                    .weigher((String key, List<HashMap<String, Object>> rows) ->
                            Math.max(1, key.length() * 2 + rows.toString().length() * 2))
                    .build();
    private static final tools.jackson.databind.json.JsonMapper JSON =
            tools.jackson.databind.json.JsonMapper.builder().build();
    private final Client engine;
    private final byte[] key;
    private final MeterRegistry metrics;
    private final PublicationPages publication;

    public ContentSearch(
            Client engine,
            @Value("${delivery.cursor-key}") String key,
            MeterRegistry metrics,
            PublicationPages publication) {
        this.publication = publication;
        this.engine = engine;
        this.key = Base64.getDecoder().decode(key);
        this.metrics = metrics;
        if (this.key.length < 32) throw new IllegalArgumentException("cursor signing key must have at least 32 bytes");
    }

    public record Hit(String path, String title, String spaceSlug, String spaceName, String snippet) {}

    public record Result(
            String query, List<Hit> hits, String nextCursor, ContentView.Brand brand, String error, String traceId) {}

    public Result search(
            String host,
            String query,
            int limit,
            String cursor,
            String slug,
            String snapshot,
            PublicationCredential proof) {
        if ((slug == null) != (snapshot == null)) throw new ContentProblem(422, "validation_failed");
        return metrics.timer("edition.delivery.search").record(() -> {
            try {
                return searchPublished(host, query, limit, cursor, slug, snapshot, proof);
            } catch (ContentProblem changed) {
                if (changed.status == 409 && slug == null && (cursor == null || cursor.isBlank()))
                    return searchPublished(host, query, limit, null, null, null, proof);
                throw changed;
            }
        });
    }

    private Result searchPublished(
            String host,
            String query,
            int limit,
            String cursor,
            String slug,
            String snapshot,
            PublicationCredential credential) {
        String q = query == null ? "" : query.strip();
        if (q.codePointCount(0, q.length()) > 200 || limit < 1 || limit > 20)
            throw new ContentProblem(422, "validation_failed");
        var read = publication.searchContext(host, slug, snapshot, credential);
        if (!"ok".equals(read.outcome())) throw ContentProblem.publication(read.outcome());
        var context = read.document();
        var brand = ContentView.brand(read.brand());
        if (slug != null && !context.ready()) throw new ContentProblem(503, "search_preparing");
        if (q.isBlank()) {
            if (slug != null) throw new ContentProblem(422, "validation_failed");
            return new Result(q, List.of(), null, brand, null, null);
        }
        if (context.index() == null) {
            if (!context.hasRelease()) return new Result(q, List.of(), null, brand, null, null);
            throw new ContentProblem(503, "search_preparing");
        }
        String binding = context.siteId() + "|" + context.revision() + "|" + context.searchKey() + "|"
                + digest(context.index()) + "|" + digest(q) + "|" + context.binding() + "|" + slug;
        int offset = decode(cursor, binding);
        var hits = new ArrayList<Hit>();
        var spaces = new HashMap<UUID, SiteSnapshot.Space>();
        context.spaces().forEach(space -> spaces.put(space.id(), space));
        var selected = slug == null
                ? null
                : context.spaces().stream()
                        .filter(space -> space.slug().equals(slug))
                        .findFirst()
                        .orElseThrow();
        String next = null;
        int scanned = 0;
        try {
            while (true) {
                if ((scanned += 100) > 100000) throw new ContentProblem(422, "search_limit_exceeded");
                if (!engine.isHealthy()) throw ContentProblem.unavailable();
                int position = offset;
                var rows = candidates.get(
                        context.index() + "\n" + q + "\n" + position,
                        ignored -> candidates(context.index(), q, position));
                if (rows.isEmpty()) break;
                var ids = rows.stream()
                        .map(row -> UUID.fromString(String.valueOf(row.get("pageId"))))
                        .toList();
                var pages = new HashMap<UUID, SiteSnapshot.Page>();
                publication
                        .searchPages(host, ids, context.revision(), credential)
                        .forEach(page -> pages.put(page.id(), page));
                for (int i = 0; i < rows.size(); i++) {
                    var row = rows.get(i);
                    var page = pages.get(ids.get(i));
                    if (page == null
                            || (selected != null && !selected.id().equals(page.spaceId()))
                            || !page.contentHash().equals(String.valueOf(row.get("contentHash")))) continue;
                    if (hits.size() == limit) {
                        next = encode(binding, offset + i);
                        break;
                    }
                    hits.add(hit(row, page, spaces.get(page.spaceId())));
                }
                offset += rows.size();
                if (next != null || rows.size() < 32) break;
            }
        } catch (MeilisearchException failure) {
            metrics.counter("edition.delivery.search.unavailable").increment();
            throw ContentProblem.unavailable();
        }
        var latest = publication.searchContext(host, slug, snapshot, credential);
        if (!"ok".equals(latest.outcome())) throw ContentProblem.publication(latest.outcome());
        if (!context.equals(latest.document())) throw new ContentProblem(409, "search_changed");
        if (hits.isEmpty()) metrics.counter("edition.delivery.search.zero").increment();
        return new Result(q, List.copyOf(hits), next, brand, null, null);
    }

    private static Hit hit(Map<String, Object> row, SiteSnapshot.Page page, SiteSnapshot.Space space) {
        Object formatted = row.get("_formatted");
        String snippet = formatted instanceof Map<?, ?> values && values.get("body") != null
                ? String.valueOf(values.get("body"))
                : "";
        snippet = Jsoup.clean(
                snippet,
                "",
                Safelist.none().addTags("mark"),
                new org.jsoup.nodes.Document.OutputSettings().prettyPrint(false));
        return new Hit(page.path(), page.title(), space.slug(), space.name(), snippet);
    }

    private List<HashMap<String, Object>> candidates(String stored, String query, int offset) {
        var segments = JSON.readValue(stored, SearchSegment[].class);
        var multi = new MultiSearchRequest();
        for (var segment : segments)
            multi.addQuery(new IndexSearchRequest(segment.indexUid())
                    .setQuery(query)
                    .setOffset(null)
                    .setLimit(null)
                    .setAttributesToRetrieve(new String[] {"pageId", "contentHash"})
                    .setAttributesToHighlight(new String[] {"body"})
                    .setAttributesToCrop(new String[] {"body"})
                    .setCropLength(35)
                    .setHighlightPreTag("<mark>")
                    .setHighlightPostTag("</mark>"));
        return engine.multiSearch(
                        multi, new MultiSearchFederation().setLimit(32).setOffset(offset))
                .getHits();
    }

    private String encode(String binding, int offset) {
        String payload = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString((binding + "|" + offset).getBytes(StandardCharsets.UTF_8));
        return payload + "." + sign(payload);
    }

    private int decode(String cursor, String binding) {
        if (cursor == null || cursor.isBlank()) return 0;
        if (cursor.length() > 1024) throw new ContentProblem(422, "cursor_invalid");
        String[] parts = cursor.split("\\.", -1);
        if (parts.length != 2
                || !MessageDigest.isEqual(
                        sign(parts[0]).getBytes(StandardCharsets.UTF_8), parts[1].getBytes(StandardCharsets.UTF_8)))
            throw new ContentProblem(422, "cursor_invalid");
        try {
            String data = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
            int last = data.lastIndexOf('|');
            if (last < 0) throw new IllegalArgumentException();
            if (!data.substring(0, last).equals(binding)) throw new ContentProblem(409, "search_changed");
            int offset = Integer.parseInt(data.substring(last + 1));
            if (offset < 0) throw new IllegalArgumentException();
            return offset;
        } catch (IllegalArgumentException invalid) {
            throw new ContentProblem(422, "cursor_invalid");
        }
    }

    private String sign(String data) {
        try {
            var mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key, "HmacSHA256"));
            return Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.GeneralSecurityException impossible) {
            throw new IllegalStateException(impossible);
        }
    }

    private static String digest(String text) {
        try {
            return HexFormat.of()
                    .formatHex(MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException impossible) {
            throw new IllegalStateException(impossible);
        }
    }
}
