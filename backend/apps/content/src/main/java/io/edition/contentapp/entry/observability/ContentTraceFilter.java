package io.edition.contentapp.entry.observability;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

public @Component final class ContentTraceFilter extends OncePerRequestFilter {
    private final ContentAnalytics analytics;

    public ContentTraceFilter(ContentAnalytics analytics) {
        this.analytics = analytics;
    }

    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String id = request.getHeader("X-Request-Id");
        if (id == null || !id.matches("[A-Za-z0-9_-]{1,100}"))
            id = UUID.randomUUID().toString();
        request.setAttribute("traceId", id);
        response.setHeader("X-Request-Id", id);
        ContentAnalytics.begin();
        try {
            chain.doFilter(request, response);
        } finally {
            analytics.finish(request, response.getStatus());
        }
    }
}
