package com.cine.social.common.utils;

import com.cine.social.common.exception.AppException;
import com.cine.social.common.exception.CommonErrorCode;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Objects;
import java.util.Optional;

public class SecurityUtils {

    private SecurityUtils() {}

    public static String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (Objects.isNull(authentication) || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AppException(CommonErrorCode.UNAUTHENTICATED);
        }

        return authentication.getName();
    }

    public static Optional<String> getCurrentToken() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (Objects.nonNull(authentication) && authentication.getCredentials() instanceof String) {
            return Optional.of((String) authentication.getCredentials());
        }
        return Optional.empty();
    }
}