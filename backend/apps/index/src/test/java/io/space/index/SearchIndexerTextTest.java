package io.space.index;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.delivery.contract.SiteSnapshot;
import io.space.index.compositions.SearchIndexer;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class SearchIndexerTextTest {
    @Test
    void sourceFormatsIndexLiteralTextWhileHtmlIndexesRenderedText() {
        SearchIndexer worker = new SearchIndexer(null, null, null);
        String source = "<h1>Heading</h1>\n<item>Value</item>";
        for (String format : List.of("TXT", "JSON", "XML")) {
            var text = worker.extractText(page(format, source));
            assertThat(text.headings()).isEmpty();
            assertThat(text.body()).isEqualTo(source);
        }
        var html = worker.extractText(page("HTML", source));
        assertThat(html.headings()).containsExactly("Heading");
        assertThat(html.body()).isEqualTo("Heading Value");
    }

    private static SiteSnapshot.Page page(String format, String content) {
        return new SiteSnapshot.Page(
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID(),
                "/docs/page",
                "Page",
                format,
                "same-content-hash",
                content,
                Map.of(),
                Map.of(),
                List.of(),
                null);
    }
}
