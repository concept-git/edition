package io.edition.contentapp.adapters.inbound.http;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

public @Configuration(proxyBeanMethods = false) class ContentOpenApiConfiguration {
    public @Bean OpenAPI deliveryOpenApi() {
        return new OpenAPI()
                .info(new Info().title("Edition delivery API").version("1.0.0"))
                .servers(List.of(new Server().url("/")));
    }

    @Bean
    OperationCustomizer deliveryOperationTags() {
        return (operation, handler) -> {
            if (handler.getBeanType() == ContentController.class) {
                operation.setTags(List.of("delivery-controller"));
            } else if (handler.getBeanType() == ContentFilesController.class) {
                operation.setTags(List.of("reader-files-controller"));
            }
            return operation;
        };
    }
}
