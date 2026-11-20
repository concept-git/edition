plugins { `java-library` }
java { toolchain { languageVersion = JavaLanguageVersion.of(25) } }
dependencies {
    implementation(platform(libs.spring.boot.dependencies))
    implementation(platform(libs.spring.modulith.bom))
    implementation("org.springframework.modulith:spring-modulith-api")
    implementation("org.springframework:spring-context")
    implementation("org.springframework:spring-tx")
    implementation(libs.mybatis.spring.boot)
    testImplementation(testFixtures(project(":testing")))
    testImplementation(platform(libs.spring.boot.dependencies))
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}
tasks.withType<Test> { useJUnitPlatform() }
