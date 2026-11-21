plugins {
    // 按 java.toolchain 声明自动下载 JDK（本机无 JDK 25 时由此供给）
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
}

rootProject.name = "edition"

// 强制仓库以此处为准（忽略全局 init.gradle 注入的镜像——aliyun 代理缺 spring-modulith 部分 jar，
// 且 Gradle 不跨仓库回退取 artifact，会直接构建失败）
dependencyResolutionManagement {
    repositoriesMode = RepositoriesMode.PREFER_SETTINGS
    repositories {
        mavenCentral()
    }
}

// apps 可独立运行，libs 由应用引用；Gradle 路径保持一层，物理目录显式映射。
val applications = listOf("control", "content", "index")
val libraries = listOf("contract", "values", "request-context")
applications.forEach { name ->
    include(name)
    project(":$name").projectDir = file("apps/$name")
}
libraries.forEach { name ->
    include(name)
    project(":$name").projectDir = file("libraries/$name")
}

// One authoritative concept inventory supplies the independently buildable projects.
val conceptInventory = groovy.json.JsonSlurper().parse(file("concept-modules.json")) as Map<*, *>
(conceptInventory["concepts"] as List<*>).forEach { entry ->
    val concept = entry as Map<*, *>
    val name = concept["project"] as String
    include(name)
    project(":$name").projectDir = file(concept["directory"] as String)
}
