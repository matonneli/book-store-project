package com.example.bookstore.exception;

public class TooManyAttemptsException extends RuntimeException {
    public TooManyAttemptsException(String message) {
        super(message);
    }

    public TooManyAttemptsException(String message, Throwable cause) {
        super(message, cause);
    }
}