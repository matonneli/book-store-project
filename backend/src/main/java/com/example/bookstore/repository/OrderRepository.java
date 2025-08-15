package com.example.bookstore.repository;

import com.example.bookstore.model.Orders;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Orders, Integer> {
    @Query("SELECT o FROM Orders o WHERE o.userId = :userId ORDER BY o.createdAt DESC")
    Page<Orders> findByUserIdOrderByCreatedAtDesc(@Param("userId") Integer userId, Pageable pageable);

    @Query("SELECT COUNT(oi) FROM OrderItem oi WHERE oi.orderId = :orderId")
    Integer countItemsByOrderId(@Param("orderId") Integer orderId);
}