package io.edition.control.modules.customdomain.api;

/** CustomDomain 状态变化事件，不点名其他概念。 */
public final class CustomDomainEvents {
    private CustomDomainEvents() {}

    public record Bound(CustomDomainApi.View domain) {}

    public record Verified(CustomDomainApi.View domain) {}

    public record PrimarySet(CustomDomainApi.View domain) {}

    public record Unbound(String host, java.util.UUID target) {}
}
