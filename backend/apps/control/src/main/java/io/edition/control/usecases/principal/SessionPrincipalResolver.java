package io.edition.control.usecases.principal;

import io.edition.control.modules.permission.api.PermissionApi;
import java.util.Optional;
import java.util.UUID;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;

/** Bearer JWT -> active Session -> unrestricted user Principal. */
@Component
class SessionPrincipalResolver implements PrincipalResolver {
    private final JwtDecoder decoder;

    SessionPrincipalResolver(JwtDecoder decoder) {
        this.decoder = decoder;
    }

    @Override
    public Optional<Resolution> resolve(Credential credential) {
        if (credential.value().startsWith("spc_") || credential.value().startsWith("spm_")) {
            return Optional.empty();
        }
        try {
            var jwt = decoder.decode(credential.value());
            // JwtDecoder 的 validator 已以 sid 查询 active Session；此处只翻译已验证的主体，
            // 不做第二次数据库查询，也不捕获依赖故障。
            UUID.fromString(jwt.getClaimAsString("sid"));
            UUID holder = UUID.fromString(jwt.getSubject());
            return Optional.of(
                    Resolution.unrestricted(new PermissionApi.Principal(PermissionApi.PrincipalType.USER, holder)));
        } catch (JwtException | IllegalArgumentException | NullPointerException invalid) {
            return Optional.empty();
        }
    }
}
