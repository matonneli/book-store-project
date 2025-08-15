package com.example.bookstore.service;

import com.example.bookstore.dto.*;
import com.example.bookstore.enums.ItemStatus;
import com.example.bookstore.enums.OrderStatus;
import com.example.bookstore.exception.OrderException;
import com.example.bookstore.model.Book;
import com.example.bookstore.model.Client;
import com.example.bookstore.model.Orders;
import com.example.bookstore.model.OrderItem;
import com.example.bookstore.repository.BookRepository;
import com.example.bookstore.repository.OrderItemRepository;
import com.example.bookstore.repository.OrderRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartService cartService;
    private final AuthService authService;
    private final BookRepository bookRepository;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        CartService cartService,
                        AuthService authService,
                        BookRepository bookRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartService = cartService;
        this.authService = authService;
        this.bookRepository = bookRepository;
    }

    @Transactional
    public Orders createOrderFromCart(String token, String pickupPoint) {
        Client client = authService.getClientFromToken(token);
        CartDto cartDto = cartService.getCartContents(token);
        List<CartItemDto> cartItems = cartDto.getItems();

        validateCartNotEmpty(cartItems);
        validateAndUpdateStock(cartItems);

        BigDecimal totalPrice = calculateTotalPrice(cartItems);

        Orders order = createOrder(client, totalPrice, pickupPoint);
        order = orderRepository.save(order);

        createOrderItems(order.getOrderId(), cartItems);
        cartService.clearCart(token);

        return order;
    }

    public Orders getOrderById(Integer orderId, String token) {
        Client client = authService.getClientFromToken(token);
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderException("Order not found: " + orderId));

        validateUserAccess(order, client);
        return order;
    }

    @Transactional
    public Orders confirmPayment(Integer orderId) {
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderException("Order not found: " + orderId));
        if (order.getStatus() != OrderStatus.CREATED) {
            throw new OrderException("Order cannot be paid: invalid status");
        }
        order.setStatus(OrderStatus.PAID);
        order.setPaidAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    private void validateCartNotEmpty(List<CartItemDto> cartItems) {
        if (cartItems.isEmpty()) {
            throw new OrderException("Cannot create order: cart is empty");
        }
    }

    private void validateAndUpdateStock(List<CartItemDto> cartItems) {
        for (CartItemDto item : cartItems) {
            Book book = bookRepository.findById(item.getBookId())
                    .orElseThrow(() -> new OrderException("Book not found: " + item.getBookId()));

            if (book.getStockQuantity() <= 0) {
                throw new OrderException("Book out of stock: " + item.getBookId());
            }

            book.setStockQuantity(book.getStockQuantity() - 1);
            bookRepository.save(book);
        }
    }

    private BigDecimal calculateTotalPrice(List<CartItemDto> cartItems) {
        return cartItems.stream()
                .map(CartItemDto::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Orders createOrder(Client client, BigDecimal totalPrice, String pickupPoint) {
        Orders order = new Orders();
        order.setUserId(client.getUserId());
        order.setStatus(OrderStatus.CREATED);
        order.setTotalPrice(totalPrice);
        order.setPickUpPoint(pickupPoint);
        order.setCreatedAt(LocalDateTime.now());
        return order;
    }

    private void createOrderItems(Integer orderId, List<CartItemDto> cartItems) {
        for (CartItemDto cartItem : cartItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrderId(orderId);
            orderItem.setBookId(cartItem.getBookId());
            orderItem.setType(cartItem.getType());
            orderItem.setRentalDays(cartItem.getRentalDays());
            orderItem.setRentalStartAt(null);
            orderItem.setRentalEndAt(null);
            orderItem.setItemStatus(ItemStatus.PENDING);
            orderItemRepository.save(orderItem);
        }
    }

    public Page<OrderSummaryDto> getUserOrders(String token, Pageable pageable) {
        Client client = authService.getClientFromToken(token);
        Page<Orders> ordersPage = orderRepository.findByUserIdOrderByCreatedAtDesc(client.getUserId(), pageable);
        List<OrderSummaryDto> orderSummaries = new ArrayList<>();
        for (Orders order : ordersPage.getContent()) {
            OrderSummaryDto summary = new OrderSummaryDto();
            summary.setOrderId(order.getOrderId());
            summary.setStatus(order.getStatus());
            summary.setCreatedAt(order.getCreatedAt());
            summary.setPaidAt(order.getPaidAt());
            summary.setDeliveredAt(order.getDeliveredAt());
            summary.setPickUpPoint(order.getPickUpPoint());
            summary.setTotalPrice(order.getTotalPrice());

            Integer itemCount = orderRepository.countItemsByOrderId(order.getOrderId());
            summary.setItemCount(itemCount);

            orderSummaries.add(summary);
        }
        return new PageImpl<>(orderSummaries, pageable, ordersPage.getTotalElements());
    }

    public OrderDetailDto getOrderDetails(Integer orderId, String token) {
        Client client = authService.getClientFromToken(token);
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderException("Order not found: " + orderId));
        validateUserAccess(order, client);
        OrderDetailDto orderDetail = new OrderDetailDto();
        orderDetail.setOrderId(order.getOrderId());
        orderDetail.setStatus(order.getStatus());
        orderDetail.setCreatedAt(order.getCreatedAt());
        orderDetail.setPaidAt(order.getPaidAt());
        orderDetail.setDeliveredAt(order.getDeliveredAt());
        orderDetail.setPickUpPoint(order.getPickUpPoint());
        orderDetail.setTotalPrice(order.getTotalPrice());
        List<Object[]> rawItems = orderItemRepository.findOrderItemsWithBookAndAuthor(orderId);
        List<OrderItemDto> items = new ArrayList<>();

        for (Object[] raw : rawItems) {
            OrderItem orderItem = (OrderItem) raw[0];
            String bookTitle = (String) raw[1];
            String authorFullName = (String) raw[2];
            String imageUrl = (String) raw[3];
            OrderItemDto itemDto = new OrderItemDto();
            itemDto.setOrderItemId(orderItem.getOrderItemId());
            itemDto.setBookId(orderItem.getBookId());
            itemDto.setBookTitle(bookTitle);
            itemDto.setAuthorFullName(authorFullName);
            itemDto.setImageUrl(imageUrl);
            itemDto.setType(orderItem.getType());
            itemDto.setRentalDays(orderItem.getRentalDays());
            itemDto.setRentalStartAt(orderItem.getRentalStartAt());
            itemDto.setRentalEndAt(orderItem.getRentalEndAt());
            itemDto.setItemStatus(orderItem.getItemStatus());

            items.add(itemDto);
        }

        orderDetail.setItems(items);
        return orderDetail;
    }

    private void validateUserAccess(Orders order, Client client) {
        if (!order.getUserId().equals(client.getUserId())) {
            throw new OrderException("Access denied to order: " + order.getOrderId());
        }
    }
}