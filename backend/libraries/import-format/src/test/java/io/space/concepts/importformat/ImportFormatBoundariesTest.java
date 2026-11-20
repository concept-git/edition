package io.space.concepts.importformat;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;
import io.space.concepts.importformat.api.*;

@AnalyzeClasses(packages = "io.space.concepts.importformat", importOptions = ImportOption.DoNotIncludeTests.class)
class ImportFormatBoundariesTest {
    @ArchTest
    static final ArchRule doesNotSeeConceptsOrGateway = noClasses()
            .that()
            .resideInAPackage("io.space.concepts.importformat..")
            .should()
            .dependOnClassesThat()
            .resideInAnyPackage(
                    "io.space.concepts..", "io.space.control.entry.http..", "io.space.control.compositions..")
            .as("platform.importformat 只允许 shared；概念与 gateway 不可见");

    @ArchTest
    static final ArchRule formatsDoNotDependOnEachOther = slices().matching(
                    "io.space.concepts.importformat.formats.(*)..")
            .should()
            .notDependOnEachOther()
            .as("每种来源格式独立演进，格式之间零互引");

    @ArchTest
    static final ArchRule formatsDoNotKnowRoutingOrJobs = noClasses()
            .that()
            .resideInAPackage("io.space.concepts.importformat.formats..")
            .should()
            .dependOnClassesThat()
            .resideInAnyPackage(
                    "io.space.concepts.importformat",
                    "io.space.concepts.importformat.routing..",
                    "io.space.concepts.importjob..");

    @ArchTest
    static final ArchRule sharedCapabilitiesDoNotKnowFormatsOrJobs = noClasses()
            .that()
            .resideInAnyPackage(
                    "io.space.concepts.importformat.archive..", "io.space.concepts.importformat.attachments..",
                    "io.space.concepts.importformat.markdown..", "io.space.concepts.importformat.directory..")
            .should()
            .dependOnClassesThat()
            .resideInAnyPackage(
                    "io.space.concepts.importformat", "io.space.concepts.importformat.formats..",
                    "io.space.concepts.importformat.routing..", "io.space.concepts.importjob..");

    @ArchTest
    static final ArchRule contractDoesNotKnowImplementations = noClasses()
            .that()
            .resideInAPackage("io.space.concepts.importformat.contract..")
            .should()
            .dependOnClassesThat()
            .resideInAnyPackage(
                    "io.space.concepts.importformat", "io.space.concepts.importformat.formats..",
                    "io.space.concepts.importformat.routing..", "io.space.concepts.importformat.archive..",
                    "io.space.concepts.importformat.attachments..", "io.space.concepts.importformat.markdown..",
                    "io.space.concepts.importformat.directory..", "io.space.concepts.importjob..");
}
