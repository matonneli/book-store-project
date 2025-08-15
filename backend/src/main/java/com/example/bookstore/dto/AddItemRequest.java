package com.example.bookstore.dto;
import com.example.bookstore.enums.ItemType;

public class AddItemRequest {
    private Integer bookId;
    private ItemType type;
    private Integer rentalDays;

    public AddItemRequest() {}

    public Integer getBookId() { return bookId; }
    public void setBookId(Integer bookId) { this.bookId = bookId; }

    public ItemType getType() { return type; }
    public void setType(ItemType type) { this.type = type; }

    public Integer getRentalDays() { return rentalDays; }
    public void setRentalDays(Integer rentalDays) { this.rentalDays = rentalDays; }
}