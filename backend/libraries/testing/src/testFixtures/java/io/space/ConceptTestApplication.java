package io.space;

import java.time.Clock;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.modulith.Modulithic;

/** Test-only assembly: the classpath contains one concept and technical facilities. */
@Modulithic(systemName = "ConceptContract")
@SpringBootApplication
@org.springframework.context.annotation.Import(io.space.testing.ConceptDatabaseConfiguration.class)
public class ConceptTestApplication {
    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }

    @Bean
    tools.jackson.databind.json.JsonMapper jsonMapper() {
        return tools.jackson.databind.json.JsonMapper.builder().build();
    }
}
