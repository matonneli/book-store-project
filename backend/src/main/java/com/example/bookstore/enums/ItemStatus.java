package com.example.bookstore.enums;

public enum ItemStatus {
        PENDING,
        DELIVERED,  //for purchased books
        RENTED,     //for rented books(rented for now)
        RETURNED,   //for rented books(if returned by client)
        OVERDUE,     //for rented books(return is overdue)
        CANCELLED   // for items in cancelled orders
}
