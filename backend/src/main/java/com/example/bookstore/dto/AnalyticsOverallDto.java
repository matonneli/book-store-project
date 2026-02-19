package com.example.bookstore.dto;

import com.example.bookstore.record.BookRatingDto;
import com.example.bookstore.record.BookStatDto;
import com.example.bookstore.record.ClientGrowthDto;
import com.example.bookstore.record.PickupPointStatDto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record AnalyticsOverallDto(
        BigDecimal totalRevenue,
        BigDecimal totalRefunds,
        BigDecimal netRevenue,
        BigDecimal avgOrderValue,
        Map<String, Long> ordersByStatus,
        long totalBuyItems,
        long totalRentItems,
        List<BookStatDto> topBooksBySales,
        List<BookStatDto> topBooksByRentals,
        List<BookRatingDto> topRatedBooks,
        long totalClients,
        List<ClientGrowthDto> clientGrowthMonthly,
        List<PickupPointStatDto> ordersByPickupPoint
) {}