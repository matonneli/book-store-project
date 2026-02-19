package com.example.bookstore.record;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RevenuePointDto(LocalDate date, BigDecimal revenue, BigDecimal refunds) {}
