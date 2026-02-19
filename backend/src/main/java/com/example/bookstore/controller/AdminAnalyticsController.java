package com.example.bookstore.controller;

import com.example.bookstore.dto.AnalyticsOverallDto;
import com.example.bookstore.dto.AnalyticsPeriodDto;
import com.example.bookstore.dto.AnalyticsPickupPointDto;
import com.example.bookstore.model.Admin;
import com.example.bookstore.service.AdminAnalyticsPickupPointService;
import com.example.bookstore.service.AdminAnalyticsService;
import com.example.bookstore.service.AdminAuthService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
public class AdminAnalyticsController {

    private final AdminAnalyticsService service;
    private final AdminAnalyticsPickupPointService pickupPointService;
    private final AdminAuthService adminAuthService;


    public AdminAnalyticsController(AdminAnalyticsService service,
                                    AdminAnalyticsPickupPointService pickupPointService, AdminAuthService adminAuthService) {
        this.service = service;
        this.pickupPointService = pickupPointService;
        this.adminAuthService = adminAuthService;
    }

    /**
     * GET /api/analytics/overview
     * All-time statistics. ADMIN only.
     */
    @GetMapping("/overview")
    public ResponseEntity<AnalyticsOverallDto> getOverview(HttpSession session) {
        adminAuthService.requireAdminRole(session);
        return ResponseEntity.ok(service.getOverall());
    }

    /**
     * GET /api/analytics/period?days=7
     * GET /api/analytics/period?days=30
     * Period statistics. ADMIN only.
     */
    @GetMapping("/period")
    public ResponseEntity<AnalyticsPeriodDto> getPeriod(
            @RequestParam(defaultValue = "30") int days,
            HttpSession session) {
        adminAuthService.requireAdminRole(session);
        return ResponseEntity.ok(service.getPeriod(days));
    }

    @GetMapping("/pickup-point")
    public ResponseEntity<AnalyticsPickupPointDto> getPickupPointStats(
            @RequestParam int pickupPointId,
            HttpSession session) {
        Admin admin = adminAuthService.requireStaffAccess(session);
        return ResponseEntity.ok(pickupPointService.getStats(pickupPointId, admin));
    }
}
