package io.space;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.fields;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.methods;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.base.DescribedPredicate;
import com.tngtech.archunit.core.domain.JavaClass;
import com.tngtech.archunit.core.domain.JavaMethod;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchCondition;
import com.tngtech.archunit.lang.ArchRule;
import com.tngtech.archunit.lang.ConditionEvents;
import com.tngtech.archunit.lang.SimpleConditionEvent;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * 概念模块内部 Clean 分层护栏（ADR-0031 与 libraries/CLAUDE.md）。
 * Modulith verify 管模块之间（含 gateway 只见 syncs+shared），本文件管模块之内
 * 与 Modulith 看不见的职责耦合（编排权、HTTP 泄漏、sync 攒状态）。
 * 只分析生产代码：测试类天然要触碰各层（@Autowired 注入、直接建表铺数据）。
 */
@AnalyzeClasses(packages = "io.space", importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureTests {

    private static final String[] CONCEPT_PACKAGES = {"io.space.concepts.."};

    private static final Set<String> LISTENER_ANNOTATIONS = Set.of(
            "org.springframework.modulith.events.ApplicationModuleListener",
            "org.springframework.context.event.EventListener",
            "org.springframework.transaction.event.TransactionalEventListener");

    // allowEmptyShould：规则先于代码生效（骨架期还没有 domain/adapter 包）

    @ArchTest
    static final ArchRule domainStaysPure = noClasses()
            .that()
            .resideInAPackage("..domain..")
            .should()
            .dependOnClassesThat()
            .resideInAnyPackage("org.springframework..", "jakarta.persistence..", "org.apache.ibatis..")
            .as("domain 包是纯 Java：零 Spring/持久化依赖（概念 state 与不变量）")
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule domainDoesNotSeeAdapters = noClasses()
            .that()
            .resideInAPackage("..domain..")
            .should()
            .dependOnClassesThat()
            .resideInAPackage("..adapters..")
            .as("依赖方向只能由外向内：adapter 永不被 domain 依赖")
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule domainDoesNotSeeApplication = noClasses()
            .that()
            .resideInAPackage("..domain..")
            .should()
            .dependOnClassesThat()
            .resideInAPackage("..application..")
            .as("依赖方向只能由外向内：application 永不被 domain 依赖")
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule mappersStayInAdapters = noClasses()
            .that()
            .resideOutsideOfPackage("..adapters..")
            .should()
            .dependOnClassesThat()
            .resideInAPackage("org.apache.ibatis..")
            .as("MyBatis 只出现在 adapter/persistence（Mapper 只被本模块 application 使用）")
            .allowEmptyShould(true);

    /**
     * 概念可以监听**自己**的完成事件（如 Permission 用自身事件精准失效判定缓存）——
     * 那是模块内反应；监听**别人**的事件则是绕开组合层的隐式编排，编排权只属于 syncs 包。
     */
    @ArchTest
    static final ArchRule conceptsOnlyReactToTheirOwnEvents = methods()
            .that(areEventListeners())
            .and()
            .areDeclaredInClassesThat()
            .resideOutsideOfPackage("..compositions..")
            .should(consumeOnlyOwnModuleEvents())
            .as("编排权属于组合层：概念只监听自己的完成事件，跨概念反应一律走 sync")
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule conceptsCarryNoHttpTypes = noClasses()
            .that()
            .resideInAnyPackage(CONCEPT_PACKAGES)
            .should()
            .dependOnClassesThat()
            .resideInAnyPackage(
                    "org.springframework.web..", "org.springframework.http..",
                    "jakarta.servlet..", "io.swagger..")
            .as("概念签名零 HTTP/JSON：协议形态只属于 gateway")
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule syncsHoldNoMutableState = fields().that()
            .areDeclaredInClassesThat()
            .resideInAPackage("..compositions..")
            .and()
            .areNotStatic()
            .should()
            .beFinal()
            .as("sync 是薄编排：组合层积攒自有可变状态 = 该升格为概念，回规格讨论")
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule afterCommitListenersNeverRunWithoutATransaction = methods()
            .that()
            .areDeclaredInClassesThat()
            .resideInAPackage("..compositions..")
            .and()
            .areAnnotatedWith(TransactionalEventListener.class)
            .should(new ArchCondition<>("等待真实事务提交") {
                @Override
                public void check(JavaMethod method, ConditionEvents events) {
                    if (method.getAnnotationOfType(TransactionalEventListener.class)
                            .fallbackExecution()) {
                        events.add(SimpleConditionEvent.violated(
                                method, method.getFullName() + " 设置了 fallbackExecution，可能在事务外提前执行"));
                    }
                }
            })
            .as("提交后效果不能在没有事务时提前执行")
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule localDevelopmentFixturesStayOnDevProfile = classes()
            .that()
            .resideInAPackage("io.space.control.bootstrap.dev")
            .and()
            .areAnnotatedWith(Component.class)
            .should(beActiveOnlyOnDevProfile())
            .as("本机夹具必须 @Profile(\"dev\")，以免写入生产或 e2e")
            .allowEmptyShould(true);

    private static ArchCondition<JavaClass> beActiveOnlyOnDevProfile() {
        return new ArchCondition<>("声明 @Profile(\"dev\")") {
            @Override
            public void check(JavaClass javaClass, ConditionEvents events) {
                if (!javaClass.isAnnotatedWith(Profile.class)) {
                    events.add(SimpleConditionEvent.violated(javaClass, javaClass.getName() + " 缺少 @Profile(\"dev\")"));
                    return;
                }
                String[] profiles = javaClass.getAnnotationOfType(Profile.class).value();
                if (profiles.length != 1 || !"dev".equals(profiles[0])) {
                    events.add(SimpleConditionEvent.violated(
                            javaClass, javaClass.getName() + " 的 @Profile 必须恰好是 dev，实际为 " + Arrays.toString(profiles)));
                }
            }
        };
    }

    private static DescribedPredicate<JavaMethod> areEventListeners() {
        return new DescribedPredicate<>("是事件监听方法") {
            @Override
            public boolean test(JavaMethod method) {
                return LISTENER_ANNOTATIONS.stream().anyMatch(method::isAnnotatedWith);
            }
        };
    }

    private static ArchCondition<JavaMethod> consumeOnlyOwnModuleEvents() {
        return new ArchCondition<>("只消费本模块自己的事件") {
            @Override
            public void check(JavaMethod method, ConditionEvents events) {
                String ownModule = modulePrefixOf(method.getOwner().getPackageName());
                for (JavaClass parameter : method.getRawParameterTypes()) {
                    String eventPackage = parameter.getPackageName();
                    if (eventPackage.startsWith("io.space") && !eventPackage.startsWith(ownModule)) {
                        events.add(SimpleConditionEvent.violated(
                                method,
                                "%s 监听了外部模块事件 %s —— 跨概念反应必须写成 syncs 包的编排"
                                        .formatted(method.getFullName(), parameter.getName())));
                    }
                }
            }
        };
    }

    /**
     * 模块前缀随角色层深度变化：concepts.&lt;组&gt;.&lt;概念&gt; 五段，platform.&lt;模块&gt; 四段，
     * syncs / gateway / shared 三段。
     */
    private static String modulePrefixOf(String packageName) {
        String[] segments = packageName.split("\\.");
        int count;
        if (packageName.startsWith("io.space.concepts.")) {
            count = 4;
        } else {
            count = 3;
        }
        return Stream.of(Arrays.copyOf(segments, Math.min(count, segments.length)))
                .collect(Collectors.joining("."));
    }
}
