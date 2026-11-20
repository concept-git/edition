package io.space.control.compositions.hosting.sitedelivery;

import java.net.URI;
import java.net.URISyntaxException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Reader links use deployment configuration and verified snapshot hosts, never request headers. */
@Component
final class ReaderAddress {
    private final String scheme;
    private final int port;

    ReaderAddress(
            @Value("${io.space.delivery.reader-public-scheme:https}") String scheme,
            @Value("${io.space.delivery.reader-public-port:-1}") int port) {
        if (!(scheme.equals("http") || scheme.equals("https")) || !(port == -1 || port > 0 && port <= 65535))
            throw new IllegalArgumentException("Invalid public Reader scheme or port");
        this.scheme = scheme;
        this.port = port;
    }

    String href(String verifiedHost, String slug) {
        if (verifiedHost == null) return null;
        try {
            return new URI(scheme, null, verifiedHost, port, slug == null ? "/" : "/" + slug, null, null)
                    .toASCIIString();
        } catch (URISyntaxException invalidVerifiedHost) {
            throw new IllegalStateException("Invalid verified Reader address", invalidVerifiedHost);
        }
    }
}
