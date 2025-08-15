package com.example.bookstore.dto;

import java.math.BigDecimal;
import java.util.List;

public class CartDto {
    private List<CartItemDto> items;
    private BigDecimal totalAmount;        //sum of all item prices
    private BigDecimal totalDiscount;      //sum of all discounts applied
    private Integer itemsCount;            //total number of items
    private final Integer maxItems = 4;    //maximum items allowed
    private Integer remainingSlots;        //maxItems - itemsCount

    // Constructors
    public CartDto() {}

    public CartDto(List<CartItemDto> items) {
        this.items = items;
        this.itemsCount = items != null ? items.size() : 0;
        this.remainingSlots = maxItems - itemsCount;
        calculateTotals();
    }

    // Calculate total amount and discount from items
    private void calculateTotals() {
        if (items == null || items.isEmpty()) {
            this.totalAmount = BigDecimal.ZERO;
            this.totalDiscount = BigDecimal.ZERO;
            return;
        }

        this.totalAmount = items.stream()
                .map(CartItemDto::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.totalDiscount = items.stream()
                .map(item -> {
                    if (item.getOriginalPrice() != null && item.getPrice() != null) {
                        return item.getOriginalPrice().subtract(item.getPrice());
                    }
                    return BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Getters and Setters
    public List<CartItemDto> getItems() {
        return items;
    }

    public void setItems(List<CartItemDto> items) {
        this.items = items;
        this.itemsCount = items != null ? items.size() : 0;
        this.remainingSlots = maxItems - itemsCount;
        calculateTotals();
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getTotalDiscount() {
        return totalDiscount;
    }

    public void setTotalDiscount(BigDecimal totalDiscount) {
        this.totalDiscount = totalDiscount;
    }

    public Integer getItemsCount() {
        return itemsCount;
    }

    public void setItemsCount(Integer itemsCount) {
        this.itemsCount = itemsCount;
        this.remainingSlots = maxItems - itemsCount;
    }

    public Integer getMaxItems() {
        return maxItems;
    }

    public Integer getRemainingSlots() {
        return remainingSlots;
    }

    public void setRemainingSlots(Integer remainingSlots) {
        this.remainingSlots = remainingSlots;
    }

    public boolean isFull() {
        return itemsCount >= maxItems;
    }
}