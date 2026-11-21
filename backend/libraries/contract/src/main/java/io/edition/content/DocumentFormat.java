package io.edition.content;

import java.util.HashSet;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

/** Published text page formats shared by control, delivery, and reader processes. */
public enum DocumentFormat {
    MARKDOWN("markdown", "md", "text/markdown", BodyKind.MARKDOWN, "markdown"),
    HTML("html", "html", "text/html", BodyKind.HTML, "htm"),
    TXT("txt", "txt", "text/plain", BodyKind.SOURCE),
    JSON("json", "json", "application/json", BodyKind.SOURCE),
    XML("xml", "xml", "application/xml", BodyKind.SOURCE);

    public enum BodyKind {
        MARKDOWN,
        HTML,
        SOURCE
    }

    /** Bean Validation annotations require a compile-time constant. Keep this aligned with values(). */
    public static final String WIRE_PATTERN = "markdown|html|txt|json|xml";

    private final String wireName;
    private final String extension;
    private final String mediaType;
    private final BodyKind bodyKind;
    private final Set<String> fileExtensions;

    DocumentFormat(String wireName, String extension, String mediaType, BodyKind bodyKind, String... aliases) {
        this.wireName = wireName;
        this.extension = extension;
        this.mediaType = mediaType;
        this.bodyKind = bodyKind;
        var extensions = new HashSet<String>();
        extensions.add(extension);
        extensions.addAll(java.util.List.of(aliases));
        this.fileExtensions = Set.copyOf(extensions);
    }

    public String wireName() {
        return wireName;
    }

    public String extension() {
        return extension;
    }

    public String mediaType() {
        return mediaType + ";charset=UTF-8";
    }

    public BodyKind bodyKind() {
        return bodyKind;
    }

    public static DocumentFormat fromStored(String value) {
        return valueOf(value.toUpperCase(Locale.ROOT));
    }

    public static Optional<DocumentFormat> fromWire(String value) {
        for (DocumentFormat format : values()) {
            if (format.wireName.equals(value)) return Optional.of(format);
        }
        return Optional.empty();
    }

    public static Optional<DocumentFormat> fromFileName(String name) {
        String lower = name.toLowerCase(Locale.ROOT);
        int dot = lower.lastIndexOf('.');
        if (dot < 0) return Optional.empty();
        String suffix = lower.substring(dot + 1);
        for (DocumentFormat format : values()) {
            if (format.fileExtensions.contains(suffix)) return Optional.of(format);
        }
        return Optional.empty();
    }
}
