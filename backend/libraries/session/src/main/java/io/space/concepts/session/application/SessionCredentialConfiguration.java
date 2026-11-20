package io.space.concepts.session.application;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import io.space.concepts.session.api.*;
import io.space.concepts.session.api.SessionApi.SessionId;
import io.space.concepts.session.domain.SessionRepository;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.*;
import java.security.interfaces.*;
import java.security.spec.*;
import java.time.Clock;
import java.util.Arrays;
import java.util.Base64;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.oauth2.core.*;
import org.springframework.security.oauth2.jwt.*;

/** 管理会话的签名与校验配置；密钥默认必填，认证校验结合有效会话及撤销屏障。 */
@Configuration
class SessionCredentialConfiguration {

    private static final Logger log = LoggerFactory.getLogger(SessionCredentialConfiguration.class);

    @Bean
    RSAKey sessionRsaKey(
            Environment environment,
            @Value("${io.space.session.key-id:space-session-1}") String keyId,
            @Value("${io.space.session.private-key:}") String privateKey,
            @Value("${io.space.session.public-key:}") String publicKey,
            @Value("${io.space.session.allow-ephemeral-key:false}") boolean allowEphemeral)
            throws Exception {
        boolean test = Arrays.asList(environment.getActiveProfiles()).contains("test");
        if (privateKey.isBlank() || publicKey.isBlank()) {
            // 默认要求固定密钥；显式开启的临时密钥仅供本地运行，重启会使已有 access token 失效。
            if (!allowEphemeral) {
                throw new IllegalStateException(
                        "session RSA private/public PEM keys are required; set io.space.session.private-key "
                                + "and io.space.session.public-key, or opt into ephemeral keys with "
                                + "io.space.session.allow-ephemeral-key=true for local runs only");
            }
            log.warn("No session RSA keys configured; generating an ephemeral key pair. "
                    + "Never run production without SESSION_PRIVATE_KEY/SESSION_PUBLIC_KEY.");
            var generator = KeyPairGenerator.getInstance("RSA");
            if (test) {
                var seeded = SecureRandom.getInstance("SHA1PRNG");
                seeded.setSeed("space-session-test-key".getBytes(java.nio.charset.StandardCharsets.UTF_8));
                generator.initialize(2048, seeded);
            } else {
                generator.initialize(2048);
            }
            var pair = generator.generateKeyPair();
            return new RSAKey.Builder((RSAPublicKey) pair.getPublic())
                    .privateKey((RSAPrivateKey) pair.getPrivate())
                    .keyID(keyId)
                    .build();
        }
        var factory = KeyFactory.getInstance("RSA");
        var privateRsa =
                (RSAPrivateKey) factory.generatePrivate(new PKCS8EncodedKeySpec(decodePem(readPem(privateKey))));
        var publicRsa = (RSAPublicKey) factory.generatePublic(new X509EncodedKeySpec(decodePem(readPem(publicKey))));
        return new RSAKey.Builder(publicRsa).privateKey(privateRsa).keyID(keyId).build();
    }

    @Bean
    JwtEncoder sessionJwtEncoder(RSAKey key) {
        return new NimbusJwtEncoder(new ImmutableJWKSet<>(new JWKSet(key)));
    }

    @Bean
    JwtDecoder sessionJwtDecoder(RSAKey key, SessionRepository sessions, Clock clock) throws Exception {
        var decoder = NimbusJwtDecoder.withPublicKey(key.toRSAPublicKey()).build();
        OAuth2TokenValidator<Jwt> activeSession = jwt -> {
            if (jwt.getAudience() != null && jwt.getAudience().contains("reader"))
                return OAuth2TokenValidatorResult.failure(
                        new OAuth2Error("invalid_token", "credential audience is invalid", null));
            final SessionId sid;
            try {
                sid = new SessionId(UUID.fromString(jwt.getClaimAsString("sid")));
            } catch (IllegalArgumentException | NullPointerException malformed) {
                return OAuth2TokenValidatorResult.failure(
                        new OAuth2Error("invalid_token", "session id is invalid", null));
            }
            // 依赖故障必须穿透到顶层 503/504，不能伪装成无效凭据。
            var holder = sessions.activePrincipal(sid, clock.instant());
            if (holder.isPresent() && holder.get().value().toString().equals(jwt.getSubject())) {
                return OAuth2TokenValidatorResult.success();
            }
            return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "session is not active", null));
        };
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(JwtValidators.createDefault(), activeSession));
        return decoder;
    }

    private static String readPem(String configured) throws Exception {
        if (configured.startsWith("-----BEGIN")) return configured;
        return Files.readString(Path.of(configured));
    }

    private static byte[] decodePem(String pem) {
        return Base64.getMimeDecoder()
                .decode(pem.replaceAll("-----BEGIN [^-]+-----", "")
                        .replaceAll("-----END [^-]+-----", "")
                        .replaceAll("\\s", ""));
    }
}
