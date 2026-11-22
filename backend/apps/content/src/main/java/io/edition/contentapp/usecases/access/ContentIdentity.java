package io.edition.contentapp.usecases.access;

import io.edition.contentapp.usecases.shared.ContentProblem;
import jakarta.servlet.http.HttpServletRequest;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

/** Parses credential proofs for the primary read contract. */
@Component
public final class ContentIdentity {
    private static final Pattern MACHINE_BEARER = Pattern.compile(
            "(?i:Bearer) spc_([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})_([A-Za-z0-9_-]{43})");
    private static final String SESSION_COOKIE = "__Host-space_reader";

    private boolean usesSession(HttpServletRequest request) {
        var cookies = request.getCookies();
        return request.getHeader("Authorization") == null
                && cookies != null
                && Arrays.stream(cookies).anyMatch(cookie -> cookie.getName().equals(SESSION_COOKIE));
    }

    public PublicationCredential publicationCredential(HttpServletRequest request) {
        boolean session = usesSession(request);
        try {
            if (session) return new PublicationCredential(null, null, proof(sessionCookie(request)));
            var token = machineToken(request);
            return token == null
                    ? PublicationCredential.ANONYMOUS
                    : new PublicationCredential(token.id(), token.proof(), null);
        } catch (ContentProblem malformed) {
            return session ? new PublicationCredential(null, null, "") : new PublicationCredential(null, "", null);
        }
    }

    private static String sessionCookie(HttpServletRequest request) {
        var cookies = request.getCookies();
        if (cookies == null) return null;
        var presented = Arrays.stream(cookies)
                .filter(c -> c.getName().equals(SESSION_COOKIE))
                .toList();
        if (presented.isEmpty()) return null;
        String value = presented.getFirst().getValue();
        if (presented.size() != 1 || value == null || !value.matches("rs1_[A-Za-z0-9_-]{43}"))
            throw new ContentProblem(401, "reader_session_invalid");
        return value;
    }

    private MachineToken machineToken(HttpServletRequest request) {
        var authorization = Collections.list(request.getHeaders("Authorization"));
        if (authorization.isEmpty()) return null;
        if (authorization.size() != 1) throw new ContentProblem(401, "invalid_token");
        var match = MACHINE_BEARER.matcher(authorization.getFirst());
        if (!match.matches()) throw new ContentProblem(401, "invalid_token");
        return new MachineToken(UUID.fromString(match.group(1)), proof(match.group(2)));
    }

    private static String proof(String value) {
        if (value == null) return null;
        try {
            return HexFormat.of()
                    .formatHex(MessageDigest.getInstance("SHA-256")
                            .digest(value.getBytes(java.nio.charset.StandardCharsets.US_ASCII)));
        } catch (NoSuchAlgorithmException impossible) {
            throw new IllegalStateException(impossible);
        }
    }

    private record MachineToken(UUID id, String proof) {
        @Override
        public String toString() {
            return "MachineToken[" + id + "]";
        }
    }

    public record PublicationCredential(UUID token, String proof, String session) {
        public static final PublicationCredential ANONYMOUS = new PublicationCredential(null, null, null);

        @Override
        public String toString() {
            return "PublicationCredential[token=" + token + ", session=" + (session != null) + "]";
        }
    }
}
