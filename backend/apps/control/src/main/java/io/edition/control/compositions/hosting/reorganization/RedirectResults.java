package io.edition.control.compositions.hosting.reorganization;

import io.edition.concepts.redirect.api.RedirectApi;

/** 把概念注册结果翻译为 flow 的有限错误，供手动与自动重定向共用。 */
final class RedirectResults {
    private RedirectResults() {}

    static RedirectApi.Rule registered(RedirectApi.RegisterResult result) {
        return switch (result) {
            case RedirectApi.RegisterResult.Registered registered -> registered.rule();
            case RedirectApi.RegisterResult.PathInvalid ignored ->
                throw new ReorganizationTypes.RedirectPathInvalidException();
        };
    }
}
