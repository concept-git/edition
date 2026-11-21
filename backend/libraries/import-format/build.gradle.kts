plugins { `java-library` }
java { toolchain { languageVersion = JavaLanguageVersion.of(25) } }
dependencies {
    testImplementation(libs.archunit.junit5)
    implementation(platform(libs.spring.boot.dependencies))
    implementation(platform(libs.spring.modulith.bom))
    api(project(":contract"))
    api(project(":values"))
    implementation("org.springframework.modulith:spring-modulith-api")
    implementation("org.springframework:spring-context")
    implementation("org.yaml:snakeyaml")
    implementation("tools.jackson.core:jackson-databind")
    implementation(libs.jsoup)
    testImplementation(platform(libs.spring.boot.dependencies))
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}
tasks.withType<Test> { useJUnitPlatform() }
