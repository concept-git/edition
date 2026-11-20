package io.space;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;
import org.springframework.modulith.docs.Documenter;

/**
 * 模块边界护栏（ADR-0031）：一条测试固化全部 Modulith 规则——
 * 概念模块零相互引用（各 package-info 的 allowedDependencies）、无环、内部包不可跨模块访问。
 */
class ModularityTests {

    static final ApplicationModules modules = ApplicationModules.of(SpaceApplication.class);

    @Test
    void verifiesModuleStructure() {
        modules.verify();
    }

    @Test
    void writesModuleDocumentation() {
        // 生成 build/spring-modulith-docs（C4/PlantUML），CI 产物，供与 PRD 对账（wyx audit）
        new Documenter(modules).writeDocumentation();
    }
}
