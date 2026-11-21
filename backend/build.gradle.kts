import java.util.zip.ZipFile
import com.diffplug.gradle.spotless.SpotlessExtension

import org.gradle.api.plugins.quality.Checkstyle
import org.gradle.api.plugins.quality.CheckstyleExtension

// 根项目不含源码，只声明插件版本与跨构件的聚合任务。
// 三个可运行工程：control、content、index。Control 唯一拥有业务写入。
plugins {
    alias(libs.plugins.spring.boot) apply false
    alias(libs.plugins.springdoc) apply false
    alias(libs.plugins.spotless) apply false
    alias(libs.plugins.dependency.analysis)
}

val conceptInventory = groovy.json.JsonSlurper().parse(file("concept-modules.json")) as Map<*, *>
val conceptDefinitions = (conceptInventory["concepts"] as List<*>).map { it as Map<*, *> }
val conceptProjects = conceptDefinitions.map { ":${it["project"]}" }.toSet()
val technicalProjects = setOf(":contract", ":values", ":request-context")
val applicationProjects = setOf(":control", ":content", ":index")

val allowedProjectDependencies = mapOf(
    ":control" to (conceptProjects + setOf(":contract", ":values", ":request-context")),
    ":index" to setOf(":contract"),
    ":content" to setOf(":contract"),
    ":contract" to emptySet(),
    ":values" to emptySet(),
    ":request-context" to emptySet(),
) + conceptProjects.associateWith {
    setOf(":contract", ":values", ":request-context")
}

tasks.register("verifyProjectArchitecture") {
    group = "verification"
    description = "Verifies all application, concept and technical-library build boundaries."
    doLast {
        check(conceptDefinitions.size == 37 && conceptProjects.size == 37) {
            "The complete inventory must contain 37 distinct concept build units"
        }
        check(subprojects.map { it.path }.toSet() == allowedProjectDependencies.keys) {
            "Every project must declare its production dependency boundary"
        }
        val physicalConcepts = fileTree("libraries") { include("**/CONCEPT.md") }.files
            .map { it.parentFile.canonicalFile }.toSet()
        check(physicalConcepts == conceptDefinitions.map { file(it["directory"] as String).canonicalFile }.toSet()) {
            "Concept inventory must cover every physical concept module exactly once"
        }
        subprojects.forEach { target ->
            val productionConfigurations = target.configurations.filter { configuration ->
                val name = configuration.name
                !(name.startsWith("test", ignoreCase = true) || name.contains("Test")) && (
                    name in setOf("api", "implementation", "runtimeOnly", "compileOnly", "annotationProcessor") ||
                    name.endsWith("CompileClasspath") || name.endsWith("RuntimeClasspath")
                )
            }
            val actual = productionConfigurations
                .flatMap { it.allDependencies.withType(org.gradle.api.artifacts.ProjectDependency::class.java) }
                .map { it.path }.toSet()
            check(allowedProjectDependencies.getValue(target.path).containsAll(actual)) {
                "build dependency: ${target.path} -> $actual exceeds ${allowedProjectDependencies.getValue(target.path)} at ${target.buildFile}"
            }
            val expectedDirectory = when (target.path) {
                in applicationProjects -> file("apps/${target.name}")
                in technicalProjects -> file("libraries/${target.name}")
                else -> file(conceptDefinitions.single { ":${it["project"]}" == target.path }["directory"] as String)
            }
            check(target.projectDir.canonicalFile == expectedDirectory.canonicalFile) {
                "project location: ${target.path} -> ${target.projectDir}, expected $expectedDirectory"
            }
            val sources = fileTree(target.layout.projectDirectory.dir("src/main/java")) { include("**/*.java") }
            check(!sources.isEmpty) { "Production source coverage is empty: ${target.path}" }
            if (target.path in technicalProjects) {
                sources.forEach { source ->
                    check(!Regex("io\\.edition\\.(concepts|platform|control|contentapp|index)\\.").containsMatchIn(source.readText())) {
                        "technical library: ${target.path} -> executable implementation in $source"
                    }
                }
            }
            if (target.name in setOf("contract", "values", "request-context")) {
                sources.forEach { source ->
                    listOf("java.sql.", "javax.sql.", "java.net.http.", "io.minio.").forEach { forbidden ->
                        check(forbidden !in source.readText()) {
                            "passive library: ${target.path} -> $forbidden in $source"
                        }
                    }
                }
            }
            if (target.path in applicationProjects) {
                sources.forEach { source ->
                    val foreign = when (target.name) {
                        "content" -> "concepts|platform|control|index"
                        "index" -> "concepts|platform|control|contentapp"
                        else -> "contentapp|index"
                    }
                    check(!Regex("(?m)^import\\s+(?:static\\s+)?io\\.edition\\.(?:$foreign)\\.").containsMatchIn(source.readText())) {
                        "runtime isolation: ${target.path} -> another application implementation in $source"
                    }
                }
            }
            if (target.path in conceptProjects) {
                val definition = conceptDefinitions.single { ":${it["project"]}" == target.path }
                val ownPackage = definition["package"] as String
                sources.forEach { source ->
                    Regex("io\\.edition\\.concepts\\.[a-z]+(?:\\.[A-Za-z_$][A-Za-z0-9_$]*)*")
                        .findAll(source.readText()).forEach { reference ->
                            check(reference.value == ownPackage || reference.value.startsWith("$ownPackage.")) {
                                "concept independence: ${target.path} -> ${reference.value} in $source"
                            }
                        }
                    check(!source.readText().contains("io.edition.control.")) {
                        "concept independence: ${target.path} -> application in $source"
                    }
                }
            }
        }
    }
}

