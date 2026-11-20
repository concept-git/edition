package io.space.control.bootstrap;

import com.zaxxer.hikari.HikariDataSource;
import javax.sql.DataSource;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.flyway.autoconfigure.FlywayDataSource;
import org.springframework.boot.jdbc.autoconfigure.DataSourceProperties;
import org.springframework.boot.jdbc.autoconfigure.JdbcConnectionDetails;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/** Flyway keeps owner credentials; runtime connections assume the management NOBYPASSRLS role. */
@Configuration
class RuntimeDataSourceConfiguration {
    private final ObjectProvider<JdbcConnectionDetails> details;
    private final DataSourceProperties properties;

    RuntimeDataSourceConfiguration(ObjectProvider<JdbcConnectionDetails> details, DataSourceProperties properties) {
        this.details = details;
        this.properties = properties;
    }

    @Bean
    @FlywayDataSource
    DataSource migrationDataSource() {
        return dataSource("space-migration");
    }

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource.hikari")
    HikariDataSource dataSource(@Value("${io.space.rls.enabled:true}") boolean rlsEnabled) {
        var pool = dataSource("space-runtime");
        if (rlsEnabled) {
            pool.setConnectionInitSql("set role space_app");
        }
        return pool;
    }

    private HikariDataSource dataSource(String poolName) {
        var pool = new HikariDataSource();
        pool.setPoolName(poolName);
        var connection = details.getIfAvailable();
        pool.setJdbcUrl(connection == null ? properties.determineUrl() : connection.getJdbcUrl());
        pool.setUsername(connection == null ? properties.determineUsername() : connection.getUsername());
        pool.setPassword(connection == null ? properties.determinePassword() : connection.getPassword());
        return pool;
    }
}
