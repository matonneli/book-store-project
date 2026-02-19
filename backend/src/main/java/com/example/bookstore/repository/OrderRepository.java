package com.example.bookstore.repository;

import com.example.bookstore.enums.OrderStatus;
import com.example.bookstore.model.Orders;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Orders, Integer> {
    @Query("SELECT o FROM Orders o WHERE o.userId = :userId ORDER BY o.createdAt DESC")
    Page<Orders> findByUserIdOrderByCreatedAtDesc(@Param("userId") Integer userId, Pageable pageable);

    @Query("SELECT o, p FROM Orders o LEFT JOIN PickUpPoint p ON o.pickupPointId = p.pickupPointId WHERE o.userId = :userId ORDER BY o.createdAt DESC")
    Page<Object[]> findByUserIdWithPickUpPoint(@Param("userId") Integer userId, Pageable pageable);

    @Query("SELECT COUNT(oi) FROM OrderItem oi WHERE oi.orderId = :orderId")
    Integer countItemsByOrderId(@Param("orderId") Integer orderId);

    @Query("""
    SELECT o, c.email FROM Orders o 
    JOIN Client c ON o.userId = c.clientId
    WHERE (:orderId IS NULL OR o.orderId = :orderId)
    AND (:email IS NULL OR c.email ILIKE %:email%)
    AND (:status IS NULL OR o.status = :status)
    AND (:pickupPointId IS NULL OR o.pickupPointId = :pickupPointId)
    """)
    Page<Object[]> findAllOrdersWithEmailAdmin(
            @Param("orderId") Integer orderId,
            @Param("email") String email,
            @Param("status") OrderStatus status,
            @Param("pickupPointId") Integer pickupPointId,
            Pageable pageable
    );

    @Query("SELECT o FROM Orders o WHERE o.createdAt < :deadlineDate AND o.status IN :statuses")
    List<Orders> findExpiredOrdersReadyForPickup(
            @Param("deadlineDate") LocalDateTime deadlineDate,
            @Param("statuses") List<OrderStatus> statuses
    );
}