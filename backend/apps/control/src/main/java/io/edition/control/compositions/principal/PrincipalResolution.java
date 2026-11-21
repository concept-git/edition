package io.edition.control.compositions.principal;

import io.edition.concepts.permission.api.PermissionApi.PrincipalType;
import io.edition.control.compositions.principal.PrincipalResolver.Credential;
import io.edition.control.compositions.principal.PrincipalResolver.Resolution;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;

/**
 * 凭据 → 主体的唯一入口：按注册顺序询问全部 {@link PrincipalResolver}，第一个识别者胜出。
 *
 * <p>每次解析都可能触发一次 Session/Token 查库，因此 flow 应只解析一次并把
 * {@link Resolution} 沿调用链传递，而不是在 guard、幂等、投影各处各解一遍。
 */
@Component
public final class PrincipalResolution {

    private final List<PrincipalResolver> resolvers;

    public PrincipalResolution(List<PrincipalResolver> resolvers) {
        this.resolvers = List.copyOf(resolvers);
    }

    public Optional<Resolution> find(Credential credential) {
        return resolvers.stream()
                .map(resolver -> resolver.resolve(credential))
                .flatMap(Optional::stream)
                .findFirst();
    }

    /** 无人识别即认证失败（401），与已认证主体的授权失败（403）严格区分。 */
    public Resolution require(Credential credential) {
        return find(credential).orElseThrow(UnresolvedPrincipalException::new);
    }

    public Resolution require(String credential) {
        return require(new Credential(credential));
    }

    /**
     * 只接受自然人会话的入口（如签发 API 令牌、本人注销）：机器主体或匿名者无法完成，
     * 按"凭据不能证明是该类主体"处理为 401，而非 403。
     */
    public UUID requireUser(String credential) {
        var principal = require(credential).principal();
        if (principal.type() != PrincipalType.USER || principal.id() == null) {
            throw new UnresolvedPrincipalException();
        }
        return principal.id();
    }

    /** A management PAT cannot mint credentials or perform account proof operations. */
    public UUID requireSessionUser(String credential) {
        var resolution = require(credential);
        if (resolution.managementCredential().isPresent()) {
            throw new io.edition.control.compositions.access.PermissionDeniedException();
        }
        var principal = resolution.principal();
        if (principal.type() != PrincipalType.USER || principal.id() == null) throw new UnresolvedPrincipalException();
        return principal.id();
    }
}
