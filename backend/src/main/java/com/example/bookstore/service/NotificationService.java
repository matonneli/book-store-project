package com.example.bookstore.service;

import com.example.bookstore.dto.NotificationAlertDto;
import com.example.bookstore.enums.OrderStatus;
import com.example.bookstore.model.Client;
import com.example.bookstore.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private static final List<OrderStatus> PICKUP_STATUSES =
            List.of(OrderStatus.READY_FOR_PICKUP, OrderStatus.READY_FOR_PICKUP_UNPAID);

    private final NotificationRepository notificationRepository;
    private final AuthService authService;

    public NotificationService(NotificationRepository notificationRepository,
                               AuthService authService) {
        this.notificationRepository = notificationRepository;
        this.authService = authService;
    }

    public NotificationAlertDto getAlerts(String token) {
        Client client = authService.getClientFromToken(token);
        int userId = client.getUserId();

        boolean hasReadyForPickup =
                notificationRepository.countReadyForPickupOrders(userId, PICKUP_STATUSES) > 0;

        boolean hasOverdueRentals =
                notificationRepository.countOverdueRentals(userId) > 0;

        return new NotificationAlertDto(hasReadyForPickup, hasOverdueRentals);
    }
}