package com.chatapp.authent_service.Exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.chatapp.authent_service.DTO.Response.APIResponse;

@ControllerAdvice
public class GlobalException {
    @ExceptionHandler(Exception.class)
    ResponseEntity<APIResponse<?>> handleRuntimeException (RuntimeException e) {
        APIResponse<?> response = new APIResponse<>();
        response.setCode(ErrorCode.UNCATEGORIZED.getCode());
        response.setMessage(ErrorCode.UNCATEGORIZED.getMessage());
        return ResponseEntity.status(ErrorCode.UNCATEGORIZED.getStatus()).body(response);
    }


    @ExceptionHandler(AppException.class)
    ResponseEntity<APIResponse<?>> handleAppException (AppException e) {
        ErrorCode errorCode = e.getErrorCode();
        APIResponse<?> response = new APIResponse<>();
        response.setCode(e.getErrorCode().getCode());
        response.setMessage(e.getErrorCode().getMessage());
        return ResponseEntity.status(errorCode.getStatus()).body(response);
    }
}
