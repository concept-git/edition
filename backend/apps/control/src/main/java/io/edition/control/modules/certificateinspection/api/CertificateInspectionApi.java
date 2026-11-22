package io.edition.control.modules.certificateinspection.api;

import java.time.Instant;

public interface CertificateInspectionApi {
    View inspect(String host);

    record View(String status, String issuer, Instant notBefore, Instant notAfter, Instant checkedAt, String error) {}
}
