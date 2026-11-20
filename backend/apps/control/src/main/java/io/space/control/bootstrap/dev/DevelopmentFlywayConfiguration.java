package io.space.control.bootstrap.dev;

import org.springframework.boot.flyway.autoconfigure.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/** Development uses the same fail-closed migration rule as other environments. */
@Configuration(proxyBeanMethods = false)
@Profile("dev")
class DevelopmentFlywayConfiguration {
    @Bean
    FlywayMigrationStrategy migrateWithoutCleanup() {
        return flyway -> flyway.migrate();
    }
}
