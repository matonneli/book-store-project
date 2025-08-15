package com.example.bookstore.controller;

import com.example.bookstore.model.Orders;
import com.example.bookstore.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final OrderService orderService;

    public PaymentController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/mock")
    public ResponseEntity<String> mockPayment(@RequestParam Integer orderId) {
        Orders order = orderService.confirmPayment(orderId);
        return ResponseEntity.ok("Payment confirmed for order " + order.getOrderId());
    }
}