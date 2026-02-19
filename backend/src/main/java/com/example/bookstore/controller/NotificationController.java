package com.example.bookstore.controller;

import com.example.bookstore.dto.NotificationAlertDto;
import com.example.bookstore.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/alerts")
    public ResponseEntity<NotificationAlertDto> getAlerts(
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(notificationService.getAlerts(token));
    }
}