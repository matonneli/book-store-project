package com.example.bookstore.repository;

import com.example.bookstore.model.OrderItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    @Query("""
        SELECT oi, b.title, a.fullName, bi.imageUrl
        FROM OrderItem oi
        JOIN Book b ON b.bookId = oi.bookId
        JOIN Author a ON a.authorId = b.authorId
        LEFT JOIN BookImage bi ON bi.book.bookId = b.bookId
        WHERE oi.orderId = :orderId
        ORDER BY oi.orderItemId ASC
        """)
    List<Object[]> findOrderItemsWithBookAndAuthor(@Param("orderId") Integer orderId);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.orderId = :orderId")
    List<OrderItem> findByOrderId(@Param("orderId") Integer orderId);

    @Query("""
        SELECT oi, b.title, a.fullName, bi.imageUrl
        FROM OrderItem oi
        JOIN Orders o ON oi.orderId = o.orderId
        JOIN Book b ON b.bookId = oi.bookId
        JOIN Author a ON a.authorId = b.authorId
        LEFT JOIN BookImage bi ON bi.book.bookId = b.bookId
        WHERE o.userId = :userId AND oi.type = 'RENT'
        ORDER BY oi.orderItemId DESC
        """)
    Page<Object[]> findUserRentalItems(@Param("userId") int userId, Pageable pageable);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.type = 'RENT' " +
            "AND oi.itemStatus = 'RENTED' " +
            "AND oi.rentalEndAt < :currentTime")
    List<OrderItem> findOverdueRentals(
            @Param("currentTime") LocalDateTime currentTime
    );
}