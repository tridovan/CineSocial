package com.cine.social.mediaservice.constant;

import com.cine.social.common.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum MediaErrorCode implements ErrorCode {
    INVALID_FILE(8300,"Invalid file", HttpStatus.BAD_REQUEST ),
    EMPTY_FILE(8301, "File is empty" ,HttpStatus.BAD_REQUEST),
    UPLOAD_FAILED(8302,"There are something wrong with upload file" , HttpStatus.INTERNAL_SERVER_ERROR),
    DELETE_FAILED(8303,"File deletion from MinIO failed" , HttpStatus.INTERNAL_SERVER_ERROR );



    MediaErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}
