package com.example.bookstore.dto;

import com.example.bookstore.enums.ItemStatus;

import java.time.LocalDateTime;

public class RentalItemDto {
    private Integer orderItemId;
    private Integer orderId;
    private Integer bookId;
    private String bookTitle;
    private String authorFullName;
    private String imageUrl;
    private Integer rentalDays;
    private LocalDateTime rentalStartAt;
    private LocalDateTime rentalEndAt;
    private ItemStatus itemStatus;

    public RentalItemDto() {}

    public Integer getOrderItemId() {
        return orderItemId;
    }

    public void setOrderItemId(Integer orderItemId) {
        this.orderItemId = orderItemId;
    }

    public Integer getOrderId() {
        return orderId;
    }

    public void setOrderId(Integer orderId) {
        this.orderId = orderId;
    }

    public Integer getBookId() {
        return bookId;
    }

    public void setBookId(Integer bookId) {
        this.bookId = bookId;
    }

    public String getBookTitle() {
        return bookTitle;
    }

    public void setBookTitle(String bookTitle) {
        this.bookTitle = bookTitle;
    }

    public String getAuthorFullName() {
        return authorFullName;
    }

    public void setAuthorFullName(String authorFullName) {
        this.authorFullName = authorFullName;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getRentalDays() {
        return rentalDays;
    }

    public void setRentalDays(Integer rentalDays) {
        this.rentalDays = rentalDays;
    }

    public LocalDateTime getRentalStartAt() {
        return rentalStartAt;
    }

    public void setRentalStartAt(LocalDateTime rentalStartAt) {
        this.rentalStartAt = rentalStartAt;
    }

    public LocalDateTime getRentalEndAt() {
        return rentalEndAt;
    }

    public void setRentalEndAt(LocalDateTime rentalEndAt) {
        this.rentalEndAt = rentalEndAt;
    }

    public ItemStatus getItemStatus() {
        return itemStatus;
    }

    public void setItemStatus(ItemStatus itemStatus) {
        this.itemStatus = itemStatus;
    }
}