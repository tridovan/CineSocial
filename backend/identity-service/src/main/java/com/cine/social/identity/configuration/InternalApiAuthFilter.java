package com.cine.social.identity.configuration;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Objects;

@Component
@RequiredArgsConstructor
@Slf4j
public class InternalApiAuthFilter extends OncePerRequestFilter {

    @Value("${app.security.internal-api-key}")
    private String internalApiKey;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String requestKey = request.getHeader("X-Internal-Client");

        if (Objects.isNull(requestKey) || !requestKey.equals(internalApiKey)) {
            log.warn("Unauthorized internal access attempt from IP: {}", request.getRemoteAddr());
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("Internal Access Denied");
            return;
        }

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                "INTERNAL_SERVICE",
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_INTERNAL_CLIENT"))
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }
}