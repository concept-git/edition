package io.edition.control.usecases.releases.bundleimport;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/** 导入 worker 线程池：202 在受理事务提交后立即返回，流水线在池内执行。 */
@Configuration
class ImportJobExecutorConfig {
    static final String BEAN = "importJobExecutor";

    @Bean(name = BEAN)
    ThreadPoolTaskExecutor importJobExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setThreadNamePrefix("import-job-");
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(64);
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        return executor;
    }
}
