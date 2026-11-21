package io.edition.control.entry.http.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;

/**
 * 附件路由仍走容器 10 MiB multipart；{@code /releases:import} 自己流式解析，以免被全局上限挡住。
 */
@Configuration
class ImportMultipartConfiguration {
    @Bean
    MultipartResolver multipartResolver() {
        StandardServletMultipartResolver attachments = new StandardServletMultipartResolver();
        return new MultipartResolver() {
            @Override
            public boolean isMultipart(HttpServletRequest request) {
                if (importZip(request)) return false;
                return attachments.isMultipart(request);
            }

            @Override
            public MultipartHttpServletRequest resolveMultipart(HttpServletRequest request) throws MultipartException {
                return attachments.resolveMultipart(request);
            }

            @Override
            public void cleanupMultipart(MultipartHttpServletRequest request) {
                attachments.cleanupMultipart(request);
            }
        };
    }

    private static boolean importZip(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return uri != null && uri.contains("/releases:import") && !uri.contains("import-uploads");
    }
}
