package io.space.contentapp;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

/** 阅读模块单体的包缝。运行时 classpath 不含 Modulith。 */
@AnalyzeClasses(packages = "io.space.contentapp", importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureTests {

    @ArchTest
    static final ArchRule sharedStaysPassive = noClasses()
            .that()
            .resideInAPackage("io.space.contentapp.compositions.shared..")
            .should()
            .dependOnClassesThat()
            .resideInAnyPackage(
                    "io.space.contentapp.compositions.access..",
                    "io.space.contentapp.compositions.page..",
                    "io.space.contentapp.compositions.navigation..",
                    "io.space.contentapp.compositions.resources..",
                    "io.space.contentapp.compositions.machine..",
                    "io.space.contentapp.compositions.search..",
                    "io.space.contentapp.compositions.site..",
                    "io.space.contentapp.entry.http..",
                    "io.space.contentapp.entry.observability..");

    @ArchTest
    static final ArchRule accessDoesNotSeeDownstream = noClasses()
            .that()
            .resideInAPackage("io.space.contentapp.compositions.access..")
            .should()
            .dependOnClassesThat()
            .resideInAnyPackage(
                    "io.space.contentapp.compositions.page..",
                    "io.space.contentapp.compositions.navigation..",
                    "io.space.contentapp.compositions.resources..",
                    "io.space.contentapp.compositions.machine..",
                    "io.space.contentapp.compositions.search..",
                    "io.space.contentapp.compositions.site..",
                    "io.space.contentapp.entry.http..",
                    "io.space.contentapp.entry.observability..");

    @ArchTest
    static final ArchRule persistenceDoesNotDependOnReadUseCases = noClasses()
            .that()
            .resideInAPackage("io.space.contentapp.entry.persistence..")
            .should()
            .dependOnClassesThat()
            .resideInAnyPackage(
                    "io.space.contentapp.compositions.page..",
                    "io.space.contentapp.compositions.navigation..",
                    "io.space.contentapp.compositions.resources..",
                    "io.space.contentapp.compositions.machine..",
                    "io.space.contentapp.compositions.search..",
                    "io.space.contentapp.compositions.site..",
                    "io.space.contentapp.entry.http..");

    @ArchTest
    static final ArchRule navigationDoesNotSeePageOrHttp = noClasses()
            .that()
            .resideInAPackage("io.space.contentapp.compositions.navigation..")
            .should()
            .dependOnClassesThat()
            .resideInAnyPackage(
                    "io.space.contentapp.compositions.page..",
                    "io.space.contentapp.compositions.resources..",
                    "io.space.contentapp.compositions.machine..",
                    "io.space.contentapp.compositions.search..",
                    "io.space.contentapp.compositions.site..",
                    "io.space.contentapp.entry.http..",
                    "io.space.contentapp.entry.observability..");

    @ArchTest
    static final ArchRule resourcesDoesNotSeePageOrSearch = noClasses()
            .that()
            .resideInAPackage("io.space.contentapp.compositions.resources..")
            .should()
            .dependOnClassesThat()
            .resideInAnyPackage(
                    "io.space.contentapp.compositions.page..",
                    "io.space.contentapp.compositions.navigation..",
                    "io.space.contentapp.compositions.machine..",
                    "io.space.contentapp.compositions.search..",
                    "io.space.contentapp.compositions.site..",
                    "io.space.contentapp.entry.http..",
                    "io.space.contentapp.entry.observability..");

    @ArchTest
    static final ArchRule searchDoesNotSeePageOrHttp = noClasses()
            .that()
            .resideInAPackage("io.space.contentapp.compositions.search..")
            .should()
            .dependOnClassesThat()
            .resideInAnyPackage(
                    "io.space.contentapp.compositions.page..",
                    "io.space.contentapp.compositions.navigation..",
                    "io.space.contentapp.compositions.resources..",
                    "io.space.contentapp.compositions.machine..",
                    "io.space.contentapp.entry.http..",
                    "io.space.contentapp.entry.observability..");

    @ArchTest
    static final ArchRule pageDoesNotSeeHttpOrSearch = noClasses()
            .that()
            .resideInAPackage("io.space.contentapp.compositions.page..")
            .should()
            .dependOnClassesThat()
            .resideInAnyPackage(
                    "io.space.contentapp.compositions.resources..",
                    "io.space.contentapp.compositions.machine..",
                    "io.space.contentapp.compositions.search..",
                    "io.space.contentapp.compositions.site..",
                    "io.space.contentapp.entry.http..");

    @ArchTest
    static final ArchRule machineDoesNotSeeHttpOrSearch = noClasses()
            .that()
            .resideInAPackage("io.space.contentapp.compositions.machine..")
            .should()
            .dependOnClassesThat()
            .resideInAnyPackage(
                    "io.space.contentapp.entry.http..",
                    "io.space.contentapp.compositions.search..",
                    "io.space.contentapp.compositions.site..",
                    "io.space.contentapp.entry.observability..");

    @ArchTest
    static final ArchRule observabilityStaysNarrow = noClasses()
            .that()
            .resideInAPackage("io.space.contentapp.entry.observability..")
            .should()
            .dependOnClassesThat()
            .resideInAnyPackage(
                    "io.space.contentapp.compositions.access..",
                    "io.space.contentapp.compositions.page..",
                    "io.space.contentapp.compositions.navigation..",
                    "io.space.contentapp.compositions.resources..",
                    "io.space.contentapp.compositions.machine..",
                    "io.space.contentapp.compositions.search..",
                    "io.space.contentapp.compositions.site..",
                    "io.space.contentapp.entry.http..");

    @ArchTest
    static final ArchRule siteDoesNotSeeDownstream = noClasses()
            .that()
            .resideInAPackage("io.space.contentapp.compositions.site..")
            .should()
            .dependOnClassesThat()
            .resideInAnyPackage(
                    "io.space.contentapp.compositions.page..",
                    "io.space.contentapp.compositions.navigation..",
                    "io.space.contentapp.compositions.resources..",
                    "io.space.contentapp.compositions.machine..",
                    "io.space.contentapp.compositions.search..",
                    "io.space.contentapp.entry.http..",
                    "io.space.contentapp.entry.observability..");

    @ArchTest
    static final ArchRule noCycles =
            slices().matching("io.space.contentapp.(**)").should().beFreeOfCycles();

    @ArchTest
    static final ArchRule controllersStayInHttp = noClasses()
            .that()
            .areAnnotatedWith(org.springframework.web.bind.annotation.RestController.class)
            .should()
            .resideOutsideOfPackage("io.space.contentapp.entry.http");
}
