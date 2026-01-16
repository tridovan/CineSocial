package com.cine.social.common.exception;


import com.cine.social.common.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(value = Exception.class)
    ResponseEntity<ApiResponse> handlingRuntimeException(RuntimeException exception) {
        log.error("Exception: ", exception);
        return ResponseEntity.badRequest().body(ApiResponse.error(CommonErrorCode.UNCATEGORIZED_EXCEPTION));
    }

    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse> handlingAppException(AppException exception) {
        ErrorCode errorCode = exception.getErrorCode();
        log.error("Exception: ", exception);
        return ResponseEntity.status(errorCode.getStatusCode()).body(ApiResponse.error(errorCode));
    }

    @ExceptionHandler(value = AccessDeniedException.class)
    ResponseEntity<ApiResponse> handlingAccessDeniedException(AccessDeniedException exception) {
        CommonErrorCode errorCode = CommonErrorCode.UNAUTHORIZED;
        log.error("Exception: ", exception);
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.error(errorCode));
    }

    @ExceptionHandler(value = BadCredentialsException.class)
    ResponseEntity<ApiResponse> handlingBadCredentialsException(BadCredentialsException exception) {
        CommonErrorCode errorCode = CommonErrorCode.BAD_CREDENTIAL;
        log.error("Exception: ", exception);
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.error(errorCode));
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handlingValidation(MethodArgumentNotValidException exception) {
        Map<String, String> errors = new HashMap<>();

        exception.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        ApiResponse<Map<String, String>> apiResponse = ApiResponse.<Map<String, String>>builder()
                .code(CommonErrorCode.VALIDATION_ERROR.getCode())
                .message(CommonErrorCode.VALIDATION_ERROR.getMessage())
                .data(errors)
                .build();

        return ResponseEntity.status(CommonErrorCode.VALIDATION_ERROR.getStatusCode()).body(apiResponse);
    }
}
