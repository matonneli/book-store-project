package com.example.bookstore.dto;

import com.example.bookstore.record.BookStatDto;
import com.example.bookstore.record.RevenuePointDto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record AnalyticsPeriodDto(
        BigDecimal revenue,
        BigDecimal refunds,
        BigDecimal netRevenue,
        BigDecimal avgOrderValue,
        long totalOrders,
        Map<String, Long> ordersByStatus,
        long buyItems,
        long rentItems,
        List<BookStatDto> topBooks,
        long newClients,
        List<RevenuePointDto> revenueOverTime
) {}
