package com.example.bookstore.service;

import com.example.bookstore.dto.AnalyticsOverallDto;
import com.example.bookstore.dto.AnalyticsPeriodDto;
import com.example.bookstore.dto.AnalyticsPickupPointDto;
import com.example.bookstore.enums.Role;
import com.example.bookstore.exception.UnauthorizedException;
import com.example.bookstore.model.Admin;
import com.example.bookstore.repository.AdminAnalyticsPickupPointRepository;
import com.example.bookstore.repository.AdminAnalyticsRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class AdminAnalyticsService {

    private static final int TOP_BOOKS_LIMIT = 5;

    private final AdminAnalyticsRepository repo;
    private final AdminAnalyticsPickupPointRepository repo1;

    public AdminAnalyticsService(AdminAnalyticsRepository repo, AdminAnalyticsPickupPointRepository repo1) {
        this.repo = repo;
        this.repo1 = repo1;
    }

    public AnalyticsOverallDto getOverall() {
        BigDecimal totalRevenue = repo.getTotalRevenue();
        BigDecimal totalRefunds = repo.getTotalRefunds();

        return new AnalyticsOverallDto(
                totalRevenue,
                totalRefunds,
                totalRevenue.subtract(totalRefunds),
                repo.getAvgOrderValue(),
                repo.getOrdersByStatus(),
                repo.getTotalBuyItems(),
                repo.getTotalRentItems(),
                repo.getTopBooksBySales(TOP_BOOKS_LIMIT),
                repo.getTopBooksByRentals(TOP_BOOKS_LIMIT),
                repo.getTopRatedBooks(TOP_BOOKS_LIMIT),
                repo.getTotalClients(),
                repo.getClientGrowthMonthly(),
                repo.getOrdersByPickupPoint()
        );
    }

    public AnalyticsPeriodDto getPeriod(int days) {
        if (days != 7 && days != 30) {
            throw new IllegalArgumentException("Days must be 7 or 30");
        }

        BigDecimal revenue = repo.getRevenueForPeriod(days);
        BigDecimal refunds = repo.getRefundsForPeriod(days);

        return new AnalyticsPeriodDto(
                revenue,
                refunds,
                revenue.subtract(refunds),
                repo.getAvgOrderValueForPeriod(days),
                repo.getTotalOrdersForPeriod(days),
                repo.getOrdersByStatusForPeriod(days),
                repo.getBuyItemsForPeriod(days),
                repo.getRentItemsForPeriod(days),
                repo.getTopBooksForPeriod(days, TOP_BOOKS_LIMIT),
                repo.getNewClientsForPeriod(days),
                repo.getRevenueOverTime(days)
        );
    }


}