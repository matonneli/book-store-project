package com.example.bookstore.dto;

public class CreateWorkerRequest {
    private String username;
    private String password;
    private String fullName;
    private String email;
    private Integer pickupPointId;

    public CreateWorkerRequest() {}

    public CreateWorkerRequest(String username, String password, String fullName, String email, Integer pickupPointId) {
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.email = email;
        this.pickupPointId = pickupPointId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Integer getPickupPointId() {
        return pickupPointId;
    }

    public void setPickupPointId(Integer pickupPointId) {
        this.pickupPointId = pickupPointId;
    }
}