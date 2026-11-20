plugins {
    java
}
java { toolchain { languageVersion = JavaLanguageVersion.of(25) } }
dependencies {
    implementation(platform(libs.spring.boot.dependencies))
    implementation("com.fasterxml.jackson.core:jackson-annotations")
    testImplementation(platform(libs.spring.boot.dependencies))
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}
tasks.withType<Test> { useJUnitPlatform() }

// Copy the repository's trusted registration data; applications do not maintain another catalog.
tasks.processResources {
    from(rootProject.layout.projectDirectory.file("../contracts/content-plugins.json"))
}

// Shared schema closure: both console builds and JVM consumers use this manifest and these bytes.
tasks.processResources {
    from(rootProject.layout.projectDirectory.dir("../contracts/content-schemas")) {
        into("content-schemas")
    }
}
