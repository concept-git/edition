plugins {
    java
    alias(libs.plugins.spring.boot)
}
base { archivesName = "space-content" }
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
    implementation(libs.minio)
    implementation(libs.jsoup)
    implementation(libs.flexmark)
    implementation("com.github.ben-manes.caffeine:caffeine")
    implementation(libs.springdoc.webmvc)
    runtimeOnly("org.postgresql:postgresql")
    runtimeOnly("io.micrometer:micrometer-registry-prometheus")
    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
    testImplementation(libs.testcontainers.postgresql)
    testImplementation(libs.testcontainers.junit)
    testImplementation(libs.archunit.junit5)
}

tasks.register("verifyIsolation") {
    doLast {
        // Runtime artifact names and short Gradle project identities are both checked.
        val forbiddenNames = setOf("space", "control", "index", "space-control", "space-index") +
            rootProject.subprojects.filter { it.file("CONCEPT.md").isFile }.map { it.name }
        val forbidden = configurations.runtimeClasspath.get().resolvedConfiguration.resolvedArtifacts.filter {
            it.moduleVersion.id.group == "org.springframework.modulith" || it.name in forbiddenNames
        }
        check(forbidden.isEmpty()) { "Content includes management or worker artifacts: $forbidden" }
        fileTree("src/main/java").matching { include("**/*.java") }.forEach {
            check(!Regex("io\\.space\\.(concepts|control|platform|index)\\.").containsMatchIn(it.readText())) { "Content imports management: $it" }
            check(!Regex("""\.(putObject|removeObject|createIndex|deleteIndex|addDocuments|updateDocuments|updateSettings|batchUpdate)\s*\(""").containsMatchIn(it.readText())) { "Reader calls a write operation: $it" }
            val mutation = Regex("""(?i)\b(?:insert\s+into|delete\s+from|(?<!do )update)\s+([\w.]+)""").find(it.readText())
            check(mutation == null) { "Reader mutates database state: $it -> ${mutation?.value}" }

        }
    }
}
tasks.named("check") { dependsOn("verifyIsolation") }
