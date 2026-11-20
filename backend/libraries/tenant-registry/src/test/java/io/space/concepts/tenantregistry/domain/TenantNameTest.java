package io.space.concepts.tenantregistry.domain;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.tenantregistry.api.*;
import org.junit.jupiter.api.Test;

/** 租户名不变量（CONCEPT.md：非空且 ≤120 字符）。非法名是可返回的业务失败，不抛异常。 */
class TenantNameTest {

    @Test
    void rejectsMissingAndBlankNames() {
        assertThat(TenantName.parse(null)).isEmpty();
        assertThat(TenantName.parse("")).isEmpty();
        assertThat(TenantName.parse("   \t\n ")).isEmpty();
    }

    @Test
    void rejectsNamesBeyondTheLengthLimit() {
        assertThat(TenantName.parse("x".repeat(TenantName.MAX_LENGTH + 1))).isEmpty();
    }

    @Test
    void acceptsNameAtTheLengthLimit() {
        String atLimit = "x".repeat(TenantName.MAX_LENGTH);

        assertThat(TenantName.parse(atLimit)).map(TenantName::value).contains(atLimit);
    }

    @Test
    void stripsSurroundingWhitespaceSoDisplayNamesStayClean() {
        assertThat(TenantName.parse("  Acme Docs  ")).map(TenantName::value).contains("Acme Docs");
    }

    /** 去空白后才量长度：否则前后空格能把名字挤过上限。 */
    @Test
    void measuresLengthAfterStripping() {
        String paddedAtLimit = "  " + "x".repeat(TenantName.MAX_LENGTH) + "  ";

        assertThat(TenantName.parse(paddedAtLimit)).isPresent();
    }
}
