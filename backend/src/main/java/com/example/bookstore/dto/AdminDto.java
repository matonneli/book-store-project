package com.example.bookstore.dto;

import com.example.bookstore.enums.Role;

public class AdminDto {
    private String username;
    private String fullName;
    private Role role;
    private PickUpPointDto pickUpPoint;
    public AdminDto() {}

    public AdminDto(String username, String fullName, Role role, PickUpPointDto pickUpPoint) {
        this.username = username;
        this.fullName = fullName;
        this.role = role;
        this.pickUpPoint = pickUpPoint;
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

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public PickUpPointDto getPickUpPoint() {
        return pickUpPoint;
    }

    public void setPickUpPoint(PickUpPointDto pickUpPoint) {
        this.pickUpPoint = pickUpPoint;
    }
}

