package io.edition.control.compositions.access;

import io.edition.concepts.user.api.UserApi;
import io.edition.control.compositions.principal.PrincipalResolution;
import io.edition.control.compositions.principal.PrincipalResolver;
import org.springframework.stereotype.Component;

/**
 * 平台运维面的前置（platform/SYNCS.md 的 platformOperator 模板）。
 *
 * <p>它不走资源链：运维面在任何租户之外，无链可判。改用主体属性判定，并刻意保持最小特权——
 * 通过这里只解锁 /admin 与 /ops，对租户内资源零隐式权限。
 */
@Component
public final class PlatformOperatorGuard {

    private final PrincipalResolution principals;
    private final UserApi users;

    public PlatformOperatorGuard(PrincipalResolution principals, UserApi users) {
        this.principals = principals;
        this.users = users;
    }

    /** sync platformOperatorRequired 的落地：非运营员 403，主体无法解析 401。 */
    public UserApi.UserId require(PrincipalResolver.Credential credential) {
        return require(principals.require(credential));
    }

    public UserApi.UserId require(PrincipalResolver.Resolution resolution) {
        if (resolution.managementCredential().map(c -> c.tenantId() != null).orElse(false)) {
            throw new PlatformOperatorRequiredException();
        }
        var principal = resolution.principal();
        // 匿名与机器主体没有用户身份，天然不可能是运营员。
        if (principal.type() != io.edition.concepts.permission.api.PermissionApi.PrincipalType.USER
                || principal.id() == null) {
            throw new PlatformOperatorRequiredException();
        }
        var operator = new UserApi.UserId(principal.id());
        if (!users.isPlatformOperator(operator)) {
            throw new PlatformOperatorRequiredException();
        }
        return operator;
    }

    public UserApi.UserId require(String credential) {
        return require(new PrincipalResolver.Credential(credential));
    }
}
