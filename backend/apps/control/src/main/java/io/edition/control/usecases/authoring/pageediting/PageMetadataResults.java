package io.edition.control.usecases.authoring.pageediting;

import io.edition.control.modules.page.api.PageApi;
import io.edition.control.usecases.resource.PageNotFoundException;

/** 元数据动作的有限输出 → flow 异常；NotFound 在归属核对之后属并发删除，同样报 page_not_found。 */
final class PageMetadataResults {
    private PageMetadataResults() {}

    static PageApi.View changed(PageApi.MetadataResult result) {
        return switch (result) {
            case PageApi.MetadataResult.Changed value -> value.page();
            case PageApi.MetadataResult.NotFound ignored -> throw new PageNotFoundException();
            case PageApi.MetadataResult.Invalid invalid ->
                throw new PageEditingTypes.MetadataInvalidException(invalid.field(), invalid.code());
        };
    }
}
