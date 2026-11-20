plugins { `java-library`; `java-test-fixtures` }
java { toolchain { languageVersion = JavaLanguageVersion.of(25) } }
dependencies {
    testImplementation(platform(libs.spring.boot.dependencies))
    testImplementation(platform(libs.testcontainers.bom))
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.boot:spring-boot-starter-jdbc")
    testImplementation(libs.testcontainers.postgresql)
    testImplementation(libs.testcontainers.junit)
    testRuntimeOnly("org.postgresql:postgresql")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    testFixturesApi(platform(libs.spring.boot.dependencies))
    testFixturesApi(platform(libs.spring.modulith.bom))
    testFixturesApi("org.springframework.boot:spring-boot-starter-test")
    testFixturesApi("org.springframework.boot:spring-boot-testcontainers")
    testFixturesApi("org.springframework.boot:spring-boot-starter-jdbc")
    testFixturesApi("org.springframework.boot:spring-boot-starter-flyway")
    testFixturesApi("tools.jackson.core:jackson-databind")
    testFixturesApi("org.flywaydb:flyway-database-postgresql")
    testFixturesApi("org.springframework.modulith:spring-modulith-starter-jdbc")
    testFixturesApi("org.springframework.modulith:spring-modulith-starter-test")
    testFixturesApi(platform(libs.testcontainers.bom))
    testFixturesApi(libs.testcontainers.postgresql)
    testFixturesApi(libs.testcontainers.junit)
    testFixturesApi("org.testcontainers:minio")
    testFixturesApi(libs.minio)
    testFixturesRuntimeOnly("org.postgresql:postgresql")
}
tasks.named<ProcessResources>("processTestFixturesResources") {
    // Use authoritative source DDL without compiling or loading the Control application.
    from(rootProject.file("apps/control/src/main/resources/db")) { into("db") }
}

tasks.withType<Test> { useJUnitPlatform() }
