package io.edition.delivery.contract;

import java.net.IDN;
import java.util.Locale;

public record ReaderOrigin(String scheme, String host, String port) {
    public static ReaderOrigin resolve(String scheme, String authority) {
        return new ReaderOrigin(scheme, normalizeHost(authority), portSuffix(authority, scheme));
    }

    public static String first(String value) {
        int comma = value.indexOf(',');
        return (comma < 0 ? value : value.substring(0, comma)).strip();
    }

    private static String normalizeHost(String authority) {
        String value = authority.strip().toLowerCase(Locale.ROOT);
        int colon = value.lastIndexOf(':');
        if (colon > 0 && value.indexOf(':') == colon) value = value.substring(0, colon);
        return IDN.toASCII(value);
    }

    private static String portSuffix(String authority, String scheme) {
        int colon = authority.lastIndexOf(':');
        if (colon <= 0 || authority.indexOf(':') != colon) return "";
        String raw = authority.substring(colon + 1);
        try {
            int port = Integer.parseInt(raw);
            if ((scheme.equals("https") && port == 443) || (scheme.equals("http") && port == 80)) return "";
            return ':' + raw;
        } catch (NumberFormatException invalid) {
            return "";
        }
    }

    public String absolute(String canonicalHost, String path) {
        return scheme + "://" + canonicalHost + port + path;
    }
}
