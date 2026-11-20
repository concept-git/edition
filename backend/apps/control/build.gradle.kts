import com.github.psxpaul.task.JavaExecFork

import org.springframework.boot.gradle.plugin.SpringBootPlugin

plugins {
    java
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.springdoc)
}

tasks.named<ProcessResources>("processTestResources") {
    from(rootProject.file("../acceptance/e2e/fixtures/import-packs/F-v1-ok.zip")) {
        into("import-packs")
    }
}

group = "io.space"
version = rootProject.file("../VERSION").readText().trim()

// 产物名是 space-control。spring.application.name 仍是 space。
base { archivesName = "space-control" }

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25) // STACK.md §1：Java 25 LTS
    }
}

// 仓库统一声明在 settings.gradle.kts 的 dependencyResolutionManagement

dependencies {
    implementation(platform(SpringBootPlugin.BOM_COORDINATES))
    implementation(platform(libs.spring.modulith.bom))
    testImplementation(testFixtures(project(":import-format")))
    testImplementation(platform(libs.testcontainers.bom))

    // 交付契约：唯一与独立交付构件共享的接口（ADR-0022）
    implementation(project(":contract"))
    implementation(project(":values"))
    implementation(project(":request-context"))
    implementation(project(":collection"))
    implementation(project(":page"))
    implementation(project(":revision"))
    implementation(project(":space"))
    implementation(project(":tag"))
    implementation(project(":toc"))
    implementation(project(":custom-domain"))
    implementation(project(":redirect"))
    implementation(project(":search"))
    implementation(project(":site"))
    implementation(project(":api-token"))
    implementation(project(":management-token"))
    implementation(project(":membership"))
    implementation(project(":password"))
    implementation(project(":permission"))
    implementation(project(":session"))
    implementation(project(":team"))
    implementation(project(":user"))
    implementation(project(":release"))
    implementation(project(":analytics"))
    implementation(project(":audit"))
    implementation(project(":bundle-export"))
    implementation(project(":certificate-inspection"))
    implementation(project(":content-type"))
    implementation(project(":deletion-recovery"))
    implementation(project(":dns-lookup"))
    implementation(project(":idempotency"))
    implementation(project(":import-format"))
    implementation(project(":import-job"))
    implementation(project(":mail-outbox"))
    implementation(project(":object-store"))
    implementation(project(":plugin-development"))
    implementation(project(":plugin-verification"))
    implementation(project(":reader-security"))
    implementation(project(":service-health"))
    implementation(project(":tenant-registry"))
    implementation(project(":webhook"))


    // Spring 基座（PROJECT-INIT.md §1）
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-mail")
    implementation("io.micrometer:micrometer-tracing-bridge-otel")

    // Modulith：模块边界 + 事件注册表（outbox）+ 可观测
    implementation("org.springframework.modulith:spring-modulith-starter-jdbc")
    implementation("org.springframework.modulith:spring-modulith-observability")

    // 持久层：MyBatis（ADR-0006）+ Flyway + PostgreSQL
    implementation(libs.mybatis.spring.boot)
    implementation("org.springframework.boot:spring-boot-starter-flyway") // Boot 4：flyway 自动配置在独立 starter
    implementation("org.flywaydb:flyway-database-postgresql")
    runtimeOnly("org.postgresql:postgresql")

    // 契约：springdoc 生成 OpenAPI（contracts/openapi.json 的来源）
    implementation(libs.springdoc.webmvc)

    // 领域依赖库（STACK.md §2）
    implementation(libs.flexmark) // markdown 渲染
    implementation(libs.jsoup) // html 清洗/断链解析
    implementation("org.yaml:snakeyaml") // OKF YAML frontmatter
    implementation(libs.minio) // 附件/Bundle 对象存储
    implementation(libs.java.diff.utils) // Revision._diff
    implementation(libs.json.schema.validator) // Bundle manifest 校验
    implementation(libs.bucket4j) // 认证/导入限流
    implementation("com.github.ben-manes.caffeine:caffeine")           // Permission._decide 判定缓存

    // 可观测导出
    runtimeOnly("io.micrometer:micrometer-registry-prometheus")
    runtimeOnly("io.micrometer:micrometer-registry-otlp")
    runtimeOnly("io.opentelemetry:opentelemetry-exporter-otlp")

    // 测试（TESTING.md）
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
    testImplementation("org.springframework.modulith:spring-modulith-starter-test")
    testImplementation("org.springframework.boot:spring-boot-testcontainers")
    testImplementation("org.testcontainers:junit-jupiter")
    testImplementation("org.testcontainers:postgresql")
    testImplementation("org.testcontainers:minio")                    // 附件对象存储真依赖（票 13）
    testImplementation(libs.archunit.junit5)
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    // 交付库真实实现只用于管理侧源/目标集成测试，不进入运行时 classpath。
}

