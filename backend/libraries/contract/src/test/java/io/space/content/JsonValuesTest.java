package io.space.content;

import static org.junit.jupiter.api.Assertions.*;

import java.util.*;
import org.junit.jupiter.api.Test;

/** JSON interpretation is immutable and bounded before it is shared across application processes. */
class JsonValuesTest {
    @Test
    void copiesNestedObjectsAndListsWithoutKeepingMutableInputReferences() {
        var child = new ArrayList<Object>(Arrays.asList(null, true, 2, "text"));
        var source = new HashMap<String, Object>();
        source.put("z", child);
        source.put("a", Map.of("value", false));

        var result = JsonValues.object(source);
        child.clear();
        source.clear();

        assertEquals(List.of("a", "z"), new ArrayList<>(result.keySet()));
        assertEquals(Arrays.asList(null, true, 2, "text"), result.get("z"));
        assertThrows(UnsupportedOperationException.class, () -> result.put("extra", 1));
        assertEquals(Map.of(), JsonValues.object(null));
    }

    @Test
    void refusesNonJsonValuesNonFiniteNumbersAndNonStringObjectKeys() {
        for (Object value : List.of(Double.NaN, Double.POSITIVE_INFINITY, new Object(), Map.of(1, "invalid"))) {
            assertThrows(IllegalArgumentException.class, () -> JsonValues.object(Map.of("value", value)));
        }
    }

    @Test
    void refusesExcessiveDepthAndNodeCount() {
        Object nested = "leaf";
        for (int depth = 0; depth < 65; depth++) nested = Map.of("child", nested);
        Object tooDeep = nested;
        assertThrows(IllegalArgumentException.class, () -> JsonValues.object(Map.of("root", tooDeep)));
        assertThrows(
                IllegalArgumentException.class,
                () -> JsonValues.object(Map.of("items", Collections.nCopies(20000, 1))));
    }

    @Test
    void canonicalIdentitySortsKeysNormalizesNumbersAndDistinguishesValueTypes() {
        assertEquals(
                JsonValues.canonical(Map.of("b", 1.0, "a", List.of(2))),
                JsonValues.canonical(Map.of("a", List.of(2.0), "b", 1)));
        assertEquals("n", JsonValues.canonical(null));
        assertEquals("t", JsonValues.canonical(true));
        assertEquals("f", JsonValues.canonical(false));
        assertNotEquals(JsonValues.canonical("1"), JsonValues.canonical(1));
        assertThrows(IllegalArgumentException.class, () -> JsonValues.canonical(new Object()));
    }
}
