package io.edition.control.compositions.auditing;

import io.edition.concepts.audit.api.AuditApi;
import io.edition.control.compositions.*;
import io.edition.control.compositions.flow.FlowException;
import java.lang.reflect.Method;
import org.aopalliance.intercept.MethodInterceptor;
import org.springframework.aop.Advisor;
import org.springframework.aop.support.DefaultPointcutAdvisor;
import org.springframework.aop.support.StaticMethodMatcherPointcut;
import org.springframework.context.annotation.*;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Configuration(proxyBeanMethods = false)
@EnableTransactionManagement(order = 0)
public class AuditConfiguration {
    @Bean
    @Role(org.springframework.beans.factory.config.BeanDefinition.ROLE_INFRASTRUCTURE)
    static Advisor conceptAudit(
            org.springframework.beans.factory.ObjectProvider<AuditApi> audit,
            org.springframework.beans.factory.ObjectProvider<io.micrometer.core.instrument.MeterRegistry> meters) {
        var pointcut = new StaticMethodMatcherPointcut() {
            public boolean matches(Method method, Class<?> type) {
                return AuditActionFields.action(method, type);
            }
        };
        var advisor = new DefaultPointcutAdvisor(pointcut, (MethodInterceptor) call -> {
            String type = call.getThis().getClass().getSimpleName().replace("Service", "");
            long started = System.nanoTime();
            Object result;
            try {
                result = call.proceed();
            } finally {
                if (type.equals("Release") && call.getMethod().getName().equals("promote"))
                    io.micrometer.core.instrument.Timer.builder("edition.release.promote")
                            .description(
                                    "Release promotion action duration;" + " asynchronous delivery is" + " separate")
                            .publishPercentiles(0.5, 0.99)
                            .publishPercentileHistogram()
                            .register(meters.getObject())
                            .record(System.nanoTime() - started, java.util.concurrent.TimeUnit.NANOSECONDS);
            }
            if (!TransactionSynchronizationManager.isActualTransactionActive())
                throw new IllegalStateException("audited action requires transaction");
            audit.getObject()
                    .append(AuditActionFields.event(
                            "fact",
                            type + "." + call.getMethod().getName(),
                            call.getArguments(),
                            result,
                            AuditActionFields.outcome(
                                    type + "." + call.getMethod().getName(), result)));
            return result;
        });
        advisor.setOrder(100);
        return advisor;
    }

    @Bean
    @Role(org.springframework.beans.factory.config.BeanDefinition.ROLE_INFRASTRUCTURE)
    static Advisor failedFlowAudit(org.springframework.beans.factory.ObjectProvider<AuditApi> audit) {
        var pointcut = new StaticMethodMatcherPointcut() {
            public boolean matches(Method method, Class<?> type) {
                var tx = org.springframework.core.annotation.AnnotatedElementUtils.findMergedAnnotation(
                        method, org.springframework.transaction.annotation.Transactional.class);
                if (tx == null)
                    tx = org.springframework.core.annotation.AnnotatedElementUtils.findMergedAnnotation(
                            type, org.springframework.transaction.annotation.Transactional.class);
                String simple = type.getSimpleName();
                boolean rule = simple.endsWith("UseCase")
                        || simple.endsWith("OnCompletion")
                        || simple.endsWith("OnSchedule")
                        || simple.matches(".*On[A-Z].*");
                return type.getName().startsWith("io.edition.control.compositions.")
                        && rule
                        && java.lang.reflect.Modifier.isPublic(method.getModifiers())
                        && tx != null
                        && !tx.readOnly();
            }
        };
        var advisor = new DefaultPointcutAdvisor(pointcut, (MethodInterceptor) call -> {
            if (RequestAuditContext.current().flow()) return call.proceed();
            try (var context = RequestAuditContext.flow()) {
                boolean succeeded = false;
                String outcome = "unexpected_error";
                try {
                    Object result = call.proceed();
                    succeeded = true;
                    return result;
                } catch (FlowException failure) {
                    outcome = failure.code().value();
                    throw failure;
                } catch (org.springframework.dao.DataAccessException
                        | org.springframework.transaction.TransactionException failure) {
                    outcome = "dependency_unavailable";
                    throw failure;
                } finally {
                    if (!succeeded) {
                        try {
                            audit.getObject()
                                    .failed(AuditActionFields.event(
                                            "attempt",
                                            "Requesting." + call.getMethod().getName(),
                                            call.getArguments(),
                                            null,
                                            outcome));
                        } catch (org.springframework.dao.DataAccessException
                                | org.springframework.transaction.TransactionException unavailable) {
                            org.slf4j.LoggerFactory.getLogger(AuditConfiguration.class)
                                    .atError()
                                    .addKeyValue("event", "audit.unavailable")
                                    .addKeyValue(
                                            "requestId",
                                            RequestAuditContext.current().requestId())
                                    .log("Failure audit unavailable;" + " original operation" + " failure retained");
                        }
                    }
                }
            }
        });
        advisor.setOrder(-100);
        return advisor;
    }
}
