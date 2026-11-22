package io.edition.control.modules.dnslookup.system;

import io.edition.control.modules.dnslookup.api.*;
import io.edition.control.modules.dnslookup.api.DnsLookupApi;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;
import java.util.Locale;
import javax.naming.NamingEnumeration;
import javax.naming.NamingException;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "io.edition.dns.resolver", havingValue = "system", matchIfMissing = true)
class SystemDnsLookup implements DnsLookupApi {
    private static final Duration INITIAL = Duration.ofSeconds(2);
    private static final int RETRIES = 2;

    @Override
    public List<String> lookupTxt(String name) {
        Hashtable<String, String> env = new Hashtable<>();
        env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");
        env.put("java.naming.provider.url", "dns:");
        env.put("com.sun.jndi.dns.timeout.initial", String.valueOf(INITIAL.toMillis()));
        env.put("com.sun.jndi.dns.timeout.retries", String.valueOf(RETRIES));
        try {
            DirContext context = new InitialDirContext(env);
            try {
                Attributes attributes = context.getAttributes(name, new String[] {"TXT"});
                Attribute txt = attributes.get("TXT");
                if (txt == null) return List.of();
                List<String> values = new ArrayList<>();
                NamingEnumeration<?> enumeration = txt.getAll();
                while (enumeration.hasMore()) {
                    values.add(stripQuotes(String.valueOf(enumeration.next())));
                }
                return List.copyOf(values);
            } finally {
                context.close();
            }
        } catch (NamingException failure) {
            String message =
                    failure.getMessage() == null ? "" : failure.getMessage().toLowerCase(Locale.ROOT);
            if (message.contains("not found") || message.contains("name does not exist")) {
                return List.of();
            }
            if (message.contains("timed out") || message.contains("timeout")) {
                throw new Timeout("DNS lookup timed out for " + name, failure);
            }
            throw new Unavailable("DNS lookup unavailable for " + name, failure);
        }
    }

    private static String stripQuotes(String value) {
        String trimmed = value.strip();
        if (trimmed.length() >= 2 && trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
            return trimmed.substring(1, trimmed.length() - 1);
        }
        return trimmed;
    }
}
