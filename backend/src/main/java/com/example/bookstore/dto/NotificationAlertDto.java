package com.example.bookstore.dto;

public class NotificationAlertDto {

    private boolean hasReadyForPickup;
    private boolean hasOverdueRentals;

    public NotificationAlertDto(boolean hasReadyForPickup, boolean hasOverdueRentals) {
        this.hasReadyForPickup = hasReadyForPickup;
        this.hasOverdueRentals = hasOverdueRentals;
    }

    public boolean isHasReadyForPickup() {
        return hasReadyForPickup;
    }

    public void setHasReadyForPickup(boolean hasReadyForPickup) {
        this.hasReadyForPickup = hasReadyForPickup;
    }

    public boolean isHasOverdueRentals() {
        return hasOverdueRentals;
    }

    public void setHasOverdueRentals(boolean hasOverdueRentals) {
        this.hasOverdueRentals = hasOverdueRentals;
    }
}