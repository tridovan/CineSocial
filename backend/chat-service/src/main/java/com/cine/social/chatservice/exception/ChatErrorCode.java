package com.cine.social.chatservice.exception;

import com.cine.social.common.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ChatErrorCode implements ErrorCode {
    INVALID_MESSAGE(8400,"Message must have either roomId or recipientId", HttpStatus.BAD_REQUEST ),
    UNCATEGORIZED_EXCEPTION(8401, "Internal WebSocket Error", HttpStatus.INTERNAL_SERVER_ERROR),
    USER_ID_NOT_FOUND(8402, "User ID not found" , HttpStatus.BAD_REQUEST),
    CHAT_ROOM_NOT_FOUND(8403,"Chat room not found" , HttpStatus.BAD_REQUEST );



    ChatErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}
