package io.edition.concepts.dnslookup.api;

import java.util.List;

/** 权威 TXT 查询出口。空列表 = 无记录 / NXDOMAIN；超时与不可用必须抛出，不得降成 empty。 */
public interface DnsLookupApi {
    List<String> lookupTxt(String name);

    final class Timeout extends RuntimeException {
        public Timeout(String message, Throwable cause) {
            super(message, cause);
        }

        public Timeout(String message) {
            super(message);
        }
    }

    final class Unavailable extends RuntimeException {
        public Unavailable(String message, Throwable cause) {
            super(message, cause);
        }

        public Unavailable(String message) {
            super(message);
        }
    }
}
