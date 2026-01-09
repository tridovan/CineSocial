package com.cine.social.common.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.cine.social.common.dto.response.ApiResponse;
import com.cine.social.common.exception.CommonErrorCode;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
    private static ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(
            HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws IOException, ServletException {
        CommonErrorCode errorCode = CommonErrorCode.UNAUTHENTICATED;

        Throwable cause = authException.getCause();

        if (cause instanceof JwtException) {
            if (cause.getMessage().contains("Jwt expired")) {
                errorCode = CommonErrorCode.ACCESS_TOKEN_EXPIRED;
            } else {
                errorCode = CommonErrorCode.INVALID_TOKEN;
            }
        }


        response.setStatus(errorCode.getStatusCode().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ApiResponse<?> apiResponse = ApiResponse.builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();


        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
        response.flushBuffer();
    }
}
