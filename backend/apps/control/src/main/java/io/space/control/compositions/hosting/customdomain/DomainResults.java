package io.space.control.compositions.hosting.customdomain;

import io.space.concepts.customdomain.api.CustomDomainApi;
import io.space.concepts.customdomain.api.Host;

final class DomainResults {
    private DomainResults() {}

    static String host(String raw) {
        try {
            return new Host(raw).value();
        } catch (Host.Invalid ignored) {
            throw new DomainHostInvalidException();
        }
    }

    static CustomDomainApi.View bound(CustomDomainApi.BindResult result) {
        return switch (result) {
            case CustomDomainApi.BindResult.Bound ok -> ok.domain();
            case CustomDomainApi.BindResult.Taken ignored -> throw new DomainTakenException();
            case CustomDomainApi.BindResult.HostInvalid ignored -> throw new DomainHostInvalidException();
        };
    }

    static CustomDomainApi.View verified(CustomDomainApi.VerifyResult result) {
        return switch (result) {
            case CustomDomainApi.VerifyResult.Verified ok -> ok.domain();
            case CustomDomainApi.VerifyResult.NotFound ignored -> throw new DomainNotFoundException();
            case CustomDomainApi.VerifyResult.NotProven ignored -> throw new DomainNotProvenException();
            case CustomDomainApi.VerifyResult.HostInvalid ignored -> throw new DomainHostInvalidException();
        };
    }

    static CustomDomainApi.View primary(CustomDomainApi.SetPrimaryResult result) {
        return switch (result) {
            case CustomDomainApi.SetPrimaryResult.Changed ok -> ok.domain();
            case CustomDomainApi.SetPrimaryResult.NotFound ignored -> throw new DomainNotFoundException();
            case CustomDomainApi.SetPrimaryResult.NotVerified ignored -> throw new DomainNotVerifiedException();
            case CustomDomainApi.SetPrimaryResult.HostInvalid ignored -> throw new DomainHostInvalidException();
        };
    }

    static void unbound(CustomDomainApi.UnbindResult result) {
        switch (result) {
            case CustomDomainApi.UnbindResult.Unbound ignored -> {}
            case CustomDomainApi.UnbindResult.HostInvalid ignored -> throw new DomainHostInvalidException();
        }
    }

    static CustomDomainTypes.DomainDetail detail(CustomDomainApi.View view) {
        return new CustomDomainTypes.DomainDetail(
                view.host(), view.verified(), view.isPrimary(), view.dnsToken(), view.txtName(), view.txtValue());
    }

    static CustomDomainApi.View requireOnSite(java.util.List<CustomDomainApi.View> hosts, String host) {
        return hosts.stream()
                .filter(item -> item.host().equals(host))
                .findFirst()
                .orElseThrow(DomainNotFoundException::new);
    }
}
