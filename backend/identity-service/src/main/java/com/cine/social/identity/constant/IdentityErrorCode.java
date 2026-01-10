package com.cine.social.identity.constant;

import com.cine.social.common.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum IdentityErrorCode implements ErrorCode {
    CAN_NOT_CREATE_JWT_TOKEN(8100,"There are troubles in server that prevent the JWT token from being generate" , HttpStatus.INTERNAL_SERVER_ERROR),
    EXISTED_EMAIL(8101,"Email is existed" , HttpStatus.BAD_REQUEST);

    IdentityErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}
