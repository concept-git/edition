package io.space.concepts.importformat;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.importformat.api.*;
import io.space.concepts.importformat.attachments.AttachmentTypes;
import org.junit.jupiter.api.Test;

class AttachmentTypesTest {
    private static final byte[] PNG = {
        (byte) 0x89,
        'P',
        'N',
        'G',
        0x0D,
        0x0A,
        0x1A,
        0x0A,
        0,
        0,
        0,
        0x0D,
        'I',
        'H',
        'D',
        'R',
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1,
        8,
        6,
        0,
        0,
        0,
        0x1F,
        0x15,
        (byte) 0xC4,
        (byte) 0x89,
        0,
        0,
        0,
        0x0A,
        'I',
        'D',
        'A',
        'T',
        0x78,
        (byte) 0x9C,
        0x63,
        0,
        1,
        0,
        0,
        5,
        0,
        1,
        0x0D,
        0x0A,
        0x2D,
        (byte) 0xB4,
        0,
        0,
        0,
        0,
        'I',
        'E',
        'N',
        'D',
        (byte) 0xAE,
        0x42,
        0x60,
        (byte) 0x82
    };

    @Test
    void sniffsRealPngMagicAndInspectsStoredAttachment() {
        assertThat(AttachmentTypes.sniff(PNG)).isEqualTo("image/png");
        assertThat(AttachmentTypes.inspect("image.png", PNG).sha256())
                .isEqualTo("ebf4f635a17d10d6eb46ba680b70142419aa3220f228001a036d311a22ee9d2a");
        assertThat(AttachmentTypes.sniff("not-an-image".getBytes())).isNull();
    }
}
