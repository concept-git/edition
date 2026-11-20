package io.space.control.compositions.iam.accountsession;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.user.api.UserApi;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.parallel.ResourceLock;

@ResourceLock("java.util.Locale.default")
class ProfileLocaleTest {
    @Test
    void statusIsAStableProtocolTokenOnATurkishHost() {
        Locale previous = Locale.getDefault();
        try {
            Locale.setDefault(Locale.forLanguageTag("tr-TR"));
            var profile = new UserApi.AccountProfile(
                    new UserApi.UserId(UUID.randomUUID()),
                    "reader@example.test",
                    "Reader",
                    null,
                    "en",
                    true,
                    UserApi.Status.ACTIVE,
                    false);
            assertThat(AccountSessionTypes.Profile.from(profile, false, List.of())
                            .status())
                    .isEqualTo("active");
        } finally {
            Locale.setDefault(previous);
        }
    }
}
