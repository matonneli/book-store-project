package com.example.bookstore.model;

import com.example.bookstore.enums.ItemType;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer cartItemId;
    private Integer cartId;
    private Integer bookId;
    @Enumerated(EnumType.STRING)
    private ItemType type;
    private Integer rentalDays;
    private LocalDateTime addedAt;

    public CartItem() {}
    public Integer getCartItemId() {
        return cartItemId;
    }
    public void setCartItemId(Integer cartItemId) {
        this.cartItemId = cartItemId;
    }
    public Integer getCartId() {
        return cartId;
    }
    public void setCartId(Integer cartId) {
        this.cartId = cartId;
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

    public LocalDateTime getAddedAt() {
        return addedAt;
    }
    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
}