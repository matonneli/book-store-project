package com.example.bookstore.model;

import com.example.bookstore.enums.ItemType;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.example.bookstore.enums.ItemStatus;

@Entity
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer orderItemId;
    private Integer orderId;
    private Integer bookId;
    @Enumerated(EnumType.STRING)
    private ItemType type;
    private Integer rentalDays;
    private LocalDateTime rentalStartAt;
    private LocalDateTime rentalEndAt;
    @Enumerated(EnumType.STRING)
    private ItemStatus itemStatus;

    public OrderItem() {}

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

    public ItemType getType() {
        return type;
    }

    public void setType(ItemType type) {
        this.type = type;
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