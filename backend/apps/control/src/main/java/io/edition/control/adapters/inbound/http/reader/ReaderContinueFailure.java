package io.edition.control.adapters.inbound.http.reader;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.util.HtmlUtils;

/** 无脚本续期遇到依赖故障时的页面：状态码保持 503/504，正文带请求号，凭据未动，链接回原页再试。 */
final class ReaderContinueFailure {
    static final int RETRY_SECONDS = 5;

    private ReaderContinueFailure() {}

    static ResponseEntity<String> page(int status, String returnTo, String requestId) {
        var back = HtmlUtils.htmlEscape(returnTo);
        var id = HtmlUtils.htmlEscape(requestId);
        var html = "<!doctype html><html lang=\"zh-CN\"><head><meta charset=\"utf-8\">"
                + "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
                + "<meta name=\"robots\" content=\"noindex\"><title>暂时无法继续阅读</title></head><body><main>"
                + "<h1>暂时无法继续阅读</h1><p role=\"alert\">服务暂时不可用，阅读会话已保留，请稍后重试。</p>"
                + "<p><a href=\"" + back + "\">返回并重试</a></p>"
                + "<p><small>请求号：<code>" + id + "</code></small></p></main></body></html>";
        return ResponseEntity.status(status)
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.RETRY_AFTER, Integer.toString(RETRY_SECONDS))
                .contentType(MediaType.parseMediaType("text/html;charset=UTF-8"))
                .body(html);
    }
}
