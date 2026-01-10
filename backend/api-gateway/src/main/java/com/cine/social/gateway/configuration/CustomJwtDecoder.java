package com.cine.social.gateway.configuration;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import javax.crypto.spec.SecretKeySpec;

@Component
@Slf4j
public class CustomJwtDecoder implements ReactiveJwtDecoder {
    @Value("${jwt.signerKey}")
    private String signerKey;

    private NimbusReactiveJwtDecoder nimbusJwtDecoder;

    @PostConstruct
    public void init() {
        SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS512");
        nimbusJwtDecoder = NimbusReactiveJwtDecoder.withSecretKey(secretKeySpec)
                .macAlgorithm(MacAlgorithm.HS512)
                .build();
    }


    @Override
    public Mono<Jwt> decode(String token) throws JwtException {
        return nimbusJwtDecoder.decode(token);
    }

}
