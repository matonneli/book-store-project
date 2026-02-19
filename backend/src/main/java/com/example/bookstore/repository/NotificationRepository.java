package com.example.bookstore.repository;

import com.example.bookstore.enums.OrderStatus;
import com.example.bookstore.model.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Orders, Integer> {

    @Query("""
            SELECT COUNT(o) FROM Orders o
            WHERE o.userId = :userId
            AND o.status IN :statuses
            """)
    Long countReadyForPickupOrders(@Param("userId") int userId,
                                   @Param("statuses") List<OrderStatus> statuses);

    @Query("""
            SELECT COUNT(oi) FROM OrderItem oi
            JOIN Orders o ON oi.orderId = o.orderId
            WHERE o.userId = :userId
            AND oi.type = 'RENT'
            AND oi.itemStatus = 'OVERDUE'
            """)
    Long countOverdueRentals(@Param("userId") int userId);
}
