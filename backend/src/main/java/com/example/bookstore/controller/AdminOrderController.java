package com.example.bookstore.controller;

import com.example.bookstore.dto.OrderAdminSummaryDto;
import com.example.bookstore.dto.OrderDetailDto;
import com.example.bookstore.enums.ItemStatus;
import com.example.bookstore.enums.OrderStatus;
import com.example.bookstore.model.Admin;
import com.example.bookstore.model.OrderItem;
import com.example.bookstore.model.Orders;
import com.example.bookstore.service.AdminAuthService;
import com.example.bookstore.service.OrderService;
import jakarta.servlet.http.HttpSession;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;
    private final AdminAuthService adminAuthService;

    public AdminOrderController(OrderService orderService, AdminAuthService adminAuthService) {
        this.orderService = orderService;
        this.adminAuthService = adminAuthService;
    }

    @GetMapping
    public ResponseEntity<Page<OrderAdminSummaryDto>> getOrders(
            @RequestParam(required = false) Integer orderId,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) Integer pickupPointId,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpSession session) {

        Admin admin = adminAuthService.requireStaffAccess(session);

        Page<OrderAdminSummaryDto> orders = orderService.getAdminOrders(
                orderId,
                email,
                status,
                pickupPointId,
                sortDirection,
                page,
                size,
                admin
        );

        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDetailDto> getOrderDetails(
            @PathVariable Integer orderId,
            HttpSession session) {

        Admin admin = adminAuthService.requireStaffAccess(session);
        OrderDetailDto orderDetails = orderService.getOrderDetailsForAdmin(orderId, admin);

        return ResponseEntity.ok(orderDetails);
    }


    @PatchMapping("/{orderId}/status")
    public ResponseEntity<Orders> updateOrderStatus(
            @PathVariable Integer orderId,
            @RequestBody Map<String, String> payload,
            HttpSession session) {

        Admin admin = adminAuthService.requireStaffAccess(session);

        String statusString = payload.get("status");
        if (statusString == null || statusString.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(statusString);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        Orders updatedOrder = orderService.updateOrderStatus(orderId, newStatus, admin);

        return ResponseEntity.ok(updatedOrder);
    }

    @PatchMapping("/items/{orderItemId}/status")
    public ResponseEntity<OrderItem> updateOrderItemStatus(
            @PathVariable Integer orderItemId,
            @RequestBody Map<String, String> payload,
            HttpSession session) {

        Admin admin = adminAuthService.requireStaffAccess(session);

        String statusString = payload.get("status");
        if (statusString == null || statusString.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        ItemStatus newStatus;
        try {
            newStatus = ItemStatus.valueOf(statusString);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        OrderItem updatedItem = orderService.updateOrderItemStatus(orderItemId, newStatus, admin);

        return ResponseEntity.ok().build();
    }
}