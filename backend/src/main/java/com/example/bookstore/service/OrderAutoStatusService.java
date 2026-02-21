package com.example.bookstore.service;

import com.example.bookstore.enums.ItemStatus;
import com.example.bookstore.enums.OrderStatus;
import com.example.bookstore.model.OrderItem;
import com.example.bookstore.model.Orders;
import com.example.bookstore.repository.OrderItemRepository;
import com.example.bookstore.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderAutoStatusService {

    private static final Logger log = LoggerFactory.getLogger(OrderAutoStatusService.class);

    private static final int PICKUP_DEADLINE_DAYS = 14;

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final BookService bookService;

    public OrderAutoStatusService(OrderRepository orderRepository,
                                  OrderItemRepository orderItemRepository,
                                  BookService bookService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.bookService = bookService;
    }

    @Scheduled(fixedDelay = 600000)
    @Transactional
    public void cancelExpiredOrders() {
        log.info("Starting scheduled task: cancelExpiredOrders");

        LocalDateTime deadlineDate = LocalDateTime.now().minusDays(PICKUP_DEADLINE_DAYS);
        List<Orders> expiredOrders = orderRepository.findExpiredOrdersReadyForPickup(
                deadlineDate,
                List.of(OrderStatus.READY_FOR_PICKUP, OrderStatus.READY_FOR_PICKUP_UNPAID)
        );

        log.info("Found {} expired orders to cancel", expiredOrders.size());

        int cancelledCount = 0;
        for (Orders order : expiredOrders) {
            try {
                cancelOrderByDeadline(order);
                cancelledCount++;
            } catch (Exception e) {
                log.error("Failed to cancel order {}: {}", order.getOrderId(), e.getMessage(), e);
            }
        }

        log.info("Scheduled task completed: cancelled {}/{} orders", cancelledCount, expiredOrders.size());
    }
    public void cancelOrderByDeadline(Orders order) {
        log.info("Cancelling order {} due to pickup deadline (created at: {})",
                order.getOrderId(), order.getCreatedAt());
        OrderStatus newStatus = (order.getPaidAt() != null)
                ? OrderStatus.CANCELLED_BY_DEADLINE_PAID
                : OrderStatus.CANCELLED_BY_DEADLINE_UNPAID;
        order.setStatus(newStatus);
        orderRepository.save(order);
        returnBooksToStockAndCancelItems(order.getOrderId());
        log.info("Order {} cancelled with status: {}", order.getOrderId(), newStatus);
    }

    private void returnBooksToStockAndCancelItems(Integer orderId) {
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);

        for (OrderItem item : orderItems) {
            if (item.getItemStatus() == ItemStatus.PENDING) {
                bookService.incrementBookStock(item.getBookId(), 1);
                log.debug("Returned book {} to stock for order {}", item.getBookId(), orderId);
            }

            item.setItemStatus(ItemStatus.CANCELLED);
        }

        orderItemRepository.saveAll(orderItems);
    }

    @Scheduled(fixedDelay = 600000)
    @Transactional
    public void markOverdueRentals() {
        log.info("Starting scheduled task: markOverdueRentals");

        LocalDateTime now = LocalDateTime.now();
        List<OrderItem> overdueItems = orderItemRepository.findOverdueRentals(now);
        log.info("Found {} overdue rental items", overdueItems.size());
        int updatedCount = 0;
        for (OrderItem item : overdueItems) {
            try {
                item.setItemStatus(ItemStatus.OVERDUE);

                log.debug("Marked rental item {} as OVERDUE (book: {}, rentalEndAt: {})",
                        item.getOrderItemId(), item.getBookId(), item.getRentalEndAt());
                updatedCount++;
            } catch (Exception e) {
                log.error("Failed to mark item {} as overdue: {}",
                        item.getOrderItemId(), e.getMessage(), e);
            }
        }
        if (!overdueItems.isEmpty()) {
            orderItemRepository.saveAll(overdueItems);
        }
        log.info("Scheduled task completed: marked {}/{} items as OVERDUE",
                updatedCount, overdueItems.size());
    }


}