dependencyAnalysis {
    issues {
        all {
            onAny {
                severity("warn")
            }
        }
    }
}

subprojects {
    tasks.withType<JavaCompile>().configureEach {
        // Library extraction must preserve the named action/query inputs previously supplied by Boot.
        if ("-parameters" !in options.compilerArgs) options.compilerArgs.add("-parameters")
        options.compilerArgs.addAll(listOf("-Xlint:deprecation", "-Xlint:unchecked", "-Werror"))
    }
    pluginManager.withPlugin("java") {
        apply(plugin = "checkstyle")
        apply(plugin = "com.diffplug.spotless")
        apply(plugin = "com.autonomousapps.dependency-analysis")
        apply(from = rootProject.file("../infra/java.gradle"))

        extensions.configure<CheckstyleExtension> {
            toolVersion = libs.versions.checkstyle.get()
            configFile = rootProject.file("config/checkstyle/checkstyle.xml")
        }
        tasks.named<Checkstyle>("checkstyleTest") {
            enabled = false
        }

        extensions.configure<SpotlessExtension> {
            java {
                palantirJavaFormat(libs.versions.palantirJavaFormat.get())
                target("src/*/java/**/*.java")
            }
        }
    }
    tasks.withType<Test>().configureEach {
        systemProperty("edition.backend.root", rootProject.projectDir.absolutePath)
        inputs.property("minioTestImage", providers.environmentVariable("EDITION_MINIO_TEST_IMAGE").orElse("official"))
        // Mockito instrumentation changes the bootstrap classpath; CDS cannot be used here.
        jvmArgs("-Xshare:off")
        jvmArgumentProviders.add(CommandLineArgumentProvider {
            val agent = configurations.getByName("testRuntimeClasspath").files.single {
                it.name.startsWith("mockito-core-") && it.extension == "jar"
            }
            listOf("-javaagent:${agent.absolutePath}")
        })
    }
    tasks.matching { it.name == "check" }.configureEach {
        dependsOn(rootProject.tasks.named("verifyProjectArchitecture"))
    }
}

tasks.register("bootRunDelivery") {
    group = "application"
    description = "Runs the independent read-only delivery artifact (requires reader credentials)."
    dependsOn(":content:bootRun")
}

val verifyPasswordRuntimeOwnership = tasks.register("verifyPasswordRuntimeOwnership") {
    group = "verification"
    dependsOn(listOf(":control", ":content", ":index").map { project(it).configurations.named("runtimeClasspath") })
    doLast {
        val local = "io/edition/concepts/password/application/PasswordService.class"
        val businessApi = "io/edition/concepts/password/api/PasswordApi.class"
        fun includes(app: String, entry: String): Boolean = project(app).configurations.getByName("runtimeClasspath").files.any { archive ->
            archive.extension == "jar" && ZipFile(archive).use { it.getEntry(entry) != null }
        }
        check(includes(":control", businessApi) && includes(":control", local)) { "Control must own the Password implementation" }
        listOf(":content", ":index").forEach { app ->
            check(!includes(app, local) && !includes(app, businessApi)) { "$app must not ship Password state or commands" }
        }
    }
}
subprojects { tasks.matching { it.name == "check" }.configureEach { dependsOn(verifyPasswordRuntimeOwnership) } }
