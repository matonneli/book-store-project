package com.example.bookstore.dto;

import com.example.bookstore.record.BookStatDto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record AnalyticsPickupPointDto(
        int pickupPointId,
        String pickupPointName,
        long totalOrders,
        Map<String, Long> ordersByStatus,
        BigDecimal totalRevenue,
        BigDecimal totalRefunds,
        BigDecimal avgOrderValue,
        List<BookStatDto> topBooks,
        Double avgDeliveryHours   // avg time from paid_at to delivered_at
) {}