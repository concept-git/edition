package io.space.contentapp;

import static org.assertj.core.api.Assertions.*;

import io.space.contentapp.compositions.access.ContentIdentity;
import io.space.contentapp.compositions.resources.ContentFiles;
import jakarta.servlet.http.Cookie;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

class ContentIdentityTest {
    private static final String ACCESS = "rs1_" + "a".repeat(43);
    private final ContentIdentity reader = new ContentIdentity();

    @Test
    void readerPassesOnlyTheHashOfAValidCookieAndRejectsAmbiguousProofs() {
        var credential = reader.publicationCredential(request(ACCESS));
        assertThat(credential.session())
                .isEqualTo(ContentFiles.digest(ACCESS.getBytes(java.nio.charset.StandardCharsets.US_ASCII)));
        assertThat(credential.toString()).doesNotContain(ACCESS);
        assertThat(reader.publicationCredential(request("legacy.jwt.credential"))
                        .session())
                .isEmpty();
        var duplicate = request(ACCESS);
        duplicate.setCookies(duplicate.getCookies()[0], duplicate.getCookies()[0]);
        assertThat(reader.publicationCredential(duplicate).session()).isEmpty();
        duplicate.addHeader("Authorization", "Bearer invalid");
        assertThat(reader.publicationCredential(duplicate).proof()).isEmpty();
        assertThat(reader.publicationCredential(duplicate).session()).isNull();
    }

    @Test
    void machineBearerDoesNotBecomeAnInteractiveSession() {
        UUID id = UUID.randomUUID();
        var request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer spc_" + id + "_" + "a".repeat(43));
        var who = reader.publicationCredential(request);
        assertThat(who.token()).isEqualTo(id);
        assertThat(who.session()).isNull();
        assertThat(who.proof())
                .isEqualTo(ContentFiles.digest("a".repeat(43).getBytes(java.nio.charset.StandardCharsets.US_ASCII)));
        request.addHeader("Authorization", "Bearer invalid");
        assertThat(reader.publicationCredential(request).proof()).isEmpty();
    }

    private static MockHttpServletRequest request(String value) {
        var request = new MockHttpServletRequest();
        request.setCookies(new Cookie("__Host-space_reader", value));
        return request;
    }
}