tasks.withType<Test> {
    val productionUnits = rootProject.subprojects.filter { it.name != "testing" }
    dependsOn(productionUnits.map { "${it.path}:compileJava" })
    doFirst {
        systemProperty("space.architecture.classRoots", productionUnits.flatMap {
            it.extensions.getByType<SourceSetContainer>().getByName("main").output.classesDirs.files
        }.joinToString(System.getProperty("path.separator")) { it.absolutePath })
    }
    systemProperty("space.import.fixtures", project(":import-format").file("src/testFixtures/resources/import-packs").absolutePath)
    useJUnitPlatform()
    inputs.files(fileTree("src/main/java") { include("**/*.md") })
    inputs.files(rootProject.file("../docs/prd"), rootProject.file("CLAUDE.md"))
    inputs.property("updateSpecInterfaces", providers.environmentVariable("UPDATE_SPEC_INTERFACES").orElse("false"))
}

// 会话签名及幂等响应加密密钥缺失时应用默认拒绝启动。本机运行显式开启临时密钥，
// 部署产物（jar/镜像）拿不到这些开关，忘配密钥就起不来。
tasks.named<org.springframework.boot.gradle.tasks.run.BootRun>("bootRun") {
    systemProperty("io.space.session.allow-ephemeral-key", "true")
    systemProperty("io.space.idempotency.allow-ephemeral-key", "true")
    systemProperty("io.space.mail-outbox.allow-ephemeral-key", "true")
    // 本机默认启用开发夹具；CI / 显式 SPRING_PROFILES_ACTIVE 保持调用方原意（e2e 不得种 @dev.local）。
    val ci = System.getenv("CI") == "true"
    val profiles = System.getenv("SPRING_PROFILES_ACTIVE")
    if (!ci && profiles.isNullOrBlank()) {
        systemProperty("spring.profiles.active", "dev")
    }
}

// springdoc 1.9 的 fork 默认沿用运行 Gradle 的 JVM，而本项目 classfile 由 Java 25 toolchain 生成。
// 显式对齐 launcher，否则从 Java 21 启动 Gradle 时 generateOpenApiDocs 会 UnsupportedClassVersionError。
tasks.named<JavaExecFork>("forkedSpringBootRun") {
    dependsOn(tasks.named("classes"))
    dependsOn(configurations.runtimeClasspath)
    javaLauncher = javaToolchains.launcherFor {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

tasks.withType<JavaCompile> {
    options.compilerArgs.addAll(listOf("-Xlint:deprecation", "-Xlint:unchecked"))
}

openApi {
    // 契约生成显式使用完整功能与 default profile；临时密钥仅用于本地生成进程。
    val port = System.getenv("OPENAPI_PORT") ?: "8081"
    apiDocsUrl.set("http://localhost:$port/api-docs")
    outputDir.set(layout.buildDirectory.dir("generated/openapi").get().asFile)
    outputFileName.set("openapi.json")
    waitTimeInSeconds.set(30)
    customBootRun {
        systemProperties.set(mapOf<String, Any>(
            "server.port" to port,
            "spring.profiles.active" to "default",
            "io.space.session.allow-ephemeral-key" to "true",
            "io.space.idempotency.allow-ephemeral-key" to "true",
            "io.space.mail-outbox.allow-ephemeral-key" to "true"
        ))
    }
}
// Runtime flags and live controller discovery must never reuse an earlier generated contract.
tasks.named("generateOpenApiDocs") {
    outputs.upToDateWhen { false }
    outputs.file(rootProject.file("../contracts/openapi.json"))
    doLast {
        copy {
            from(layout.buildDirectory.file("generated/openapi/openapi.json"))
            into(rootProject.file("../contracts"))
        }
    }
}

springBoot { mainClass.set("io.space.SpaceApplication") }
