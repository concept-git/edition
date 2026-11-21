package io.edition.shared;

import static org.junit.jupiter.api.Assertions.*;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class ConsumerValuesTest {
    @Test
    void aCursorResumesAfterTheLastReturnedRowEvenWhenTimestampsTie() {
        var time = Instant.parse("2025-10-01T10:00:00Z");
        var rows = List.of(new KeysetCursor(time, UUID.randomUUID()), new KeysetCursor(time, UUID.randomUUID()));
        var first = PageWindow.of(rows, 1, KeysetCursor::encode);
        assertEquals(List.of(rows.getFirst()), first.items());
        assertEquals(Optional.of(rows.getFirst()), KeysetCursor.decode(first.nextCursor()));
        assertNull(PageWindow.of(rows, 2, KeysetCursor::encode).nextCursor());
        assertThrows(IllegalArgumentException.class, () -> PageWindow.of(rows, 0, KeysetCursor::encode));
    }

    @Test
    void anAbsentCursorStartsAtTheBeginningWhileACorruptOneIsRejected() {
        assertTrue(KeysetCursor.decode(null).isEmpty());
        assertTrue(KeysetCursor.decode(" ").isEmpty());
        for (String invalid : List.of("not a cursor", "YWJj")) {
            assertThrows(IllegalArgumentException.class, () -> KeysetCursor.decode(invalid));
        }
    }

    @Test
    void textAndFileClientsAgreeOnThePublishedContentHash() {
        String expected = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";
        assertEquals(expected, Sha256.hex("abc"));
        assertEquals(expected, Sha256.hex(new byte[] {97, 98, 99}));
    }

    @Test
    void validationReportsUsableFieldNamesAndReasonCodes() {
        var violation = new ValidationViolation(" title ", " required ");
        assertEquals("title", violation.field());
        assertEquals("required", violation.code());
        assertThrows(IllegalArgumentException.class, () -> new ValidationViolation("title", " "));
    }
}
