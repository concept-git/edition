plugins { `java-library` }
java { toolchain { languageVersion = JavaLanguageVersion.of(25) } }
dependencies {
    implementation(platform(libs.spring.boot.dependencies))
    implementation(platform(libs.spring.modulith.bom))
    implementation(libs.okhttp)
    implementation("io.micrometer:micrometer-core")
    implementation("org.springframework.boot:spring-boot-autoconfigure")
    implementation("org.springframework.modulith:spring-modulith-api")
    implementation("org.springframework:spring-context")
    implementation("org.springframework:spring-jdbc")
    implementation("tools.jackson.core:jackson-databind")
    testImplementation(testFixtures(project(":testing")))
    testImplementation(platform(libs.spring.boot.dependencies))
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}
tasks.withType<Test> { useJUnitPlatform() }
