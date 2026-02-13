package com.example.bookstore.controller;

import com.example.bookstore.dto.OrderDetailDto;
import com.example.bookstore.dto.OrderSummaryDto;
import com.example.bookstore.exception.OrderException;
import com.example.bookstore.model.Orders;
import com.example.bookstore.service.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<OrderDetailDto> placeOrder(
            @RequestHeader("Authorization") String token,
            @RequestBody PlaceOrderRequest request) {
        if (request.getPickupPointId() == null) {
            throw new OrderException("Pickup point ID is required");
        }
        Orders order = orderService.createOrderFromCart(token, request.getPickupPointId());
        OrderDetailDto orderDetail = orderService.getOrderDetails(order.getOrderId(), token);
        return ResponseEntity.ok(orderDetail);
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
    public ResponseEntity<OrderDetailDto> getOrderById(
                                                        @RequestHeader("Authorization") String token,
                                                        @PathVariable Integer orderId) {
        OrderDetailDto orderDetail = orderService.getOrderDetails(orderId, token);
        return ResponseEntity.ok(orderDetail);
    }

    @PostMapping("/{orderId}/confirm-payment")
    public ResponseEntity<OrderDetailDto> confirmPayment( // ИЗМЕНЕНО: Orders -> OrderDetailDto
                                                          @PathVariable Integer orderId,
                                                          @RequestHeader("Authorization") String token) {
        Orders order = orderService.confirmPayment(orderId);
        OrderDetailDto orderDetail = orderService.getOrderDetails(order.getOrderId(), token);
        return ResponseEntity.ok(orderDetail);
    }

    @ExceptionHandler(OrderException.class)
    public ResponseEntity<String> handleOrderException(OrderException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    public static class PlaceOrderRequest {
        private Integer pickupPointId;

        public PlaceOrderRequest() {}

        public PlaceOrderRequest(Integer pickupPointId) {
            this.pickupPointId = pickupPointId;
        }

        public Integer getPickupPointId() {
            return pickupPointId;
        }

        public void setPickupPointId(Integer pickupPointId) {
            this.pickupPointId = pickupPointId;
        }
    }
}