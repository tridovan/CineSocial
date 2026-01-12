package com.cine.social.chatservice.exception;


import com.cine.social.common.dto.response.ApiResponse;
import com.cine.social.common.exception.AppException;
import com.cine.social.common.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.web.bind.annotation.ControllerAdvice;

@ControllerAdvice
@Slf4j
public class WebsocketExceptionHandler {


    @MessageExceptionHandler(AppException.class)
    @SendToUser("/queue/errors")
    public ApiResponse<Object> handleAppException(AppException e) {
        log.error("WebSocket Business Error: {}", e.getMessage());
        return ApiResponse.builder()
                .code(e.getErrorCode().getCode())
                .message(e.getMessage())
                .build();
    }

    @MessageExceptionHandler(Exception.class)
    @SendToUser("/queue/errors")
    public ApiResponse<Object> handleSystemException(Exception e) {
        log.error("WebSocket System Error: ", e);
        ChatErrorCode errorCode = ChatErrorCode.UNCATEGORIZED_EXCEPTION;
        return ApiResponse.builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();
    }
}
