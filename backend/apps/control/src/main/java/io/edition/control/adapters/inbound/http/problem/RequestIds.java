package io.edition.control.adapters.inbound.http.problem;

import jakarta.servlet.http.HttpServletRequest;

/** Request correlation id shared by filters and problem responses. */
public final class RequestIds {
    public static final String HEADER = "X-Request-Id";
    static final String ATTRIBUTE = RequestIds.class.getName() + ".requestId";

    private RequestIds() {}

    public static String requestId(HttpServletRequest request) {
        var requestId = request.getAttribute(ATTRIBUTE);
        return requestId instanceof String value ? value : "unknown";
    }

    public static void bind(HttpServletRequest request, String requestId) {
        request.setAttribute(ATTRIBUTE, requestId);
    }
}
