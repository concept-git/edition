package io.space.control.support;

import java.sql.Connection;
import java.util.concurrent.atomic.AtomicLong;
import org.apache.ibatis.executor.statement.StatementHandler;
import org.apache.ibatis.plugin.Interceptor;
import org.apache.ibatis.plugin.Intercepts;
import org.apache.ibatis.plugin.Invocation;
import org.apache.ibatis.plugin.Signature;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

/** Counts prepared SQL on the real import worker, without logging SQL bodies or credentials. */
@TestConfiguration(proxyBeanMethods = false)
public class ImportSqlCounter {
    @Bean
    public Counter importStatementCounter() {
        return new Counter();
    }

    @Intercepts(
            @Signature(
                    type = StatementHandler.class,
                    method = "prepare",
                    args = {Connection.class, Integer.class}))
    public static final class Counter implements Interceptor {
        private final AtomicLong statements = new AtomicLong();

        @Override
        public Object intercept(Invocation invocation) throws Throwable {
            if (Thread.currentThread().getName().startsWith("import-job-")) statements.incrementAndGet();
            return invocation.proceed();
        }

        public long count() {
            return statements.get();
        }
    }
}
