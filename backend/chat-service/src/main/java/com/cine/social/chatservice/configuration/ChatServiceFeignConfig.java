package com.cine.social.chatservice.configuration;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Objects;

/**
 * Feign configuration for chat-service that handles both HTTP and WebSocket contexts
 */
@Configuration
@Slf4j
public class ChatServiceFeignConfig {

    @Bean
    public RequestInterceptor chatServiceRequestInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate template) {
                // First, try to get token from WebSocket context (for WebSocket messages)
                String token = WebSocketAuthContext.getToken();

                if (StringUtils.hasText(token)) {
                    template.header("Authorization", "Bearer " + token);
                    log.debug("Using token from WebSocket context");
                    return;
                }

                // Fallback: try to get from HTTP request context (for REST API calls)
                ServletRequestAttributes servletRequestAttributes =
                        (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

                if (Objects.nonNull(servletRequestAttributes)) {
                    var authHeader = servletRequestAttributes.getRequest().getHeader("Authorization");
                    if (StringUtils.hasText(authHeader)) {
                        template.header("Authorization", authHeader);
                        log.debug("Using token from HTTP request context");
                    }
                }
            }
        };
    }
}

