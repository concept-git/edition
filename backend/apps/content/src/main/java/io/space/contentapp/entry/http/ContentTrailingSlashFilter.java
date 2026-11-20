package io.space.contentapp.entry.http;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** MVC 匹配前去掉阅读内容路径的尾斜杠。认证与控制台前缀保持原样。 */
public @Component final class ContentTrailingSlashFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        if ((request.getMethod().equals("GET") || request.getMethod().equals("HEAD"))
                && readerPath(path)
                && path.length() > 1
                && path.endsWith("/")) {
            String query = request.getQueryString() == null ? "" : '?' + request.getQueryString();
            response.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);
            response.setHeader("Location", path.substring(0, path.length() - 1) + query);
            return;
        }
        chain.doFilter(request, response);
    }

    private static boolean readerPath(String path) {
        if (path.startsWith("/api/")) return path.startsWith("/api/content/");
        return !(path.startsWith("/auth/")
                || path.startsWith("/admin/")
                || path.startsWith("/ops/")
                || path.startsWith("/audit/")
                || path.startsWith("/stats/")
                || path.startsWith("/webhooks/")
                || path.startsWith("/releases/"));
    }
}
