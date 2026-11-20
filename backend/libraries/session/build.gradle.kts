plugins { `java-library` }
java { toolchain { languageVersion = JavaLanguageVersion.of(25) } }
dependencies {
    implementation(platform(libs.spring.boot.dependencies))
    implementation(platform(libs.spring.modulith.bom))
    api(project(":values"))
    implementation("org.slf4j:slf4j-api")
    implementation("org.springframework.modulith:spring-modulith-api")
    implementation("org.springframework.security:spring-security-oauth2-jose")
    implementation("org.springframework:spring-context")
    implementation("org.springframework:spring-tx")
    implementation(libs.mybatis.spring.boot)
    testImplementation(testFixtures(project(":testing")))
    testImplementation(platform(libs.spring.boot.dependencies))
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}
tasks.withType<Test> { useJUnitPlatform() }
