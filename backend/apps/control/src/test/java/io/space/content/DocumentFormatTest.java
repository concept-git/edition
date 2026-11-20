package io.space.content;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.page.api.PageApi;
import io.space.concepts.release.api.ReleaseApi;
import io.space.control.compositions.authoring.pageediting.PageRenderer;
import java.util.Arrays;
import org.junit.jupiter.api.Test;

class DocumentFormatTest {
    @Test
    void everyPublishedFormatIsUnderstoodByPageAndRelease() {
        assertThat(Arrays.stream(PageApi.Format.values()).map(Enum::name))
                .containsExactlyInAnyOrderElementsOf(
                        Arrays.stream(DocumentFormat.values()).map(Enum::name).toList());
        assertThat(Arrays.stream(ReleaseApi.Format.values()).map(Enum::name))
                .containsExactlyInAnyOrderElementsOf(
                        Arrays.stream(DocumentFormat.values()).map(Enum::name).toList());
        assertThat(DocumentFormat.fromFileName("guide.MARKDOWN")).contains(DocumentFormat.MARKDOWN);
        assertThat(DocumentFormat.fromFileName("guide.HTM")).contains(DocumentFormat.HTML);
        assertThat(DocumentFormat.fromFileName("guide.JSON")).contains(DocumentFormat.JSON);
        assertThat(DocumentFormat.WIRE_PATTERN.split("\\|"))
                .containsExactlyInAnyOrderElementsOf(Arrays.stream(DocumentFormat.values())
                        .map(DocumentFormat::wireName)
                        .toList());
    }

    @Test
    void sourceFormatsPreviewAsEscapedText() {
        PageRenderer renderer = new PageRenderer();
        String source = "<script>alert(1)</script>\n<node key=\"x\">&</node>";
        for (String format : new String[] {"txt", "json", "xml"}) {
            String html = renderer.render(format, source);
            assertThat(html).contains("<pre><code>", "&lt;script&gt;", "&lt;node");
            assertThat(html).doesNotContain("<script>", "<node");
        }
    }
}
