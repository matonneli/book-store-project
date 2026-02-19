package com.example.bookstore.dto;

import com.example.bookstore.enums.Role;

public class WorkerDto {
    private Integer adminId;
    private String username;
    private String fullName;
    private String email;
    private Role role;
    private PickUpPointDto pickUpPoint;

    public WorkerDto() {}

    public WorkerDto(Integer adminId, String username, String fullName, String email, Role role, PickUpPointDto pickUpPoint) {
        this.adminId = adminId;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.pickUpPoint = pickUpPoint;
    }

    public Integer getAdminId() {
        return adminId;
    }

    public void setAdminId(Integer adminId) {
        this.adminId = adminId;
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