package io.space.control.support;

import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.jdbc.autoconfigure.JdbcTemplateAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;

/**
 * 测试夹具与真值断言专用的数据库入口，走 Flyway 的 owner 连接池。
 *
 * <p>业务连接以 {@code space_app} 身份运行，受 RLS 约束：没有事务级 {@code app.tenant_id}
 * 就读不到也写不进任何租户表——这正是生产语义，不能为了让测试好写而关掉它
 * （{@code io.space.rls.enabled} 在测试中恒为 true）。于是测试的两类需求改走这里：
 * 铺跨租户 fixture，以及不受调用方视角影响地断言落库真值。被测代码本身仍走受限角色，
 * 否则 RLS 就没被验证。
 *
 * <p>本类位于 {@code io.space} 之下，会被 {@code @SpringBootTest} 的组件扫描自动拾取。
 * 这里必须**同时**声明运行时 {@link JdbcTemplate}：{@link JdbcTemplateAutoConfiguration} 的条件是
 * {@code @ConditionalOnMissingBean(JdbcDeletionRecovery.class)}，一旦上下文里出现第二个 JdbcDeletionRecovery，
 * 自动配置整体退避——若不补回来，连生产代码（如租户上下文写入）都会被换成 owner 池，
 * 造成 GUC 与 MyBatis 分处两条连接的诡异失败。
 */
@Configuration
public class FixtureDatabaseConfiguration {

    /** 测试注入夹具连接时用的限定名。 */
    public static final String FIXTURE_JDBC = "fixtureJdbcTemplate";

    @Bean
    @Primary
    JdbcTemplate jdbcTemplate(DataSource runtimeDataSource) {
        return new JdbcTemplate(runtimeDataSource);
    }

    @Bean(FIXTURE_JDBC)
    JdbcTemplate fixtureJdbcTemplate(@Qualifier("migrationDataSource") DataSource migrationDataSource) {
        return new JdbcTemplate(migrationDataSource);
    }
}
