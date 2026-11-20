plugins {
    java
    alias(libs.plugins.spring.boot)
}
base { archivesName = "space-index" }
java { toolchain { languageVersion = JavaLanguageVersion.of(25) } }
dependencies {
    implementation(platform(libs.spring.boot.dependencies))
    testImplementation(platform(libs.spring.boot.dependencies))
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}
tasks.withType<Test> { useJUnitPlatform() }
dependencies {
    implementation(project(":contract"))
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-jdbc")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation(libs.meilisearch)
    implementation(libs.jsoup)
    implementation(libs.flexmark)
    implementation("com.github.ben-manes.caffeine:caffeine")
    implementation(libs.springdoc.webmvc)
    runtimeOnly("org.postgresql:postgresql")
    runtimeOnly("io.micrometer:micrometer-registry-prometheus")
    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
    testImplementation(libs.testcontainers.postgresql)
    testImplementation(libs.testcontainers.junit)
}

tasks.named<ProcessResources>("processTestResources") {
    from(project(":control").file("src/main/resources/db/migration")) { into("primary-db") }
}
