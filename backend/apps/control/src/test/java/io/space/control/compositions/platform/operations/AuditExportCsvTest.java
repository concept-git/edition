package io.space.control.compositions.platform.operations;

import static org.assertj.core.api.Assertions.*;

import org.junit.jupiter.api.Test;

class AuditExportCsvTest {
    @Test
    void csvCellsCannotStartSpreadsheetFormulas() {
        assertThat(io.space.control.compositions.platform.operations.AuditExportWorker.csv("\t=SUM(1,2)"))
                .isEqualTo("\"'\t=SUM(1,2)\"");
        assertThat(io.space.control.compositions.platform.operations.AuditExportWorker.csv("a\"b"))
                .isEqualTo("\"a\"\"b\"");
    }
}
