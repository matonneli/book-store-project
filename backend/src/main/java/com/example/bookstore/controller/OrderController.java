package com.example.bookstore.controller;

import com.example.bookstore.dto.OrderSummaryDto;
import com.example.bookstore.dto.OrderDetailDto;
import com.example.bookstore.model.Orders;
import com.example.bookstore.service.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/place")
    public ResponseEntity<Orders> placeOrder(
            @RequestHeader("Authorization") String token,
            @RequestBody PlaceOrderRequest request) {

        Orders order = orderService.createOrderFromCart(token, request.getPickupPoint());
        return ResponseEntity.ok(order);
    }

    @GetMapping("/my-orders")
    public ResponseEntity<Page<OrderSummaryDto>> getUserOrders(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<OrderSummaryDto> orders = orderService.getUserOrders(token, pageable);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}/details")
    public ResponseEntity<OrderDetailDto> getOrderDetails(
            @RequestHeader("Authorization") String token,
            @PathVariable Integer orderId) {

        OrderDetailDto orderDetail = orderService.getOrderDetails(orderId, token);
        return ResponseEntity.ok(orderDetail);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Orders> getOrderById(
            @RequestHeader("Authorization") String token,
            @PathVariable Integer orderId) {

        Orders order = orderService.getOrderById(orderId, token);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{orderId}/confirm-payment")
    public ResponseEntity<Orders> confirmPayment(@PathVariable Integer orderId) {
        Orders order = orderService.confirmPayment(orderId);
        return ResponseEntity.ok(order);
    }

    public static class PlaceOrderRequest {
        private String pickupPoint;

        public PlaceOrderRequest() {}

        public PlaceOrderRequest(String pickupPoint) {
            this.pickupPoint = pickupPoint;
        }

        public String getPickupPoint() {
            return pickupPoint;
        }

        public void setPickupPoint(String pickupPoint) {
            this.pickupPoint = pickupPoint;
        }
    }
}