package io.edition.control.adapters.inbound.http.system;

import io.edition.control.usecases.principal.JwkSetProvider;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class JwksController {
    private final JwkSetProvider jwks;

    JwksController(JwkSetProvider jwks) {
        this.jwks = jwks;
    }

    @GetMapping("/.well-known/jwks.json")
    Map<String, Object> keys() {
        return jwks.publicJwkSet();
    }
}
