package com.chatapp.authent_service.Exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public enum ErrorCode {
    USER_NOT_FOUND(404, "User not found", HttpStatus.NOT_FOUND),
    UNCATEGORIZED(500, "Uncategorized_error", HttpStatus.INTERNAL_SERVER_ERROR),
    USER_ALREADY_EXIST(409, "User already exist", HttpStatus.CONFLICT),
    UNAUTHENTICATED(400, "Unauthenticated", HttpStatus.UNAUTHORIZED);

    public int code;
    public String message;
    public HttpStatus status;

    private ErrorCode (int code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }
}
