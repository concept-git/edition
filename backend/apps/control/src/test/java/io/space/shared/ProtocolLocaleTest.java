package io.space.shared;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.apitoken.api.ApiTokenApi;
import io.space.concepts.permission.api.PermissionApi;
import java.util.Locale;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.parallel.Isolated;

/** 协议名与操作名不随服务器语言环境改变；独占测试避免更改 JVM 默认 Locale 干扰其它测试。 */
@Isolated
class ProtocolLocaleTest {
    @Test
    void scopeAndPermissionNamesAreStableUnderTurkishLocale() {
        Locale previous = Locale.getDefault();
        try {
            Locale.setDefault(Locale.forLanguageTag("tr-TR"));
            assertThat(ApiTokenApi.Scope.PUBLISH.value()).isEqualTo("publish");
            assertThat(ApiTokenApi.Scope.parse("write")).isEqualTo(ApiTokenApi.Scope.WRITE);
            assertThat(new PermissionApi.Operation("WRITE").value()).isEqualTo("write");
            assertThat(new PermissionApi.Role("WRITER").value()).isEqualTo("writer");
        } finally {
            Locale.setDefault(previous);
        }
    }
}
