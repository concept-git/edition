package io.edition.control.compositions.principal;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import java.util.Map;
import org.springframework.stereotype.Component;

/**
 * 会话签名密钥的公开投影。gateway 只见 sync 与 shared，故由本层把私钥持有者
 * 降解为「只含公钥」的 JWK Set，端点无从触碰私钥材料。
 */
@Component
public class JwkSetProvider {

    private final RSAKey key;

    JwkSetProvider(RSAKey key) {
        this.key = key;
    }

    public Map<String, Object> publicJwkSet() {
        return new JWKSet(key.toPublicJWK()).toJSONObject();
    }
}
