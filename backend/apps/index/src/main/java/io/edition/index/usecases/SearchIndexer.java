package io.edition.index.usecases;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.vladsch.flexmark.html.HtmlRenderer;
import com.vladsch.flexmark.parser.Parser;
import io.edition.content.DocumentFormat;
import io.edition.delivery.contract.SearchSegment;
import io.edition.delivery.contract.SiteSnapshot;
import java.util.*;
import org.jsoup.Jsoup;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

public @Component final class SearchIndexer {
    private final SearchQueue store;
    private final SearchEngine engine;
    private final JsonMapper json;
    private final Parser parser = Parser.builder().build();
    private final HtmlRenderer renderer = HtmlRenderer.builder().build();
    private final Cache<String, Text> texts = Caffeine.newBuilder()
            .maximumWeight(128L * 1024 * 1024)
            .weigher((String k, Text v) -> Math.max(1, v.body().length() * 2))
            .build();

    public SearchIndexer(SearchQueue store, SearchEngine engine, JsonMapper json) {
        this.store = store;
        this.engine = engine;
        this.json = json;
    }

    public record Text(List<String> headings, String body) {}

    public record Document(UUID pageId, String contentHash, String title, List<String> headings, String body) {}

    public void poll() {
        try {
            UUID token = UUID.randomUUID();
            var records = store.claimSearch(token);
            for (var work : records) buildSearchIndex(work);
        } catch (org.springframework.dao.DataAccessException unavailable) {
            LoggerFactory.getLogger(getClass()).warn("search queue unavailable");
        }
    }

    private void buildSearchIndex(SearchQueue.SearchTask work) {
        var created = new ArrayList<String>();
        long started = System.nanoTime();
        try {
            var input = store.searchInput(work).orElseThrow(() -> new BuildFailure("superseded search job"));
            var searchSettings = input.settings();
            long count = input.pageCount();
            int partitions = count < 1000 ? 1 : 4;
            var buckets = new ArrayList<List<SiteSnapshot.Page>>();
            for (int i = 0; i < partitions; i++) buckets.add(new ArrayList<>());
            for (int offset = 0; ; offset += 1000) {
                var pages = store.searchPages(work, offset, 1000);
                if (pages.isEmpty()) break;
                if (!heartbeat(work)) throw new BuildFailure("superseded search job");
                for (var page : pages)
                    buckets.get(Math.floorMod(page.id().hashCode(), partitions)).add(page);
            }
            if (buckets.stream().mapToLong(List::size).sum() != count) throw new BuildFailure("superseded search job");
            String previous = store.searchIndex(work);
            var prior = segments(previous);
            var complete = new ArrayList<SearchSegment>();
            var submitted = new ArrayList<SearchEngine.Task>();
            for (int bucket = 0; bucket < partitions; bucket++) {
                var pages = buckets.get(bucket);
                String fingerprint = fingerprint(pages, searchSettings);
                if (prior.size() == partitions
                        && prior.get(bucket).fingerprint().equals(fingerprint)) {
                    complete.add(prior.get(bucket));
                    continue;
                }
                if (!heartbeat(work)) throw new BuildFailure("superseded search job");
                String index = "site-" + work.site() + "-" + work.epoch() + "-" + bucket + "-" + work.token();
                created.add(index);
                store.rememberGarbage(index);
                await(engine.createIndex(index, "pageId"));
                await(engine.updateSettings(index, searchSettings.fields(), pages.size()));
                for (int offset = 0; offset < pages.size(); offset += 1000) {
                    var documents = new ArrayList<Document>();
                    for (var page : pages.subList(offset, Math.min(pages.size(), offset + 1000))) {
                        var text = texts.get(contentKey(page), key -> extractText(page));
                        documents.add(new Document(
                                page.id(), page.contentHash(), page.title(), text.headings(), text.body()));
                    }
                    submitted.add(engine.addDocuments(index, json.writeValueAsString(documents)));
                }
                complete.add(new SearchSegment(index, fingerprint));
            }
            for (var task : submitted) await(task);
            if (!store.completeSearch(work, complete)) throw new BuildFailure("superseded search job");
            LoggerFactory.getLogger(getClass())
                    .info(
                            "search generation complete site={} epoch={} changedParts={}"
                                    + " totalParts={} durationMs={}",
                            work.site(),
                            work.epoch(),
                            created.size(),
                            partitions,
                            (System.nanoTime() - started) / 1_000_000);
        } catch (SearchEngine.Unavailable
                | BuildFailure
                | tools.jackson.core.JacksonException
                | org.springframework.dao.DataAccessException failure) {
            LoggerFactory.getLogger(getClass())
                    .warn("search build failed site={} epoch={}", work.site(), work.epoch(), failure);
            store.failSearch(work, failureCode(failure));
            created.forEach(this::garbage);
        }
    }

    public Text extractText(SiteSnapshot.Page page) {
        return switch (DocumentFormat.fromStored(page.format()).bodyKind()) {
            case SOURCE -> new Text(List.of(), page.content());
            case MARKDOWN -> textFromHtml(renderer.render(parser.parse(page.content())));
            case HTML -> textFromHtml(page.content());
        };
    }

    private static Text textFromHtml(String html) {
        var doc = Jsoup.parseBodyFragment(html);
        return new Text(doc.select("h1,h2,h3,h4,h5,h6").eachText(), doc.text());
    }

    private static String failureCode(RuntimeException failure) {
        if (failure instanceof tools.jackson.core.JacksonException) return "search_contract_invalid";
        if (failure instanceof BuildFailure) return "search_generation_failed";
        return "search_dependency_unavailable";
    }

    private List<SearchSegment> segments(String stored) {
        if (stored == null) return List.of();
        return List.of(json.readValue(stored, SearchSegment[].class));
    }

    private static String fingerprint(List<SiteSnapshot.Page> pages, SiteSnapshot.SearchSettings settings) {
        try {
            var digest = java.security.MessageDigest.getInstance("SHA-256");
            digest.update((settings.revision() + ":" + String.join(",", settings.fields()) + "\n")
                    .getBytes(java.nio.charset.StandardCharsets.UTF_8));
            for (var page : pages)
                digest.update(
                        (page.id() + ":" + contentKey(page) + "\n").getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest.digest());
        } catch (java.security.NoSuchAlgorithmException impossible) {
            throw new IllegalStateException(impossible);
        }
    }

    private static String contentKey(SiteSnapshot.Page page) {
        var definition = page.contentTypeDefinition();
        return page.format()
                + ':'
                + page.contentHash()
                + ':'
                + page.contentProfile().fingerprintMaterial()
                + ':'
                + (definition == null ? "" : definition.digest());
    }

    private boolean heartbeat(SearchQueue.SearchTask work) {
        return store.renewSearch(work);
    }

    private void await(SearchEngine.Task info) {
        await(info, false);
    }

    private void await(SearchEngine.Task info, boolean allowMissing) {
        long deadline = System.nanoTime() + java.time.Duration.ofSeconds(90).toNanos();
        while (true) {
            SearchEngine.TaskView task = engine.task(info.uid());
            if (task.status() == SearchEngine.Status.SUCCEEDED) return;
            if (allowMissing
                    && task.status() == SearchEngine.Status.FAILED
                    && "index_not_found".equals(task.errorCode())) return;
            if (task.status() == SearchEngine.Status.FAILED || task.status() == SearchEngine.Status.CANCELED)
                throw new BuildFailure("Meilisearch task failed: " + info.uid());
            if (System.nanoTime() >= deadline) throw new BuildFailure("Meilisearch task timed out");
            java.util.concurrent.locks.LockSupport.parkNanos(50_000_000);
            if (Thread.currentThread().isInterrupted()) throw new BuildFailure("search worker interrupted");
        }
    }

    private static final class BuildFailure extends RuntimeException {
        BuildFailure(String message) {
            super(message);
        }
    }

    private void garbage(String index) {
        store.postponeGarbage(index);
    }

    public void cleanup() {
        for (String index : store.collectableIndexes()) {
            try {
                await(engine.deleteIndex(index), true);
                store.deleteGarbage(index);
            } catch (SearchEngine.Unavailable | BuildFailure failure) {
                LoggerFactory.getLogger(getClass()).warn("search cleanup unavailable index={}", index);
            }
        }
    }
}
