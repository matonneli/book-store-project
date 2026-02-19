package com.example.bookstore.service;

import com.example.bookstore.dto.*;
import com.example.bookstore.enums.ItemStatus;
import com.example.bookstore.enums.ItemType;
import com.example.bookstore.enums.OrderStatus;
import com.example.bookstore.enums.Role;
import com.example.bookstore.exception.OrderException;
import com.example.bookstore.model.*;
import com.example.bookstore.repository.BookRepository;
import com.example.bookstore.repository.OrderItemRepository;
import com.example.bookstore.repository.OrderRepository;
import com.example.bookstore.repository.PickUpPointRepository;
import org.springframework.data.domain.*;
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
    private final PickUpPointRepository pickUpPointRepository;
    private final PickUpPointService pickUpPointService;
    private final BookService bookService;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        CartService cartService,
                        AuthService authService,
                        BookRepository bookRepository,
                        PickUpPointRepository pickUpPointRepository,
                        PickUpPointService pickUpPointService,
                        BookService bookService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartService = cartService;
        this.authService = authService;
        this.bookRepository = bookRepository;
        this.pickUpPointRepository = pickUpPointRepository;
        this.pickUpPointService = pickUpPointService;
        this.bookService = bookService;
    }

    @Transactional
    public Orders createOrderFromCart(String token, Integer pickupPointId) {
        Client client = authService.getClientFromToken(token);
        CartDto cartDto = cartService.getCartContents(token);
        List<CartItemDto> cartItems = cartDto.getItems();

        validateCartNotEmpty(cartItems);
        validateAndUpdateStock(cartItems);

        pickUpPointRepository.findById(pickupPointId)
                .filter(point -> Boolean.TRUE.equals(point.getIsActive()))
                .orElseThrow(() -> new OrderException("Invalid or inactive pickup point: " + pickupPointId));

        BigDecimal totalPrice = calculateTotalPrice(cartItems);

        Orders order = createOrder(client, totalPrice, pickupPointId);
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

    private Orders createOrder(Client client, BigDecimal totalPrice, Integer pickupPointId) {
        Orders order = new Orders();
        order.setUserId(client.getUserId());
        order.setStatus(OrderStatus.CREATED);
        order.setTotalPrice(totalPrice);
        order.setPickUpPoint(pickupPointId);
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
        Page<Object[]> ordersPage = orderRepository.findByUserIdWithPickUpPoint(client.getUserId(), pageable);
        List<OrderSummaryDto> orderSummaries = new ArrayList<>();
        for (Object[] result : ordersPage.getContent()) {
            Orders order = (Orders) result[0];
            PickUpPoint pickUpPoint = (PickUpPoint) result[1];
            OrderSummaryDto summary = new OrderSummaryDto();
            summary.setOrderId(order.getOrderId());
            summary.setStatus(order.getStatus());
            summary.setCreatedAt(order.getCreatedAt());
            summary.setPaidAt(order.getPaidAt());
            summary.setDeliveredAt(order.getDeliveredAt());
            summary.setRefundedAt(order.getRefundedAt());
            summary.setPickUpPoint(pickUpPoint != null ? pickUpPointService.mapToDto(pickUpPoint) : null);
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

        return assembleOrderDetailDto(order);
    }

    public OrderDetailDto getOrderDetailsForAdmin(Integer orderId, Admin admin) {
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderException("Order not found: " + orderId));

        validateAdminAccess(order, admin);

        return assembleOrderDetailDto(order);
    }

    private OrderDetailDto assembleOrderDetailDto(Orders order) {
        OrderDetailDto orderDetail = new OrderDetailDto();
        orderDetail.setOrderId(order.getOrderId());
        orderDetail.setStatus(order.getStatus());
        orderDetail.setCreatedAt(order.getCreatedAt());
        orderDetail.setPaidAt(order.getPaidAt());
        orderDetail.setDeliveredAt(order.getDeliveredAt());
        orderDetail.setRefundedAt(order.getRefundedAt());
        PickUpPointDto pickUpPoint = pickUpPointRepository.findById(order.getPickUpPoint())
                .map(pickUpPointService::mapToDto)
                .orElseThrow(() -> new OrderException("Pickup point not found: " + order.getPickUpPoint()));
        orderDetail.setPickUpPoint(pickUpPoint);
        orderDetail.setTotalPrice(order.getTotalPrice());
        List<Object[]> rawItems = orderItemRepository.findOrderItemsWithBookAndAuthor(order.getOrderId());
        List<OrderItemDto> items = new ArrayList<>();

        for (Object[] raw : rawItems) {
            OrderItem orderItem = (OrderItem) raw[0];
            OrderItemDto itemDto = new OrderItemDto();
            itemDto.setOrderItemId(orderItem.getOrderItemId());
            itemDto.setBookId(orderItem.getBookId());
            itemDto.setBookTitle((String) raw[1]);
            itemDto.setAuthorFullName((String) raw[2]);
            itemDto.setImageUrl((String) raw[3]);
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

    public Page<OrderAdminSummaryDto> getAdminOrders(
            Integer orderId,
            String email,
            OrderStatus status,
            Integer pickupPointId,
            String sortDirection,
            int page,
            int size,
            Admin admin) {

        Sort sort = sortDirection.equalsIgnoreCase("asc")
                ? Sort.by("createdAt").ascending()
                : Sort.by("createdAt").descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Integer effectivePickupPointId = determineEffectivePickupPointId(admin, pickupPointId);

        Integer effectiveOrderId = orderId;
        String effectiveEmail = email;
        if (admin.getRole() == Role.WORKER) {
            if (orderId != null) {
                Orders order = orderRepository.findById(orderId).orElse(null);
                if (order == null || !order.getPickUpPoint().equals(admin.getPickUpPointId())) {
                    return Page.empty(pageable);
                }
            }
        }

        Page<Object[]> ordersPage = orderRepository.findAllOrdersWithEmailAdmin(
                effectiveOrderId,
                effectiveEmail,
                status,
                effectivePickupPointId,
                pageable
        );

        return ordersPage.map(result -> {
            Orders order = (Orders) result[0];
            String userEmail = (String) result[1];
            return mapToAdminSummaryDto(order, userEmail);
        });
    }

    private Integer determineEffectivePickupPointId(Admin admin, Integer requestedPickupPointId) {
        if (admin.getRole() == Role.ADMIN) {
            return requestedPickupPointId;
        } else if (admin.getRole() == Role.WORKER) {
            return admin.getPickUpPointId();
        }
        return requestedPickupPointId;
    }

    private void validateAdminAccess(Orders order, Admin admin) {
        if (admin.getRole() == Role.WORKER) {
            if (admin.getPickUpPointId() == null) {
                throw new OrderException("Worker must be assigned to a pickup point");
            }

            if (!order.getPickUpPoint().equals(admin.getPickUpPointId())) {
                throw new OrderException("Access denied: order belongs to different pickup point");
            }
        }
    }

    private OrderSummaryDto mapToSummaryDto(Orders order) {
        OrderSummaryDto dto = new OrderSummaryDto();
        dto.setOrderId(order.getOrderId());
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setPaidAt(order.getPaidAt());
        dto.setDeliveredAt(order.getDeliveredAt());
        dto.setRefundedAt(order.getRefundedAt());
        dto.setTotalPrice(order.getTotalPrice());

        if (order.getPickUpPoint() != null) {
            pickUpPointRepository.findById(order.getPickUpPoint())
                    .ifPresent(p -> dto.setPickUpPoint(pickUpPointService.mapToDto(p)));
        }

        dto.setItemCount(orderRepository.countItemsByOrderId(order.getOrderId()));
        return dto;
    }

    private OrderAdminSummaryDto mapToAdminSummaryDto(Orders order, String userEmail) {
        OrderAdminSummaryDto dto = new OrderAdminSummaryDto();
        dto.setOrderId(order.getOrderId());
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setPaidAt(order.getPaidAt());
        dto.setDeliveredAt(order.getDeliveredAt());
        dto.setRefundedAt(order.getRefundedAt());
        dto.setTotalPrice(order.getTotalPrice());
        dto.setUserId(order.getUserId());
        dto.setEmail(userEmail);
        if (order.getPickUpPoint() != null) {
            pickUpPointRepository.findById(order.getPickUpPoint())
                    .ifPresent(p -> dto.setPickUpPoint(pickUpPointService.mapToDto(p)));
        }

        dto.setItemCount(orderRepository.countItemsByOrderId(order.getOrderId()));
        return dto;
    }

    @Transactional
    public Orders updateOrderStatus(Integer orderId, OrderStatus newStatus, Admin admin) {
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderException("Order not found: " + orderId));

        validateAdminAccess(order, admin);
        if (isCancelledStatus(order.getStatus())) {
            throw new OrderException("Cannot change status of cancelled order");
        }
        OrderStatus previousStatus = order.getStatus();
        order.setStatus(newStatus);
        if (newStatus == OrderStatus.PAID && order.getPaidAt() == null) {
            order.setPaidAt(LocalDateTime.now());
        } else if (newStatus == OrderStatus.DELIVERED && order.getDeliveredAt() == null) {
            order.setDeliveredAt(LocalDateTime.now());
            updateOrderItemsOnDelivery(orderId);
        } else if (newStatus == OrderStatus.DELIVERED_AND_PAID && order.getDeliveredAt() == null) {
            order.setDeliveredAt(LocalDateTime.now());
            if (order.getPaidAt() == null) {
                order.setPaidAt(LocalDateTime.now());
            }
            updateOrderItemsOnDelivery(orderId);
        } else if (newStatus == OrderStatus.CANCELLED) {
            returnBooksToStock(orderId);
        }
        if (isStatusRollback(previousStatus, newStatus)) {
            handleStatusRollback(order, newStatus, orderId);
        }

        return orderRepository.save(order);
    }
    private boolean isStatusRollback(OrderStatus from, OrderStatus to) {
        if ((from == OrderStatus.DELIVERED || from == OrderStatus.DELIVERED_AND_PAID)
                && (to != OrderStatus.DELIVERED && to != OrderStatus.DELIVERED_AND_PAID && to != OrderStatus.RETURNED)) {
            return true;
        }
        if (from == OrderStatus.PAID && to == OrderStatus.CREATED) {
            return true;
        }
        return false;
    }

    private void handleStatusRollback(Orders order, OrderStatus newStatus, Integer orderId) {
        if (newStatus != OrderStatus.DELIVERED && newStatus != OrderStatus.DELIVERED_AND_PAID && newStatus != OrderStatus.RETURNED) {
            order.setDeliveredAt(null);
            rollbackOrderItems(orderId);
        }
        if (newStatus == OrderStatus.CREATED) {
            order.setPaidAt(null);
        }
    }

    @Transactional
    public void rollbackOrderItems(Integer orderId) {
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);

        for (OrderItem item : orderItems) {
            item.setItemStatus(ItemStatus.PENDING);
            if (item.getType() == ItemType.RENT) {
                item.setRentalStartAt(null);
                item.setRentalEndAt(null);
            }

            orderItemRepository.save(item);
        }
    }

    @Transactional
    public void updateOrderItemsOnDelivery(Integer orderId) {
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
        LocalDateTime now = LocalDateTime.now();

        for (OrderItem item : orderItems) {
            if (item.getType() == ItemType.BUY) {
                item.setItemStatus(ItemStatus.DELIVERED);
            } else if (item.getType() == ItemType.RENT) {
                item.setItemStatus(ItemStatus.RENTED);
                item.setRentalStartAt(now);

                if (item.getRentalDays() != null && item.getRentalDays() > 0) {
                    item.setRentalEndAt(now.plusDays(item.getRentalDays() + 1));
                }
            }

            orderItemRepository.save(item);
        }
    }

    @Transactional
    public void returnBooksToStock(Integer orderId) {
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);

        for (OrderItem item : orderItems) {
            bookService.incrementBookStock(item.getBookId(), 1);
            item.setItemStatus(ItemStatus.CANCELLED);
            orderItemRepository.save(item);
        }
    }

    @Transactional
    public OrderItem updateOrderItemStatus(Integer orderItemId, ItemStatus newStatus, Admin admin) {
        OrderItem orderItem = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new OrderException("Order item not found: " + orderItemId));
        Orders order = orderRepository.findById(orderItem.getOrderId())
                .orElseThrow(() -> new OrderException("Order not found: " + orderItem.getOrderId()));
        validateAdminAccess(order, admin);
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new OrderException("Cannot change status of items in cancelled order");
        }
        if (newStatus == ItemStatus.RETURNED) {
            if (orderItem.getType() != ItemType.RENT) {
                throw new OrderException("RETURNED status is only applicable to rented items");
            }
            if (orderItem.getItemStatus() != ItemStatus.RENTED && orderItem.getItemStatus() != ItemStatus.OVERDUE) {
                throw new OrderException("Item must be RENTED or OVERDUE before marking as RETURNED");
            }
            bookService.incrementBookStock(orderItem.getBookId(), 1);
            orderItem.setRentalEndAt(LocalDateTime.now());
        }

        orderItem.setItemStatus(newStatus);
        return orderItemRepository.save(orderItem);
    }

    private void validateUserAccess(Orders order, Client client) {
        if (!order.getUserId().equals(client.getUserId())) {
            throw new OrderException("Access denied to order: " + order.getOrderId());
        }
    }

    @Transactional
    public Orders cancelOrderByUser(Integer orderId, String token) {
        Client client = authService.getClientFromToken(token);
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderException("Order not found: " + orderId));

        validateUserAccess(order, client);
        validateOrderCanBeCancelled(order);

        OrderStatus newStatus = (order.getPaidAt() != null)
                ? OrderStatus.CANCELLED_BY_USER_PAID
                : OrderStatus.CANCELLED_BY_USER_UNPAID;

        order.setStatus(newStatus);
        orderRepository.save(order);

        returnBooksToStock(orderId);

        return order;
    }

    private void validateOrderCanBeCancelled(Orders order) {
        if (isCancelledStatus(order.getStatus())) {
            throw new OrderException("Order is already cancelled");
        }
        if (order.getStatus() == OrderStatus.DELIVERED
                || order.getStatus() == OrderStatus.DELIVERED_AND_PAID
                || order.getStatus() == OrderStatus.RETURNED) {
            throw new OrderException("Cannot cancel delivered order");
        }
    }

    private boolean isCancelledStatus(OrderStatus status) {
        return status == OrderStatus.CANCELLED
                || status == OrderStatus.CANCELLED_BY_USER_PAID
                || status == OrderStatus.CANCELLED_BY_USER_UNPAID
                || status == OrderStatus.CANCELLED_BY_DEADLINE_PAID
                || status == OrderStatus.CANCELLED_BY_DEADLINE_UNPAID;
    }

    @Transactional
    public Orders processRefund(Integer orderId, String token) {
        Client client = authService.getClientFromToken(token);
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderException("Order not found: " + orderId));

        validateUserAccess(order, client);
        validateRefundEligibility(order);

        order.setRefundedAt(LocalDateTime.now());
        orderRepository.save(order);

        return order;
    }

    private void validateRefundEligibility(Orders order) {
        if (!isCancelledStatus(order.getStatus())) {
            throw new OrderException("Only cancelled orders are eligible for refund");
        }
        if (order.getPaidAt() == null) {
            throw new OrderException("Cannot refund unpaid order");
        }
        if (order.getRefundedAt() != null) {
            throw new OrderException("Order has already been refunded");
        }
    }
}