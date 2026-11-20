package io.space.control.entry.http.reader;

import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
class ReaderCommandContract {
    @Bean
    OpenApiCustomizer managementContract() {
        return api -> {
            api.getPaths().keySet().removeIf(path -> path.startsWith("/_auth/"));
            var schemas = api.getComponents().getSchemas();
            schemas.remove("Visit");
            schemas.remove("History");
            schemas.remove("PartialHistory");
            schemas.remove("ReaderSessionLogin");
            schemas.remove("ReaderSessionOpened");
            schemas.remove("ReaderSessionState");
            schemas.remove("PartialReaderSessionState");
        };
    }
}
