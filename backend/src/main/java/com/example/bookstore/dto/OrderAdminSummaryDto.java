package com.example.bookstore.dto;

public class OrderAdminSummaryDto extends OrderSummaryDto {
    private Integer userId;
    private String email;

    public OrderAdminSummaryDto() {}

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}