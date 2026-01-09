package com.cine.social.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum CommonErrorCode implements ErrorCode {
    UNCATEGORIZED_EXCEPTION(1001, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    VALIDATION_ERROR(1002, "Invalid input data", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(1003, "You do not have permission", HttpStatus.FORBIDDEN),
    UNAUTHENTICATED(1004, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    INVALID_TOKEN(1005, "Invalid token", HttpStatus.UNAUTHORIZED),
    ACCESS_TOKEN_EXPIRED(1006, "Access token expired", HttpStatus.UNAUTHORIZED),
    USER_NOT_FOUND(1007,"User not found", HttpStatus.BAD_REQUEST );

    CommonErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}
