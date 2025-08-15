package com.example.bookstore.dto;

public class LoginResponseDto {
    private String token;
    private UserBasicInfoDto user;
    private String message;

    public LoginResponseDto(String token, UserBasicInfoDto user, String message) {
        this.token = token;
        this.user = user;
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UserBasicInfoDto getUser() {
        return user;
    }

    public void setUser(UserBasicInfoDto user) {
        this.user = user;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
