plugins { id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0" }
rootProject.name = "editionctl"
dependencyResolutionManagement { repositoriesMode = RepositoriesMode.PREFER_SETTINGS; repositories { mavenCentral() } }
