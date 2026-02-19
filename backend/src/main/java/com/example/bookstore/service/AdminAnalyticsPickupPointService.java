package com.example.bookstore.service;

import com.example.bookstore.dto.AnalyticsPickupPointDto;
import com.example.bookstore.exception.OrderException;
import com.example.bookstore.model.Admin;
import com.example.bookstore.enums.Role;
import com.example.bookstore.repository.AdminAnalyticsPickupPointRepository;
import org.springframework.stereotype.Service;

@Service
public class AdminAnalyticsPickupPointService {

    private final AdminAnalyticsPickupPointRepository repo;

    public AdminAnalyticsPickupPointService(AdminAnalyticsPickupPointRepository repo) {
        this.repo = repo;
    }

    public AnalyticsPickupPointDto getStats(int pickupPointId, Admin admin) {
        validateAccess(pickupPointId, admin);

        return new AnalyticsPickupPointDto(
                pickupPointId,
                repo.getPickupPointName(pickupPointId),
                repo.getTotalOrders(pickupPointId),
                repo.getOrdersByStatus(pickupPointId),
                repo.getTotalRevenue(pickupPointId),
                repo.getTotalRefunds(pickupPointId),
                repo.getAvgOrderValue(pickupPointId),
                repo.getTopBooks(pickupPointId),
                repo.getAvgDeliveryHours(pickupPointId)
        );
    }

    private void validateAccess(int pickupPointId, Admin admin) {
        if (admin.getRole() == Role.WORKER) {
            if (admin.getPickUpPointId() == null) {
                throw new OrderException("Worker must be assigned to a pickup point");
            }
            if (admin.getPickUpPointId() != pickupPointId) {
                throw new OrderException("Access denied: not your pickup point");
            }
        }
    }
}