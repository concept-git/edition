package io.space.control.compositions.platform.certificatecheck;

import static io.space.control.compositions.platform.certificatecheck.CertificateCheckTypes.*;

import java.time.Instant;
import java.util.*;

/** Public composition inputs, results, and finite refusal types. */
public final class CertificateCheckTypes {
    private CertificateCheckTypes() {}

    public record Certificate(
            String host,
            String status,
            String issuer,
            Instant notBefore,
            Instant notAfter,
            Instant checkedAt,
            String error) {}
}
