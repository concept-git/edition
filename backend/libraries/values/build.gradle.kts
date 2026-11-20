plugins { `java-library` }
java { toolchain { languageVersion = JavaLanguageVersion.of(25) } }
dependencies {
    testImplementation(platform(libs.spring.boot.dependencies))
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    implementation(platform(libs.spring.modulith.bom))
    implementation("org.springframework.modulith:spring-modulith-api")
}
tasks.withType<Test> { useJUnitPlatform() }
