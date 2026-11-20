package io.space.testing;

import com.zaxxer.hikari.HikariDataSource;
import javax.sql.DataSource;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.flyway.autoconfigure.FlywayDataSource;
import org.springframework.boot.jdbc.autoconfigure.DataSourceProperties;
import org.springframework.boot.jdbc.autoconfigure.JdbcConnectionDetails;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;

/** Real PostgreSQL fixture owner is distinct from the RLS-restricted code under test. */
@Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.Import(DatabaseScope.class)
public class ConceptDatabaseConfiguration {
    @Bean("migrationDataSource")
    @FlywayDataSource
    DataSource migrationDataSource(DataSourceProperties properties, ObjectProvider<JdbcConnectionDetails> details) {
        return pool(properties, details);
    }

    @Bean
    @Primary
    HikariDataSource dataSource(DataSourceProperties properties, ObjectProvider<JdbcConnectionDetails> details) {
        var pool = pool(properties, details);
        pool.setConnectionInitSql("set role space_app");
        return pool;
    }

    @Bean("intentDataSource")
    HikariDataSource intentDataSource(DataSourceProperties properties, ObjectProvider<JdbcConnectionDetails> details) {
        var pool = pool(properties, details);
        pool.setConnectionInitSql("set role space_app");
        return pool;
    }

    @Bean
    @Primary
    JdbcTemplate jdbcTemplate(DataSource source) {
        return new JdbcTemplate(source);
    }

    @Bean("fixtureJdbcTemplate")
    JdbcTemplate fixtureJdbcTemplate(@Qualifier("migrationDataSource") DataSource source) {
        return new JdbcTemplate(source);
    }

    private HikariDataSource pool(DataSourceProperties properties, ObjectProvider<JdbcConnectionDetails> details) {
        var pool = new HikariDataSource();
        var connection = details.getIfAvailable();
        pool.setJdbcUrl(connection == null ? properties.determineUrl() : connection.getJdbcUrl());
        pool.setUsername(connection == null ? properties.determineUsername() : connection.getUsername());
        pool.setPassword(connection == null ? properties.determinePassword() : connection.getPassword());
        pool.setMaximumPoolSize(4);
        pool.setMinimumIdle(0);
        return pool;
    }
}
