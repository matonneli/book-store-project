package com.example.bookstore.dto;

public class UpdateWorkerRequest {
    private String username;
    private String fullName;
    private String email;
    private Integer pickupPointId;
    private String password;

    public UpdateWorkerRequest() {}

    public UpdateWorkerRequest(String username, String fullName, String email, Integer pickupPointId, String password) {
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.pickupPointId = pickupPointId;
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}