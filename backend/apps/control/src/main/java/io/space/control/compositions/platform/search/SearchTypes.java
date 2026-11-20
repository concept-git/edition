package io.space.control.compositions.platform.search;

import static io.space.control.compositions.platform.search.SearchTypes.*;

import io.space.concepts.search.api.SearchApi;
import io.space.control.compositions.*;
import java.util.*;

/** Public composition inputs, results, and finite refusal types. */
public final class SearchTypes {
    private SearchTypes() {}

    public record Configuration(List<String> fields, long revision) {
        static Configuration of(SearchApi.Boost boost) {
            return new Configuration(boost.fields(), boost.revision());
        }
    }
}
