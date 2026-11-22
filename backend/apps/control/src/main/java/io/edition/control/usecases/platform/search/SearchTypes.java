package io.edition.control.usecases.platform.search;

import static io.edition.control.usecases.platform.search.SearchTypes.*;

import io.edition.control.modules.search.api.SearchApi;
import io.edition.control.usecases.*;
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
