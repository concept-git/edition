package io.space.control.bootstrap.dev;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.FlywayException;
import org.flywaydb.core.api.exception.FlywayValidateException;
import org.junit.jupiter.api.Test;

class DevelopmentFlywayConfigurationTest {
    @Test
    void validationFailureStopsWithoutCleaningExistingData() {
        Flyway flyway = mock(Flyway.class);
        FlywayValidateException validation = mock(FlywayValidateException.class);
        doThrow(validation).when(flyway).migrate();
        assertThatThrownBy(() -> new DevelopmentFlywayConfiguration()
                        .migrateWithoutCleanup()
                        .migrate(flyway))
                .isSameAs(validation);
        verify(flyway).migrate();
        verify(flyway, never()).clean();
    }

    @Test
    void nonValidationFailureNeverCleans() {
        Flyway flyway = mock(Flyway.class);
        doThrow(new FlywayException("migration failed")).when(flyway).migrate();
        assertThatThrownBy(() -> new DevelopmentFlywayConfiguration()
                        .migrateWithoutCleanup()
                        .migrate(flyway))
                .isInstanceOf(FlywayException.class)
                .hasMessage("migration failed");
        verify(flyway, never()).clean();
    }
}
