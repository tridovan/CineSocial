package com.cine.social.post.constant;

import com.cine.social.common.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum PostErrorCode implements ErrorCode {
    POST_NOT_FOUND(8200,"Post not found", HttpStatus.BAD_REQUEST),
    INVALID_VOTE_VALUE(8201,"Vote value must be 1 (Like), -1(DisLike) or 0(Nothing)" , HttpStatus.BAD_REQUEST ),
    COMMENT_NOT_FOUND(8202, "Comment not found", HttpStatus.BAD_REQUEST),
    COMMENT_NOT_SAME_THE_POST(8203,"Comment not in the same post" , HttpStatus.BAD_REQUEST),
    INVALID_COMMENT(8204, "There are no content or image in comment", HttpStatus.BAD_REQUEST),
    ;



    PostErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}
