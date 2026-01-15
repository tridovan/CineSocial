package com.cine.social.common.configuration;

import com.cine.social.common.exception.GlobalExceptionHandler;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Import;
import com.cine.social.common.security.CustomJwtDecoder;
import com.cine.social.common.security.JwtAuthenticationEntryPoint;

@AutoConfiguration
@EnableConfigurationProperties(SecurityProperties.class)
@Import({
    SharedSecurityConfig.class,
    CustomJwtDecoder.class,
    JwtAuthenticationEntryPoint.class,
    GlobalExceptionHandler.class,
    OpenApiConfig.class
})
public class CineCommonAutoConfiguration {
}