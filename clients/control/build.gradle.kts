plugins { java; application; id("com.diffplug.spotless") version "8.10.2" }
apply(from = file("../../infra/java.gradle"))
group = "io.space"
val releaseVersion = providers.gradleProperty("releaseVersion").orElse(file("../../VERSION").readText().trim()).get()
version = releaseVersion
require(releaseVersion.matches(Regex("[0-9]{1,6}\\.[0-9]{1,6}\\.[0-9]{1,6}"))) { "releaseVersion must be MAJOR.MINOR.PATCH" }
java { toolchain { languageVersion = JavaLanguageVersion.of(25) } }
spotless { java { target("src/**/*.java"); palantirJavaFormat("2.98.0"); removeUnusedImports(); formatAnnotations() } }
application { mainClass = "io.space.cli.Main"; applicationDefaultJvmArgs = listOf("--enable-native-access=ALL-UNNAMED") }
dependencies {
    implementation("org.aesh:aesh:3.18.5") {
        // Raw argv parsing and help need terminal-api, but never start a Readline/TTY runtime.
        exclude(group = "org.aesh", module = "readline")
        exclude(group = "org.aesh", module = "readline-api")
        exclude(group = "org.aesh", module = "terminal-tty")
        exclude(group = "org.aesh", module = "terminal-detect")
    }
    implementation("com.fasterxml.jackson.core:jackson-databind:2.21.1")
    implementation("com.fasterxml.jackson.dataformat:jackson-dataformat-yaml:2.21.1")
    implementation("io.modelcontextprotocol.sdk:mcp-core:2.0.1")
    implementation("io.modelcontextprotocol.sdk:mcp-json-jackson2:2.0.1")
    implementation("com.networknt:json-schema-validator:2.0.4")
    implementation("com.github.javakeyring:java-keyring:1.0.4")
    runtimeOnly("org.slf4j:slf4j-nop:2.0.17")
    testImplementation("org.junit.jupiter:junit-jupiter-api:5.13.4")
    testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine:5.13.4")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher:1.13.4")
}
dependencyLocking { lockAllConfigurations() }
tasks.test {
    useJUnitPlatform()
    // Windows 的旧 ProcessBuilder 编码会丢失 JSON 内的引号；使用 JDK 原生严格编码。
    systemProperty("jdk.lang.Process.allowAmbiguousCommands", "false")
    testLogging { exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL }
}
tasks.register<Exec>("generateContract") {
    workingDir(projectDir)
    commandLine("python3", "scripts/generate_contract.py")
}
tasks.register<Exec>("verifyContract") {
    workingDir(projectDir)
    commandLine("python3", "scripts/generate_contract.py", "--check")
}
tasks.processResources { dependsOn("verifyContract", "releaseMarker"); from(layout.buildDirectory.dir("release")) }
tasks.register<Exec>("testCompiler") { workingDir(projectDir); commandLine("python3", "-m", "unittest", "discover", "-s", "scripts/tests") }
tasks.named("check") { dependsOn("verifyContract", "testCompiler") }
tasks.register("releaseMarker") {
    val marker = layout.buildDirectory.file("release/release.json")
    inputs.property("version", releaseVersion)
    outputs.file(marker)
    doLast { marker.get().asFile.apply { parentFile.mkdirs(); writeText("""{"product":"spacectl","version":"$releaseVersion"}""") } }
}
distributions { main { contents { from("skills") { into("skills"); exclude("**/.DS_Store") }; from("scripts/install_skill.py") { into("scripts") }; from("README.md", "ARCHITECTURE.md", "USAGE.md", "UPDATING.md", "SPECS.md"); from(layout.buildDirectory.dir("release")) } } }
tasks.named("installDist") { dependsOn("releaseMarker") }
tasks.named("distZip") { dependsOn("releaseMarker") }
